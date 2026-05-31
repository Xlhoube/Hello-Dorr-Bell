import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { BookOpen, Key, Users, QrCode, Video, ArrowRight, PlusCircle, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export function Help() {
    const { t } = useTranslation();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPwaBanner, setShowPwaBanner] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPwaBanner(true);
        };
        window.addEventListener('beforeinstallprompt', handler);

        // Show banner on mobile even if prompt isn't available (manual instructions)
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (isMobile && !isStandalone) {
            setShowPwaBanner(true);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setShowPwaBanner(false);
            }
            setDeferredPrompt(null);
        }
    };

    return (
        <DashboardLayout>
            {/* PWA Install Banner */}
            {showPwaBanner && (
                <div className="mb-8 px-4">
                    <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 border border-indigo-500/30 rounded-2xl p-6 shadow-lg">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-bl-full -z-10"></div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 flex-shrink-0">
                                <Download className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{t('help.pwa_banner.title')}</h3>
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{t('help.pwa_banner.description')}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--bg-main)]/60 border border-[var(--border-dim)] rounded-lg text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                        📱 {t('help.pwa_banner.step1')}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--bg-main)]/60 border border-[var(--border-dim)] rounded-lg text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                        ⊕ {t('help.pwa_banner.step2')}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--bg-main)]/60 border border-[var(--border-dim)] rounded-lg text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                        🔔 {t('help.pwa_banner.step3')}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                {deferredPrompt && (
                                    <button onClick={handleInstall} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/30 active:scale-95">
                                        {t('help.pwa_banner.install_btn')}
                                    </button>
                                )}
                                <button onClick={() => setShowPwaBanner(false)} className="px-3 py-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-bold transition-colors">
                                    ✕
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-2 mb-10 px-4">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-[var(--primary)] to-indigo-400 rounded-full"></div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">{t('help.title')}</h1>
                </div>
                <p className="text-sm text-[var(--text-secondary)] font-medium">{t('help.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">

                {/* Step 1: Properties & Units */}
                <div className="glass-panel !p-6 relative overflow-hidden group hover:border-[var(--primary)]/30 transition-all bg-[var(--bg-sidebar)]/30">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--primary)]/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                    <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-6 border border-[var(--primary)]/20">
                        <Key className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{t('help.step1.title')}</h3>
                    <p className="text-[var(--text-secondary)] text-sm mb-6 leading-relaxed">{t('help.step1.description')}</p>
                    <div className="bg-[var(--bg-main)]/50 p-4 rounded-xl border border-[var(--border-dim)] mb-6 flex gap-4 items-center">
                        <div className="p-2 bg-[var(--bg-card)] rounded-lg"><PlusCircle className="w-5 h-5 text-emerald-500" /></div>
                        <p className="text-xs text-[var(--text-muted)]">{t('help.step1.tip')}</p>
                    </div>
                    <Link to="/dashboard/properties" className="inline-flex items-center gap-2 text-blue-500 text-sm font-black uppercase tracking-widest hover:text-blue-400 transition-colors">
                        {t('help.step1.link')} <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Step 2: Residents / Team */}
                <div className="glass-panel !p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all bg-[var(--bg-sidebar)]/30">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 border border-emerald-500/20">
                        <Users className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{t('help.step2.title')}</h3>
                    <p className="text-[var(--text-secondary)] text-sm mb-6 leading-relaxed">{t('help.step2.description')}</p>
                    <div className="bg-[var(--bg-main)]/50 p-4 rounded-xl border border-[var(--border-dim)] mb-6 flex gap-4 items-center">
                        <div className="p-2 bg-[var(--bg-card)] rounded-lg"><PlusCircle className="w-5 h-5 text-emerald-500" /></div>
                        <p className="text-xs text-[var(--text-muted)]">{t('help.step2.tip')}</p>
                    </div>
                    <Link to="/dashboard/residents" className="inline-flex items-center gap-2 text-emerald-500 text-sm font-black uppercase tracking-widest hover:text-emerald-400 transition-colors">
                        {t('help.step2.link')} <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Step 3: QR Invites */}
                <div className="glass-panel !p-6 relative overflow-hidden group hover:border-purple-500/30 transition-all bg-[var(--bg-sidebar)]/30">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6 border border-purple-500/20">
                        <QrCode className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{t('help.step3.title')}</h3>
                    <p className="text-[var(--text-secondary)] text-sm mb-6 leading-relaxed">{t('help.step3.description')}</p>
                    <Link to="/dashboard/properties" className="inline-flex items-center gap-2 text-purple-500 text-[10px] font-bold uppercase tracking-widest hover:text-purple-400 transition-colors">
                        {t('help.step3.link')} <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Step 4: Chat & Video */}
                <div className="glass-panel !p-6 relative overflow-hidden group hover:border-[var(--primary)]/30 transition-all bg-[var(--bg-sidebar)]/30">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--primary)]/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                    <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-6 border border-[var(--primary)]/20">
                        <Video className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{t('help.step4.title')}</h3>
                    <p className="text-[var(--text-secondary)] text-sm mb-4 leading-relaxed">{t('help.step4.description')}</p>
                    <ul className="text-sm text-[var(--text-secondary)] space-y-2 mb-6 ml-4 list-disc opacity-80">
                        <li>{t('help.step4.bullet1')}</li>
                        <li>{t('help.step4.bullet2')}</li>
                        <li>{t('help.step4.bullet3')}</li>
                        <li>{t('help.step4.bullet4')}</li>
                    </ul>
                    <Link to="/dashboard/visitors" className="inline-flex items-center gap-2 text-[var(--primary)] text-[10px] font-bold uppercase tracking-widest hover:text-[var(--primary)]/80 transition-colors">
                        {t('help.step4.link')} <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Step 5: PWA & Mobile */}
                <div className="glass-panel !p-6 relative overflow-hidden group hover:border-amber-500/30 transition-all bg-[var(--bg-sidebar)]/30">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6 border border-amber-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{t('help.step5.title')}</h3>
                    <p className="text-[var(--text-secondary)] text-sm mb-4 leading-relaxed">{t('help.step5.description')}</p>
                    <ul className="text-sm text-[var(--text-secondary)] space-y-2 mb-6 ml-4 list-disc opacity-80">
                        <li>{t('help.step5.bullet1')}</li>
                        <li>{t('help.step5.bullet2')}</li>
                        <li>{t('help.step5.bullet3')}</li>
                    </ul>
                </div>

                {/* Step 6: Visitor Experience */}
                <div className="glass-panel !p-6 relative overflow-hidden group hover:border-rose-500/30 transition-all bg-[var(--bg-sidebar)]/30">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6 border border-rose-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{t('help.step6.title')}</h3>
                    <p className="text-[var(--text-secondary)] text-sm mb-4 leading-relaxed">{t('help.step6.description')}</p>
                    <ul className="text-sm text-[var(--text-secondary)] space-y-2 mb-6 ml-4 list-disc opacity-80">
                        <li>{t('help.step6.bullet1')}</li>
                        <li>{t('help.step6.bullet2')}</li>
                        <li>{t('help.step6.bullet3')}</li>
                    </ul>
                </div>

            </div>

            <div className="mt-12 text-center text-sm text-[var(--text-muted)] flex items-center justify-center gap-2 opacity-60">
                <BookOpen className="w-4 h-4" /> {t('help.footer')}
            </div>

        </DashboardLayout>
    );
}
