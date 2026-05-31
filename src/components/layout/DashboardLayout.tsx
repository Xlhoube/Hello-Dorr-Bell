import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LogOut, LayoutDashboard, Settings, Video, Bell, Menu, Building2, UsersRound, Smartphone, ChevronDown } from 'lucide-react';
import { InstallModal } from '../modals/InstallModal';

import { Logo } from '../ui/Logo';
import { LanguageSelector } from '../ui/LanguageSelector';
import packageJson from '../../../package.json';
import { useTranslation } from 'react-i18next';
import { subscribeUserToPush } from '../../lib/push';
import { useToast } from '../ui/Toast';


export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { pathname } = useLocation();
    const [profile, setProfile] = useState<any>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [newVisitorAlert, setNewVisitorAlert] = useState<any>(null);
    const [showInstallModal, setShowInstallModal] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);


    // States for Google OAuth Onboarding - Automatic now
    const [isSubmittingOrg, setIsSubmittingOrg] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                navigate('/login');
            } else {
                // Fetch profile to show in header
                supabase.auth.getUser().then(({ data: { user } }) => {
                    if (user) {
                        supabase.from('profiles').select('*').eq('id', user.id).single()
                            .then(({ data, error }) => {
                                if (error && error.code === 'PGRST116') {
                                    const urlParams = new URLSearchParams(window.location.search);
                                    const inviteToken = urlParams.get('invite');

                                    const findInvite = async () => {
                                        if (inviteToken) {
                                            const { data: inviteByToken } = await supabase.from('team_invitations').select('*').eq('token', inviteToken).single();
                                            if (inviteByToken) return inviteByToken;
                                        }
                                        const { data: inviteByEmail } = await supabase.from('team_invitations').select('*').eq('email', user.email).single();
                                        return inviteByEmail;
                                    };

                                    findInvite().then((invite) => {
                                        if (invite) {
                                            supabase.from('profiles').upsert({
                                                id: user.id,
                                                organization_id: invite.organization_id,
                                                role: invite.role || 'resident',
                                                full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Utente',
                                                avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
                                                email: user.email
                                            }).then(() => {
                                                supabase.from('team_invitations').delete().eq('id', invite.id).then(() => {
                                                    window.location.href = '/dashboard';
                                                });
                                            });
                                    } else {
                                            // Automate Org Creation if no invite
                                            handleAutoCreateOrganization(user);
                                        }
                                    });
                                } else if (data) {
                                    setProfile(data);


                                    const googleName = user.user_metadata?.full_name || user.user_metadata?.name;
                                    const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
                                    
                                    const needsUpdate = (googleAvatar && data.avatar_url !== googleAvatar) || 
                                                         (googleName && data.full_name !== googleName);

                                    if (needsUpdate) {
                                        const updates: any = {};
                                        if (googleAvatar) updates.avatar_url = googleAvatar;
                                        if (googleName) updates.full_name = googleName;

                                        supabase.from('profiles').update(updates).eq('id', user.id).then(() => {
                                            setProfile((prev: any) => ({ ...prev, ...updates }));
                                        });
                                    }
                                }
                            });

                        // Interceção de Primeiro Login (Help Desk Auto-Launch)
                        const tutorialKey = `hello_onboarding_v2_${user.id}`;
                        if (!localStorage.getItem(tutorialKey)) {
                            setShowOnboarding(true);
                        }

                    }
                });
            }
        });

        const {
            data: { subscription: authSub },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) navigate('/login');
        });

        // Solicitar Permissão p/ Notificações Desktop e Configurar PWA Push
        if ("Notification" in window) {
            if (Notification.permission === "default") {
                Notification.requestPermission();
            }
        }

        return () => authSub.unsubscribe();
    }, [navigate]);

    // Lógica de Subscrição PWA Push (Background)
    useEffect(() => {
        if (!profile?.id) return;

        if (profile?.push_notifications !== false) {
            subscribeUserToPush().catch(console.error);
        }
    }, [profile?.id, profile?.push_notifications]);

    const [pendingCount, setPendingCount] = useState(0);

    // Listener Global p/ Novos Visitantes (Notificações em Tempo Real)
    useEffect(() => {
        if (!profile?.organization_id) return;

        // Fetch inicial do contador de pendentes
        supabase.from('visitors')
            .select('id', { count: 'exact' })
            .eq('organization_id', profile.organization_id)
            .eq('status', 'pending')
            .then(({ count }) => setPendingCount(count || 0));

        console.log("📡 [Realtime] Initializing Channel for Org:", profile.organization_id);
        const visitorSub = supabase
            .channel(`org_alerts_${profile.organization_id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'visitors',
                filter: `organization_id=eq.${profile.organization_id}`
            }, (payload) => {
                const newData = payload.new as any;
                const oldData = payload.old as any;
                
                const showAlert = (data: any) => {
                    if (profile?.push_notifications !== false && data.status === 'pending') {
                        setNewVisitorAlert(data);
                        try {
                            const doorbellSound = profile?.doorbell_sound || localStorage.getItem('hello-doorbell-sound') || '/Ring01.mp3';
                            const audio = new Audio(doorbellSound);
                            audio.play().catch(() => {});
                        } catch(e) {}
                        if ("Notification" in window && Notification.permission === "granted") {
                            new Notification(t('common.push_notifications.doorbell_title'), {
                                body: t('common.push_notifications.doorbell_body', { 
                                    name: data.visitor_name || 'Visitante', 
                                    unit: data.unit_name || 'Unidade' 
                                }),
                                icon: '/logo.png'
                            });
                        }
                    }
                };

                if (payload.eventType === 'INSERT') {
                    if (newData.status === 'pending') setPendingCount((prev: number) => prev + 1);
                    showAlert(newData);
                } else if (payload.eventType === 'UPDATE') {
                    if (newData.status === 'pending') {
                        console.log("🔔 [Realtime] Re-ringing for visitor:", newData.visitor_name);
                        showAlert(newData);
                    } else {
                        setNewVisitorAlert((prev: any) => prev?.id === newData.id ? null : prev);
                    }
                    if (oldData?.status === 'pending' && newData.status !== 'pending') {
                        setPendingCount((prev: number) => Math.max(0, prev - 1));
                    } else if (oldData?.status !== 'pending' && newData.status === 'pending') {
                        setPendingCount((prev: number) => prev + 1);
                    }
                } else if (payload.eventType === 'DELETE') {
                    setNewVisitorAlert((prev: any) => prev?.id === payload.old.id ? null : prev);
                    if (payload.old.status === 'pending') {
                        setPendingCount((prev: number) => Math.max(0, prev - 1));
                    }
                }
            })
            .subscribe((status) => {
                console.log("🔌 [Realtime] Channel status:", status);
            });

        return () => {
            console.log("🔌 [Realtime] Cleaning up channel for Org:", profile.organization_id);
            supabase.removeChannel(visitorSub);
        };
    }, [profile?.organization_id, profile?.doorbell_sound, profile?.push_notifications, navigate, t]);

    const handleAcceptVisitor = async (visitor: any) => {
        try {
            console.log("🛠️ [Dashboard] Attempting to ACCEPT visitor via RPC:", visitor.id);
            const { error } = await supabase.rpc('update_visitor_status', {
                visitor_id: visitor.id,
                new_status: 'approved'
            });
            
            if (error) {
                console.error('❌ [Dashboard] RPC Error Detail:', error);
                showToast(`Erro ao aceitar: ${error.message}`, 'error');
                return;
            }

            console.log("✅ [Dashboard] Visitor approved via RPC");
            setNewVisitorAlert(null);
            navigate(`/dashboard/visitors?chat=${visitor.id}`);
        } catch (error) {
            console.error('❌ [Dashboard] Unexpected error:', error);
            showToast(t('common.save_error'), 'error');
        }
    };

    const handleRejectVisitor = async (visitorId: string) => {
        try {
            console.log("🛠️ [Dashboard] Attempting to REJECT visitor via RPC:", visitorId);
            const { error } = await supabase.rpc('update_visitor_status', {
                visitor_id: visitorId,
                new_status: 'rejected'
            });

            if (error) {
                console.error('❌ [Dashboard] RPC Error Detail:', error);
                showToast(`Erro ao recusar: ${error.message}`, 'error');
                return;
            }

            setNewVisitorAlert(null);
        } catch (error) {
            console.error('❌ [Dashboard] Unexpected error:', error);
            showToast(t('common.save_error'), 'error');
        }
    };


    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const handleAutoCreateOrganization = async (user: any) => {
        if (isSubmittingOrg) return;
        setIsSubmittingOrg(true);

        try {
            console.log("🏢 [Dashboard] A preparar sistema de acesso para o utilizador:", user.id);
            const orgName = `Sistema de ${user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Acesso'}`;

            const { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .insert([{ name: orgName }])
                .select()
                .single();

            if (orgError) throw orgError;

            const gName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Admin';
            const gAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    organization_id: orgData.id,
                    role: 'super_admin',
                    full_name: gName,
                    avatar_url: gAvatar
                });

            if (profileError) throw profileError;
            setProfile((prev: any) => ({ ...prev, organization_id: orgData.id, role: 'super_admin' }));
        } catch (error: any) {
            console.error('Error auto-creating access system:', error);
        } finally {
            setIsSubmittingOrg(false);
        }
    };

    return (
        <>
            <div className="flex h-screen bg-[var(--bg-main)] text-[var(--text-primary)] overflow-hidden">


            {/* Sidebar (Mockup Pixel-Perfect) */}
            <aside
                className={`fixed lg:relative h-full w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-dim)] transition-all duration-500 ease-in-out z-50 flex flex-col overflow-hidden
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                {/* Logo Section */}
                <div className="flex items-start px-10 pt-12 pb-16">
                    <Logo size="lg" className="!items-start" />
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 flex flex-col">
                    <div className="space-y-4">
                        {[
                            { to: '/dashboard', label: t('nav.home'), icon: LayoutDashboard },
                            { to: '/dashboard/properties', label: t('nav.properties'), icon: Building2 },
                            { to: '/dashboard/visitors', label: t('nav.visitors'), icon: Video },
                            { to: '/dashboard/residents', label: t('nav.residents'), icon: UsersRound },
                            { to: '/dashboard/settings', label: t('nav.settings'), icon: Settings },
                        ].map((item) => {
                            const active = item.to === '/dashboard' ? pathname === '/dashboard' : pathname.includes(item.to);
                            return (
                                <div key={item.to} className="relative group">
                                    <Link
                                        to={item.to}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-5 px-10 py-3 transition-all relative
                                            ${active 
                                                ? 'text-[var(--text-primary)] bg-[var(--primary-glow)]/30' 
                                                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)]/50'}`}
                                    >
                                        {/* Active Indicator Bar */}
                                        {active && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4F46E5] rounded-r-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"></div>
                                        )}
                                        
                                        <item.icon className={`w-5 h-5 transition-colors flex-shrink-0 ${active ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`} />
                                        <span className="text-sm font-semibold tracking-tight whitespace-nowrap">{item.label}</span>
                                    </Link>

                                    {/* Onboarding Hint for Properties */}
                                    {showOnboarding && item.to === '/dashboard/properties' && (
                                        <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 w-48 p-4 bg-indigo-600 rounded-2xl shadow-2xl z-[70] animate-bounce-x">
                                            <p className="text-[11px] text-white font-bold leading-tight">
                                                {t('onboarding.hint_properties')}
                                            </p>
                                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-indigo-600" />
                                        </div>
                                    )}
                                </div>

                            );
                        })}
                    </div>

                    {/* Install PWA Button */}
                    <div className="px-10 py-4">
                        <button
                            onClick={() => setShowInstallModal(true)}
                            className="w-full flex items-center gap-5 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors text-sm font-semibold tracking-tight group"
                        >
                            <Smartphone className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
                            {t('pwa.install_btn')}
                        </button>
                    </div>

                    {/* Help Link */}
                    <div className="px-10 pb-4">
                        <Link
                            to="/dashboard/help"
                            className="flex items-center gap-5 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors text-sm font-semibold tracking-tight group"
                        >
                            <svg className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            {t('nav.help', 'Help')}
                        </Link>
                    </div>

                    {/* Simple Logout at the bottom */}
                    <div className="mt-auto p-10">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-5 text-[var(--text-muted)] hover:text-red-500 transition-colors text-sm font-semibold tracking-tight group"
                        >
                            <LogOut className="w-5 h-5 opacity-60 group-hover:opacity-100" />
                            {t('nav.logout')}
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content Area - Fluid & Organic */}
            <div className="flex-1 flex flex-col glass-floating !rounded-[2.5rem] overflow-hidden border-white/5 shadow-2xl">
                {/* Header (Premium Mockup Style) */}
                <header className="h-16 lg:h-24 flex items-center justify-between px-4 sm:px-12 border-b border-[var(--border-dim)] bg-[var(--bg-sidebar)] sticky top-0 z-40">
                    <div className="flex items-center gap-6">
                        <button
                            className="lg:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-10">
                        {/* Search Bar - Mockup Placeholder Style */}
                        <div className="hidden md:flex items-center px-5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-dim)] rounded-2xl w-64 group focus-within:border-[var(--primary)] transition-all relative cursor-help">
                             <span className="text-[var(--text-muted)] text-xs font-medium">Search...</span>
                             
                             {/* Tooltip Balloon */}
                             <div className="absolute top-full left-0 mt-4 w-64 p-4 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none translate-y-2 group-hover:translate-y-0">
                                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[2px] mb-1">{t('search.suggestion')}</p>
                                 <p className="text-[11px] text-zinc-300 leading-relaxed">
                                     {t('search.hint')} <span className="text-white font-bold">{t('search.visitors')}</span>, <span className="text-white font-bold">{t('search.collaborators')}</span> ou <span className="text-white font-bold">{t('search.locations')}</span>.
                                 </p>
                                 {/* Arrow */}
                                 <div className="absolute -top-1.5 left-6 w-3 h-3 bg-zinc-900/90 border-t border-l border-white/10 rotate-45"></div>
                             </div>
                        </div>

                        <div className="flex items-center gap-6">
                            {/* Notification Bell */}
                            <Link to="/dashboard/visitors" className="relative p-2.5 bg-[var(--bg-main)] border border-[var(--border-dim)] text-[var(--text-secondary)] hover:text-[var(--primary)] transition-all rounded-xl shadow-sm hover:shadow-md">
                                <Bell className="w-5 h-5" />
                                {pendingCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-[var(--bg-sidebar)] animate-pulse">
                                        {pendingCount}
                                    </span>
                                )}
                            </Link>

                            {/* Language Selector */}
                            <LanguageSelector />

                            {/* Profile Dropdown Lookalike */}
                            <div className="flex items-center gap-3 p-1 pl-1 pr-4 bg-[var(--bg-main)] border border-[var(--border-dim)] rounded-2xl cursor-pointer hover:shadow-md transition-all group overflow-hidden">
                                <div className="w-10 h-10 rounded-xl bg-[var(--primary-glow)] border border-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-sm overflow-hidden shadow-sm">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        profile?.full_name?.charAt(0).toUpperCase() || 'U'
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <p className="text-[12px] font-black text-[var(--text-primary)] leading-none mb-0.5 truncate uppercase tracking-tight">{profile?.full_name?.split(' ')[0] || 'User'}</p>
                                    <div className="flex items-center gap-1">
                                        <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-slate-500/10 text-slate-500">
                                            Free
                                        </span>
                                    </div>
                                </div>
                                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors ml-1 hidden sm:block" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content Container */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-10 custom-scrollbar bg-[var(--bg-main)]">
                    <div className="max-w-[1600px] mx-auto w-full flex flex-col min-h-full">
                        <div className="flex-1 animate-in fade-in slide-in-from-bottom-5 duration-700">


                            {children}
                        </div>
                        
                        {/* Global Footer (Refined) */}
                        <footer className="mt-20 pt-12 border-t border-white/5 flex flex-col items-center opacity-60 hover:opacity-100 transition-opacity pb-16 text-center">
                            <div className="flex flex-col items-center gap-6">
                                <Logo size="sm" className="mb-6 opacity-80" />

                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[4px]">
                                    © {new Date().getFullYear()} HELLO — v{packageJson.version}
                                </p>
                            </div>
                        </footer>
                    </div>
                </main>
            </div>

        </div>

        {/* Alerta Visual de Visita (Fora do container p/ evitar clipping) */}
        {newVisitorAlert && (
                <div className="visitor-alert-overlay">
                    <div className="visitor-alert-content !bg-zinc-950/80 !backdrop-blur-2xl !border-indigo-500/30 !rounded-[2.5rem] !shadow-indigo-500/10">
                        <div className="flex items-center gap-6">
                            <div className="alert-pulse-icon !bg-indigo-500/20 !border-indigo-500/30">
                                <UsersRound className="w-8 h-8 text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[4px] mb-1">{t('common.push_notifications.doorbell_title')}</p>
                                <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                                    {newVisitorAlert.visitor_name}
                                </h4>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 mt-6">
                            <button 
                                onClick={() => handleAcceptVisitor(newVisitorAlert)}
                                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[3px] hover:bg-indigo-500 transition-all text-center border-none cursor-pointer shadow-xl shadow-indigo-950/40 active:scale-95"
                            >
                                Aceitar Chamada
                            </button>
                            <button 
                                onClick={() => handleRejectVisitor(newVisitorAlert.id)}
                                className="text-zinc-500 text-[10px] font-black uppercase tracking-[3px] hover:text-red-400 transition-colors border-none bg-transparent cursor-pointer py-2"
                            >
                                Recusar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal de Instalação PWA */}
            <InstallModal 
                isOpen={showInstallModal} 
                onClose={() => setShowInstallModal(false)} 
            />

            {/* Sistema de Onboarding Interativo */}
            {showOnboarding && (
                <div className="fixed inset-0 z-[60] pointer-events-none">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-auto" onClick={() => {
                        localStorage.setItem(`hello_onboarding_v2_${profile?.id}`, 'true');
                        setShowOnboarding(false);
                    }} />
                    
                    {/* Welcome Tooltip (Centered) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 p-8 bg-zinc-900 border border-white/10 rounded-[2rem] shadow-2xl pointer-events-auto animate-in fade-in zoom-in duration-500">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6">
                            <Logo size="sm" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{t('onboarding.welcome_title')}</h3>
                        <p className="text-sm text-zinc-400 leading-relaxed mb-6">{t('onboarding.welcome_desc')}</p>
                        <button 
                            onClick={() => {
                                localStorage.setItem(`hello_onboarding_v2_${profile?.id}`, 'true');
                                setShowOnboarding(false);
                            }}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
                        >
                            {t('onboarding.understood')}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
