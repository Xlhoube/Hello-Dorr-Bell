import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'pt', label: 'Português', flag: '🇵🇹' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' }
];

export function LanguageSelector({ variant = 'default' }: { variant?: 'default' | 'minimal' }) {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLanguage = languages.find(l => l.code === i18n.language.split('-')[0]) || languages[0];

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('hello-language', lng);
        setIsOpen(false);
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 border
                    ${variant === 'minimal' 
                        ? 'bg-transparent border-transparent hover:bg-white/5 text-[var(--text-secondary)]' 
                        : 'bg-[var(--bg-main)] border-[var(--border-dim)] hover:border-[var(--primary)]/40 shadow-sm'}
                    ${isOpen ? 'ring-2 ring-[var(--primary)]/20 border-[var(--primary)]' : ''}`}
            >
                <Globe className={`w-4 h-4 ${variant === 'minimal' ? 'text-[var(--text-muted)]' : 'text-[var(--primary)]'}`} />
                <span className="text-xs font-bold uppercase tracking-wider">{currentLanguage.code}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Premium Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-3 w-48 glass-panel !p-2 z-[100] animate-in fade-in zoom-in-95 duration-200 shadow-2xl border-white/10">
                    <div className="flex flex-col gap-1">
                        <p className="px-3 py-2 text-[10px] font-black uppercase tracking-[3px] text-[var(--text-muted)] opacity-50">Select Language</p>
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all
                                    ${i18n.language.startsWith(lang.code)
                                        ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                                        : 'hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg leading-none">{lang.flag}</span>
                                    <span className="text-sm font-semibold">{lang.label}</span>
                                </div>
                                {i18n.language.startsWith(lang.code) && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
