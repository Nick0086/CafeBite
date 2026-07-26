import { createContext, useCallback, useMemo, useState } from 'react'

export const PermissionsContext = createContext({
    isSuperAdmin: false,
    permissions: null,
    updatePermissions: () => {},
});

export const PermissionsProvider = ({ children }) => {
    const [permissions, setPermissions] = useState(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    const updatePermissions = useCallback((newPermissions) => {
        setPermissions(newPermissions);
        setIsSuperAdmin(newPermissions?.unique_id === import.meta.env.VITE_BASE_SUPER_ADMIN_ID);
    }, []);

    const value = useMemo(
        () => ({ isSuperAdmin, permissions, updatePermissions }),
        [isSuperAdmin, permissions, updatePermissions]
    );

    return (
        <PermissionsContext.Provider value={value}>
            {children}
        </PermissionsContext.Provider>
    )
}
