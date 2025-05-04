import React, { createContext, useState, useEffect, useMemo } from 'react'
import PulsatingDots from "@/components/ui/loaders/PulsatingDots";
import { getClientData } from '@/service/user.service';
import { useQuery } from '@tanstack/react-query';

export const PermissionsContext = createContext()

export const PermissionsProvider = ({ children }) => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);

    const updatePermissions = (newPermissions) => {
        setPermissions(newPermissions);
    };

    const { data: userData, isLoading: userViolation, error, isFetching } = useQuery({
        queryKey: ['userData'],
        queryFn: getClientData,
    });

    useEffect(() => {
        if (userData) {
            updatePermissions(userData?.data);
        }
        if(error){
            // toastError('Failed to fetch user data',JSON.stringify(error));
        }
    }, [userData, error]);


    return (
        <PermissionsContext.Provider value={{ permissions, updatePermissions, loading, setLoading }}>
            {(userViolation || isFetching) ?
                <div className="flex justify-center items-center h-screen bg-surface-background">
                    <PulsatingDots size={5} />
                </div> :
                children}
        </PermissionsContext.Provider>
    )
}
