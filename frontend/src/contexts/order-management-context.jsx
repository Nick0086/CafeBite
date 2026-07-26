import { createContext, useContext, useReducer, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { format } from "date-fns";
import { authApi, handleApiError } from '@/utils/api';
import { toastError, toastSuccess } from '@/utils/toast-utils';

const OrderStateContext = createContext(null);
const OrderDispatchContext = createContext(null);
const OrderHistoryContext = createContext(null);

const initialState = {
    orderItems: [],
    total: 0,
    isOrderDrawerOpen: false,
    isSubmitting: false
};

function readPersistedOrder() {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem('restaurantOrder');
        const parsed = raw ? JSON.parse(raw) : null;
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function orderReducer(state, action) {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingItemIndex = state.orderItems.findIndex(
                item => item.id === action.payload.id
            );

            if (existingItemIndex > -1) {
                const updatedItems = [...state.orderItems];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + 1
                };

                return {
                    ...state,
                    orderItems: updatedItems,
                    total: calculateTotal(updatedItems)
                };
            } else {
                const newItem = { ...action.payload, quantity: 1 };

                return {
                    ...state,
                    orderItems: [...state.orderItems, newItem],
                    total: calculateTotal([...state.orderItems, newItem])
                };
            }
        }

        case 'REMOVE_ITEM': {
            const existingItemIndex = state.orderItems.findIndex(
                item => item.id === action.payload.id
            );

            if (existingItemIndex > -1) {
                const updatedItems = [...state.orderItems];

                if (updatedItems[existingItemIndex].quantity > 1) {
                    updatedItems[existingItemIndex] = {
                        ...updatedItems[existingItemIndex],
                        quantity: updatedItems[existingItemIndex].quantity - 1
                    };
                } else {
                    updatedItems.splice(existingItemIndex, 1);
                }

                return {
                    ...state,
                    orderItems: updatedItems,
                    total: calculateTotal(updatedItems)
                };
            }
            return state;
        }

        case 'CLEAR_ORDER':
            return {
                ...state,
                orderItems: [],
                total: 0
            };

        case 'TOGGLE_ORDER_DRAWER':
            return {
                ...state,
                isOrderDrawerOpen: !state.isOrderDrawerOpen
            };

        case 'SET_SUBMITTING':
            return {
                ...state,
                isSubmitting: action.payload
            };

        default:
            return state;
    }
}

function calculateTotal(items) {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

export const submitOrderRequest = async (payload, { signal } = {}) => {
    try {
        const response = await authApi.post('/orders', payload, { signal });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const OrderProvider = ({ children }) => {
    const [state, dispatch] = useReducer(orderReducer, initialState, (init) => {
        const restored = readPersistedOrder();
        return { ...init, orderItems: restored, total: calculateTotal(restored) };
    });
    const abortRef = useRef(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem('restaurantOrder', JSON.stringify(state.orderItems));
        } catch (error) {
            console.warn('Order persistence failed:', error);
        }
    }, [state.orderItems]);

    useEffect(() => () => {
        abortRef.current?.abort();
    }, []);

    const addItem = useCallback((item) => {
        dispatch({ type: 'ADD_ITEM', payload: item });
        toastSuccess(`${item.name} added to your order`);
    }, []);

    const removeItem = useCallback((item) => {
        dispatch({ type: 'REMOVE_ITEM', payload: item });
    }, []);

    const clearOrder = useCallback(() => {
        dispatch({ type: 'CLEAR_ORDER' });
    }, []);

    const toggleOrderDrawer = useCallback(() => {
        dispatch({ type: 'TOGGLE_ORDER_DRAWER' });
    }, []);

    const submitOrder = useCallback(async (tableId, restaurantId) => {
        if (state.orderItems.length === 0) {
            toastError('Cannot place an empty order');
            return;
        }

        if (state.isSubmitting) return;

        dispatch({ type: 'SET_SUBMITTING', payload: true });
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        const orderData = {
            restaurantId,
            tableId,
            items: state.orderItems.map(item => ({
                itemId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                veg_status: item.veg_status
            })),
            total: state.total
        };

        try {
            const data = await submitOrderRequest(orderData, { signal: abortRef.current.signal });
            clearOrder();
            toggleOrderDrawer();
            toastSuccess(`Order placed successfully. Order ID: ${data?.orderId ?? ''}`);
        } catch (err) {
            if (err?.name === 'CanceledError' || err?.name === 'AbortError') return;
            toastError(err?.err?.message || 'Failed to place your order. Please try again.');
        } finally {
            dispatch({ type: 'SET_SUBMITTING', payload: false });
        }
    }, [state.orderItems, state.total, state.isSubmitting, clearOrder, toggleOrderDrawer]);

    const dispatchValue = useMemo(() => ({
        addItem,
        removeItem,
        clearOrder,
        toggleOrderDrawer,
        submitOrder,
    }), [addItem, removeItem, clearOrder, toggleOrderDrawer, submitOrder]);

    return (
        <OrderStateContext.Provider value={state}>
            <OrderDispatchContext.Provider value={dispatchValue}>
                {children}
            </OrderDispatchContext.Provider>
        </OrderStateContext.Provider>
    );
};

export const useOrderState = () => {
    const ctx = useContext(OrderStateContext);
    if (!ctx) throw new Error('useOrderState must be used within an OrderProvider');
    return ctx;
};

export const useOrderDispatch = () => {
    const ctx = useContext(OrderDispatchContext);
    if (!ctx) throw new Error('useOrderDispatch must be used within an OrderProvider');
    return ctx;
};

export const useOrder = () => {
    const state = useOrderState();
    const dispatch = useOrderDispatch();
    return useMemo(() => ({ ...state, ...dispatch }), [state, dispatch]);
};

function readOrderHistory(key) {
    if (typeof window === 'undefined') return {};
    try {
        const raw = localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : null;
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
        return {};
    }
}

export const OrderHistoryProvider = ({ restaurantId, tableId, children }) => {
    const storageKey = `order_${restaurantId}_${tableId}`;
    const [orderHistory, setOrderHistory] = useState(() => readOrderHistory(storageKey));

    useEffect(() => {
        setOrderHistory(readOrderHistory(storageKey));
    }, [storageKey]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (Object.keys(orderHistory).length > 0) {
            try {
                localStorage.setItem(storageKey, JSON.stringify(orderHistory));
            } catch (error) {
                console.warn('Order history persistence failed:', error);
            }
        }
    }, [orderHistory, storageKey]);

    const addItem = useCallback((item) => {
        setOrderHistory((prevItems) => ({
            ...prevItems,
            [format(new Date(), 'dd-MM-yyyy HH:mm:ss.SSS')]: item
        }));
    }, []);

    const clearOrder = useCallback(() => {
        setOrderHistory({});
    }, []);

    const value = useMemo(() => ({ orderHistory, clearOrder, addItem }), [orderHistory, clearOrder, addItem]);

    return (
        <OrderHistoryContext.Provider value={value}>
            {children}
        </OrderHistoryContext.Provider>
    );
};

export const useOrderHistory = () => {
    const context = useContext(OrderHistoryContext);
    if (!context) {
        throw new Error('useOrderHistory must be used within an OrderHistoryProvider');
    }
    return context;
};
