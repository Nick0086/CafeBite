import React, { createContext, useState } from 'react'

export const PermissionsContext = createContext()

export const PermissionsProvider = ({ children }) => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSuperAdmin,setIsSuperAdmin] = useState(false);

    const updatePermissions = (newPermissions) => {
        setPermissions(newPermissions);
        setIsSuperAdmin(newPermissions?.unique_id === import.meta.env.VITE_BASE_SUPER_ADMIN_ID);
    };


    return (
        <PermissionsContext.Provider value={{isSuperAdmin,  permissions, updatePermissions, loading, setLoading }}>
            {children}
        </PermissionsContext.Provider>
    )
}
