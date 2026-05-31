import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { User, Bell, Palette, Save, Moon, Sun, Monitor, Play, Volume2, Check, BellRing, Star, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { subscribeUserToPush } from '../../lib/push';
import { useToast } from '../../components/ui/Toast';

export function Settings() {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [swState, setSwState] = useState<{ status: string; color: string }>({ status: '...', color: 'text-yellow-500' });
    const [profile, setProfile] = useState<any>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState<'perfil' | 'aparencia' | 'notificacoes' | 'impressao'>('perfil');

    useEffect(() => {
        fetchProfile();
        checkSW();
    }, []);

    const checkSW = async () => {
        if (!('serviceWorker' in navigator)) {
            setSwState({ status: 'NOT SUPPORTED', color: 'text-red-500' });
            return;
        }
        const regs = await navigator.serviceWorker.getRegistrations();
        if (regs.length === 0) {
            setSwState({ status: 'NONE', color: 'text-red-400' });
        } else {
            const reg = regs[0];
            const stateText = reg.active ? 'ACTIVE' : 'INACTIVE';
            setSwState({ status: stateText, color: reg.active ? 'text-green-500' : 'text-yellow-500' });
        }
    };

    const fetchProfile = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            setProfile(data);


        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error } = await supabase.from('profiles').update({
                    full_name: profile.full_name,
                    phone: profile.phone,
                    push_notifications: profile.push_notifications,
                    whatsapp_notifications: profile.whatsapp_notifications,
                    email_notifications: profile.email_notifications,
                    doorbell_sound: profile.doorbell_sound || '/Ring01.mp3',
                    qr_template: profile.qr_template || 'classic',
                }).eq('id', user.id);

                if (!error) {
                    showToast(t('common.save_success'), 'success');
                } else {
                    showToast(t('common.save_error'), 'error');
                }
            }
        } catch (error) {
            showToast(t('common.save_error'), 'error');
        } finally {
            setSaving(false);
        }
    };

    const sections = [
        { id: 'perfil', label: t('settings.sections.profile'), icon: User },
        { id: 'aparencia', label: t('settings.sections.appearance'), icon: Palette },
        { id: 'notificacoes', label: t('settings.sections.notifications'), icon: Bell },
        { id: 'impressao', label: t('settings.sections.qr_print'), icon: Palette },
    ];

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-2 mb-10 px-4">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-[var(--primary)] to-indigo-400 rounded-full"></div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Dashboard | {t('settings.title')}</h1>
                </div>
                <p className="text-sm text-[var(--text-secondary)] font-medium">{t('settings.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                <div className="lg:col-span-1 space-y-2">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            type="button"
                            onClick={() => setActiveSection(section.id as any)}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all text-[10px] uppercase tracking-widest ${activeSection === section.id
                                ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-dim)]/50'
                                }`}
                        >
                            <section.icon className="w-4 h-4" />
                            {section.label}
                        </button>
                    ))}
                </div>

                <div className="lg:col-span-3">
                    <div className="glass-panel !p-6 sm:!p-10">
                        <form onSubmit={handleSave}>
                            {activeSection === 'perfil' && (
                                <div className="space-y-12">
                                    <div className="flex items-center gap-10">
                                        <div className="w-32 h-32 rounded-[2.5rem] bg-[var(--bg-main)] border-2 border-[var(--border-dim)] flex items-center justify-center text-4xl font-black text-[var(--text-primary)] overflow-hidden shadow-inner">
                                            {profile?.full_name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-[var(--text-primary)] mb-2 uppercase">{t('settings.profile.photo')}</h3>
                                            <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest">{t('settings.profile.upload_desc')}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[3px]">{t('settings.profile.full_name')}</label>
                                            <input
                                                type="text"
                                                value={profile?.full_name || ''}
                                                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                                className="input-field"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[3px]">{t('settings.profile.role')}</label>
                                            <input type="text" value={profile?.role === 'super_admin' ? t('common.super_admin') : t('common.resident')} disabled className="input-field opacity-50 cursor-not-allowed" />
                                        </div>
                                    </div>

                                    {/* Support Project Card */}
                                    <div className="p-8 rounded-[2rem] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-6 group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-inner group-hover:scale-110 transition-transform">
                                                <Star className="w-7 h-7 fill-indigo-500/20" />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[3px] mb-1">{t('landing.support.badge', 'Apoio')}</p>
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight m-0">
                                                        {t('landing.support.title_highlight', 'Apoia o Hello')}
                                                    </h4>
                                                </div>
                                            </div>
                                        </div>
                                        <a 
                                            href="https://www.buymeacoffee.com/hellodoorbell" 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[2px] transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center gap-2"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            {t('landing.support.button', 'Apoiar no Buy Me a Coffee')}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'aparencia' && (
                                <div className="space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {[
                                            { id: 'dark', label: t('settings.appearance.dark'), icon: Moon, desc: t('settings.appearance.dark_desc') },
                                            { id: 'light', label: t('settings.appearance.light'), icon: Sun, desc: t('settings.appearance.light_desc') },
                                            { id: 'system', label: t('settings.appearance.system'), icon: Monitor, desc: t('settings.appearance.system_desc') },
                                        ].map((theme) => {
                                            const isSelected = (localStorage.getItem('hello-theme') || 'light') === theme.id;
                                            return (
                                                <button
                                                    key={theme.id}
                                                    type="button"
                                                    onClick={() => {
                                                        localStorage.setItem('hello-theme', theme.id);
                                                        document.documentElement.classList.toggle('dark', theme.id === 'dark');
                                                        setProfile({ ...profile });
                                                    }}
                                                    className={`p-6 sm:p-10 rounded-[2.5rem] border-2 transition-all text-center flex flex-col items-center gap-6 group ${isSelected ? 'bg-blue-600/10 border-blue-500 shadow-glow-sm' : 'bg-[var(--bg-main)] border-[var(--border-dim)] hover:border-blue-500/50'}`}
                                                >
                                                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform ${isSelected ? 'bg-blue-600 text-white' : 'bg-[var(--bg-card)] text-blue-500 border border-[var(--border-highlight)]'}`}>
                                                        <theme.icon className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-black text-[var(--text-primary)] uppercase mb-1">{theme.label}</p>
                                                        <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest">{theme.desc}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="space-y-6">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-[3px]">{t('settings.appearance.language')}</label>
                                        <div className="flex flex-wrap gap-4">
                                            {['pt', 'en', 'fr', 'es'].map((langId) => {
                                                const isSelected = (localStorage.getItem('hello-language') || 'en') === langId;
                                                return (
                                                    <button
                                                        key={langId}
                                                        type="button"
                                                        onClick={() => {
                                                            localStorage.setItem('hello-language', langId);
                                                            import('../../lib/i18n').then(m => m.default.changeLanguage(langId));
                                                            setProfile({ ...profile });
                                                        }}
                                                        className={`px-8 py-4 rounded-2xl text-sm font-bold border transition-all ${isSelected ? 'bg-blue-600 text-white border-blue-500 shadow-glow-sm' : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border-dim)] hover:text-[var(--text-primary)]'}`}
                                                    >
                                                        {langId === 'pt' ? 'Português' : langId === 'en' ? 'English' : langId === 'fr' ? 'Français' : 'Español'}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'notificacoes' && (
                                <div className="space-y-10">
                                    {[
                                        { id: 'push_notifications', label: t('settings.notifications.push'), desc: t('settings.notifications.push_desc') },
                                        { id: 'email_notifications', label: t('settings.notifications.email'), desc: t('settings.notifications.email_desc') },
                                    ].map((n) => (
                                        <div 
                                            key={n.id} 
                                            onClick={async () => {
                                                const newValue = !profile?.[n.id];
                                                setProfile({ ...profile, [n.id]: newValue });
                                                if (n.id === 'push_notifications' && newValue) await subscribeUserToPush().catch(console.error);
                                            }}
                                            className="flex items-center justify-between p-8 rounded-3xl bg-[var(--bg-main)] border border-[var(--border-dim)] hover:bg-[var(--border-dim)] transition-all cursor-pointer group"
                                        >
                                            <div>
                                                <h4 className="text-lg font-bold mb-1">{n.label}</h4>
                                                <p className="text-sm text-[var(--text-muted)]">{n.desc}</p>
                                            </div>
                                            <div className={`w-14 h-8 rounded-full p-1 transition-colors ${profile?.[n.id] ? 'bg-blue-600' : 'bg-slate-700'}`}>
                                                <div className={`w-6 h-6 bg-white rounded-full transition-transform ${profile?.[n.id] ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                    ))}

                                    <div className="p-10 bg-[var(--bg-main)] border border-[var(--border-dim)] rounded-[2.5rem] flex flex-col gap-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex flex-col">
                                                <h4 className="text-sm font-bold text-[var(--text-primary)] tracking-tight !mb-0">{t('settings.notifications.sound_title')}</h4>
                                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider mt-1">{t('settings.notifications.doorbell_sound')}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[9px] font-black uppercase text-[var(--text-muted)]">PWA Status</span>
                                                    <span className={`text-[10px] font-bold ${swState.color}`}>{swState.status}</span>
                                                </div>
                                                <BellRing className="w-5 h-5 text-blue-500 opacity-40" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {[
                                                { id: 'ring01', label: 'Hello Ring 1', url: '/Ring01.mp3' },
                                                { id: 'ring02', label: 'Hello Ring 2', url: '/Ring02.mp3' },
                                                { id: 'ring03', label: 'Hello Ring 3', url: '/Ring03.mp3' },
                                            ].map((sound) => {
                                                const currentSound = profile?.doorbell_sound || localStorage.getItem('hello-doorbell-sound') || '/Ring01.mp3';
                                                const isSelected = currentSound === sound.url;
                                                return (
                                                    <div
                                                        key={sound.id}
                                                        onClick={() => {
                                                            setProfile({ ...profile, doorbell_sound: sound.url });
                                                            localStorage.setItem('hello-doorbell-sound', sound.url);
                                                        }}
                                                        className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between group cursor-pointer ${isSelected ? 'bg-blue-600/10 border-blue-500' : 'bg-[var(--bg-main)] border-[var(--border-dim)] hover:border-blue-500/50'}`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)] group-hover:text-blue-500'}`}>
                                                                <Volume2 className="w-5 h-5" />
                                                            </div>
                                                            <span className="font-bold text-[var(--text-primary)] uppercase tracking-tight">{sound.label}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                new Audio(sound.url).play();
                                                            }}
                                                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-blue-400 border border-transparent hover:border-blue-500/30"
                                                        >
                                                            <Play className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'impressao' && (
                                <div className="space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {['classic', 'dark', 'minimal', 'corporate'].map((tmplId) => {
                                            const isSelected = (profile?.qr_template || 'classic') === tmplId;
                                            return (
                                                <button
                                                    key={tmplId}
                                                    type="button"
                                                    onClick={() => setProfile({ ...profile, qr_template: tmplId })}
                                                    className={`p-8 rounded-[2.5rem] border-2 transition-all text-left flex flex-col gap-6 group overflow-hidden ${isSelected ? 'bg-blue-600/10 border-blue-500 shadow-glow-sm' : 'bg-[var(--bg-main)] border-[var(--border-dim)] hover:border-blue-500/50'}`}
                                                >
                                                    <div className="w-full h-40 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-dim)] flex items-center justify-center relative overflow-hidden">
                                                        {isSelected && <div className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"><Check className="w-4 h-4 text-white" /></div>}
                                                        <span className="uppercase text-[10px] font-black opacity-30 tracking-widest">{tmplId} preview</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xl font-black text-[var(--text-primary)] uppercase mb-1 tracking-tight">{tmplId.toUpperCase()}</p>
                                                        <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest">{t(`settings.qr_print.templates.${tmplId}.desc`)}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="mt-16 flex justify-end gap-6 pt-12 border-t border-[var(--border-dim)]">
                                <button type="button" className="px-10 py-5 rounded-2xl text-sm font-bold text-[var(--text-muted)] transition-all uppercase tracking-widest">{t('common.cancel')}</button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm uppercase tracking-[3px] shadow-2xl transition-all flex items-center gap-3 disabled:opacity-50"
                                >
                                    {saving ? <Check className="w-5 h-5 animate-pulse" /> : <Save className="w-5 h-5" />}
                                    {t('common.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
