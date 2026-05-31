
import { useTranslation } from 'react-i18next';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LanguageSelector } from '../ui/LanguageSelector';
import { Logo } from '../ui/Logo';

export function Navbar() {
    const { t } = useTranslation();

    return (
        <nav className="glass-panel sticky top-0 z-50 transition-all duration-300">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">

                    {/* Logo */}
                    <Link to="/" className="flex items-center origin-left">
                        <Logo size="lg" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-bold text-[var(--text-secondary)] hover:text-[#4F46E5] transition-colors">{t('nav.features')}</a>
                        <a href="#pricing" className="text-sm font-bold text-[var(--text-secondary)] hover:text-[#4F46E5] transition-colors">{t('nav.pricing')}</a>

                        <div className="flex items-center gap-4 border-l border-slate-700/50 pl-6 ml-2">
                            {/* Language Switcher */}
                            <LanguageSelector variant="minimal" />

                            <Link to="/login" className="text-sm font-bold text-[var(--text-secondary)] hover:text-[#4F46E5] transition-colors">{t('nav.login')}</Link>
                            <Link to="/register" className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20">{t('nav.get_started')}</Link>
                        </div>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden p-2 text-slate-300 hover:text-white">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </nav>
    );
}
