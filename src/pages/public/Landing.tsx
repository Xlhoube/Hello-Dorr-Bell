import { ArrowRight, QrCode, ShieldCheck, Smartphone, Video, Heart, Coffee } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from '../../components/ui/Logo';
import packageJson from '../../../package.json';

export function Landing() {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-24 bg-[var(--bg-main)] relative min-h-screen overflow-hidden">
            {/* Ambient Background Grid & Glows */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none rounded-[3rem]"></div>
            <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-900/20 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--primary)]/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

            {/* Hero Section */}
            <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 pt-20 z-10">
                <div className="z-10 animate-fade-in">
                    <h1 className="text-5xl md:text-9xl font-black text-[var(--primary)] tracking-tighter leading-none mb-2">
                        hello
                    </h1>
                    <h2 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-8">
                        {t('landing.hero.title')}
                    </h2>

                    <p className="max-w-2xl mx-auto text-base md:text-lg text-[var(--text-secondary)] font-medium mb-12 leading-relaxed opacity-80">
                        {t('landing.hero.subtitle')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link to="/register" className="px-10 py-4 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-xl shadow-[var(--primary)]/20 flex items-center gap-2 active:scale-95">
                            {t('landing.hero.cta')}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a href="#features" className="px-10 py-4 bg-[var(--bg-sidebar)]/50 text-[var(--text-primary)] rounded-xl font-bold text-sm tracking-wide border border-[var(--border-dim)] hover:bg-[var(--bg-sidebar)] transition-all">
                            {t('landing.hero.secondary')}
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="container mx-auto px-6 scroll-mt-24">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-1 h-6 bg-[var(--primary)] rounded-full"></div>
                            <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest">{t('landing.features.badge')}</p>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] tracking-tight">{t('landing.features.title')}</h2>
                    </div>
                    <p className="text-[var(--text-secondary)] font-medium text-base max-w-md opacity-80 leading-relaxed">{t('landing.features.subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
                    {/* Card 1: QR Access */}
                    <div className="md:col-span-8 glass-panel !p-6 sm:!p-10 flex flex-col justify-end group relative overflow-hidden bg-[var(--bg-sidebar)]/30 border-[var(--primary)]/10 hover:border-[var(--primary)]/30 transition-all">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                            <QrCode className="w-64 h-64 text-[var(--primary)] -rotate-12" />
                        </div>
                        <h3 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-4">{t('landing.features.card1.title')}</h3>
                        <p className="text-[var(--text-secondary)] text-sm max-w-xl opacity-80 leading-relaxed">{t('landing.features.card1.desc')}</p>
                    </div>

                    {/* Card 2: Video */}
                    <div className="md:col-span-4 glass-panel !p-6 sm:!p-10 flex flex-col justify-between border-[var(--primary)]/10 hover:border-[var(--primary)]/30 transition-all bg-[var(--bg-sidebar)]/20">
                        <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center text-[var(--primary)] border border-[var(--primary)]/20 shadow-sm">
                            <Video className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{t('landing.features.card2.title')}</h3>
                            <p className="text-[var(--text-secondary)] text-xs opacity-80 leading-relaxed">{t('landing.features.card2.desc')}</p>
                        </div>
                    </div>

                    {/* Card 3: Security */}
                    <div className="md:col-span-4 glass-panel !p-6 sm:!p-10 flex flex-col justify-between border-emerald-500/10 hover:border-emerald-500/30 transition-all bg-[var(--bg-sidebar)]/20">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-sm">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{t('landing.features.card3.title')}</h3>
                            <p className="text-[var(--text-secondary)] text-xs opacity-80 leading-relaxed">{t('landing.features.card3.desc')}</p>
                        </div>
                    </div>

                    {/* Card 4: Multiplatform */}
                    <div className="md:col-span-8 glass-panel !p-12 flex flex-col md:flex-row items-center gap-12 bg-[var(--bg-sidebar)]/30 border-[var(--primary)]/10">
                        <div className="flex-1">
                            <h3 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-6 leading-tight">{t('landing.features.card4.title')}</h3>
                            <p className="text-[var(--text-secondary)] text-base opacity-80 mb-8 leading-relaxed">
                                {t('landing.features.card4.desc')}
                            </p>
                            <Link to="/register" className="inline-flex items-center gap-2 text-[var(--primary)] text-sm font-bold hover:gap-3 transition-all">
                                {t('landing.features.card4.cta')} <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="flex-1 relative">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="aspect-square rounded-2xl bg-[var(--primary)]/5 border border-[var(--primary)]/10 flex items-center justify-center">
                                    <Smartphone className="w-10 h-10 text-[var(--primary)] opacity-40" />
                                </div>
                                <div className="aspect-square rounded-2xl bg-[var(--primary)]/5 border border-[var(--primary)]/10 flex items-center justify-center mt-8">
                                    <Video className="w-10 h-10 text-[var(--primary)] opacity-40" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Support Section */}
            <section id="pricing" className="container mx-auto px-6 scroll-mt-24">
                <div className="glass-panel !p-8 sm:!p-16 border-[var(--primary)]/30 shadow-2xl shadow-[var(--primary)]/10 bg-gradient-to-br from-[var(--bg-sidebar)]/40 to-[var(--bg-main)]/40 relative overflow-hidden text-center max-w-4xl mx-auto">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 blur-[80px] rounded-full -ml-24 -mb-24"></div>
                    
                    <div className="relative z-10">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 mb-8">
                            <Heart className="w-4 h-4 text-[var(--primary)] mr-2 fill-[var(--primary)]/20" />
                            <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest">{t('landing.pricing.badge')}</span>
                        </div>
                        
                        <h2 className="text-4xl md:text-6xl font-black text-[var(--text-primary)] tracking-tight mb-6">
                            {t('landing.support.title_prefix')}<span className="text-[var(--primary)]">{t('landing.support.title_highlight')}</span>{t('landing.support.title_suffix')}
                        </h2>
                        
                        <p className="text-lg text-[var(--text-secondary)] mb-12 max-w-2xl mx-auto leading-relaxed">
                            {t('landing.support.description')}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <a 
                                href="https://www.buymeacoffee.com/hellodoorbell" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="px-10 py-5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-2xl font-bold transition-all shadow-xl shadow-[var(--primary)]/20 hover:scale-105 active:scale-95 flex items-center gap-3"
                            >
                                <Coffee className="w-5 h-5" />
                                {t('landing.support.button')}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer - Unified Minimal Style */}
            <footer className="mt-20 pt-12 border-t border-[var(--border-dim)] flex flex-col items-center opacity-60 hover:opacity-100 transition-opacity pb-16 text-center">
                <div className="flex flex-col items-center gap-6">
                    <Logo size="md" />

                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[4px]">
                        © {new Date().getFullYear()} HELLO — v{packageJson.version}
                    </p>
                </div>
            </footer>
        </div>
    );
}

// PricingCard removed in favor of Support section
