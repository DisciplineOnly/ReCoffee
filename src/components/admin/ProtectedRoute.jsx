import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function ProtectedRoute() {
    const [session, setSession] = useState(null);
    const [sessionLoaded, setSessionLoaded] = useState(false);
    const [isAdmin, setIsAdmin] = useState(null); // null = not checked yet

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setSessionLoaded(true);
        });

        // NOTE: no awaited Supabase queries inside this callback — the client
        // holds an auth lock during it and awaiting a query deadlocks.
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Customer accounts also authenticate via Supabase, so a session alone is
    // not enough — admin membership is checked against admin_users.
    // (RLS is the real enforcement; this only controls routing/UI.)
    useEffect(() => {
        if (!session) {
            setIsAdmin(null);
            return;
        }
        let cancelled = false;
        supabase
            .from('admin_users')
            .select('user_id')
            .eq('user_id', session.user.id)
            .maybeSingle()
            .then(({ data, error }) => {
                if (cancelled) return;
                // Pre-migration fallback: if the table doesn't exist yet, keep
                // the old behavior where any authenticated user is admin.
                setIsAdmin(error ? true : !!data);
            });
        return () => {
            cancelled = true;
        };
    }, [session]);

    const loading = !sessionLoaded || (session && isAdmin === null);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/admin/login" replace />;
    }

    if (!isAdmin) {
        // Logged-in customer, not staff — send them to their account page.
        return <Navigate to="/account" replace />;
    }

    return <Outlet />;
}
