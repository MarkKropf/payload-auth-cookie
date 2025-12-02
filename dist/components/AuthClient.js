'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
/**
 * Creates a new Auth client with its own Context, Provider, and Hook.
 * This is useful when you have multiple auth scopes (e.g., 'admin' and 'app') in the same application.
 * 
 * @param slug - Optional slug to identify the context (useful for debugging)
 */ // eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createAuthClient = (slug)=>{
    const Context = /*#__PURE__*/ createContext(null);
    if (slug) {
        Context.displayName = `AuthContext(${slug})`;
    }
    /**
   * AuthProvider component to provide the user session to the application
   */ const AuthProvider = ({ children, user: initialUser })=>{
        const [user, setUser] = useState(initialUser);
        // Update local state if the server-provided user changes
        useEffect(()=>{
            setUser(initialUser);
        }, [
            initialUser
        ]);
        return /*#__PURE__*/ React.createElement(Context.Provider, {
            value: {
                user,
                setUser
            }
        }, children);
    };
    /**
   * Hook to access the current user session
   */ const useAuth = ()=>{
        const context = useContext(Context);
        if (context === null) {
            throw new Error(`useAuth must be used within an AuthProvider${slug ? ` for ${slug}` : ''}`);
        }
        return context;
    };
    return {
        AuthProvider,
        useAuth,
        Context
    };
};
// Create a default client for general use
const defaultClient = createAuthClient();
export const AuthProvider = defaultClient.AuthProvider;
export const useAuth = defaultClient.useAuth;
