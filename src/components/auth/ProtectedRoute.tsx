import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        // Bypass para testes solicitado pelo utilizador
        if (window.location.search.includes('bypass=true')) {
            setIsAuthenticated(true);
            return;
        }

        let mounted = true;

        // Função para verificar sessão com retry ou espera
        async function checkSession() {
            const { data: { session } } = await supabase.auth.getSession();
            if (mounted) {
                if (session) {
                    setIsAuthenticated(true);
                } else {
                    // Pequena espera antes de desistir totalmente (evita race conditions em PWA)
                    setTimeout(async () => {
                        const { data: { session: retrySession } } = await supabase.auth.getSession();
                        if (mounted) setIsAuthenticated(!!retrySession);
                    }, 500);
                }
            }
        }

        checkSession();

        // Listen for realtime auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (mounted) {
                console.log("🔐 Auth Event:", event);
                setIsAuthenticated(!!session);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // While checking session state
    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    // Require Auth
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Render child routes
    return <Outlet />;
}
