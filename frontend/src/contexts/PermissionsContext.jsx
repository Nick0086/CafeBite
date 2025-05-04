import React, { createContext, useState } from 'react'

export const PermissionsContext = createContext()

export const PermissionsProvider = ({ children }) => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);

    const updatePermissions = (newPermissions) => {
        setPermissions(newPermissions);
    };


    return (
        <PermissionsContext.Provider value={{ permissions, updatePermissions, loading, setLoading }}>
            {children}
        </PermissionsContext.Provider>
    )
}
