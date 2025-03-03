import { useContext, createContext, type PropsWithChildren, useEffect, useState } from 'react';
import { useStorageState } from '../hooks/useStorageState';
import { supabase } from '../lib/supabase';

const AuthContext = createContext<{
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    session?: string | null;
    isLoading: boolean;
}>({
    signIn: async () => {},
    signOut: async () => {},
    session: null,
    isLoading: false,
});

export function useSession() {
    const value = useContext(AuthContext);
    if (!value) {
        throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
    return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
    const [[isLoading, session], setSession] = useStorageState<string | null>('session');

    useEffect(() => {
        // Obtener la sesión actual
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session ? JSON.stringify(session) : null);
        });

        // Escuchar cambios en la sesión
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session ? JSON.stringify(session) : null);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);
        setSession(data.session ? JSON.stringify(data.session) : null);
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{ signIn, signOut, session, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}
