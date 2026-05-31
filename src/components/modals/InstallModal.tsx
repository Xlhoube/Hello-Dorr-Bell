import React from 'react';
import { X, Smartphone, Share2, Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface InstallModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function InstallModal({ isOpen, onClose }: InstallModalProps) {
    const { t } = useTranslation();
    const [copied, setCopied] = React.useState(false);

    if (!isOpen) return null;

    const shareUrl = window.location.origin;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(t('pwa.share_message') + shareUrl)}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            
            <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-8 pb-4 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                            <Smartphone className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{t('pwa.install_title')}</h3>
                            <p className="text-sm text-zinc-400">{t('pwa.install_desc')}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-zinc-500 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 pt-4 space-y-6">
                    {/* Instructions / QR Mockup Area */}
                    <div className="aspect-video bg-zinc-950 rounded-3xl border border-white/5 flex items-center justify-center overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-50" />
                        <div className="relative text-center p-6">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-white rounded-2xl shadow-2xl shadow-indigo-500/20">
                                    {/* Placeholder for QR or App Icon */}
                                    <div className="w-16 h-16 bg-zinc-900 rounded-xl flex items-center justify-center">
                                        <img src="/logo.png" alt="Hello" className="w-10 h-10 object-contain" />
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">{t('qr_print.scan_to_ring')}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-1 gap-3">
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 px-6 py-4 bg-[#25D366] hover:bg-[#22c35e] text-white font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-green-950/20"
                        >
                            <Share2 className="w-5 h-5" />
                            {t('pwa.whatsapp_share')}
                        </a>

                        <button
                            onClick={handleCopy}
                            className="flex items-center justify-center gap-3 px-6 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all active:scale-[0.98]"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-5 h-5 text-green-400" />
                                    {t('invites.success.link_copied')}
                                </>
                            ) : (
                                <>
                                    <Copy className="w-5 h-5" />
                                    {t('pwa.copy_link')}
                                </>
                            )}
                        </button>
                    </div>

                    {/* Footer Hint */}
                    <div className="bg-zinc-950/50 p-4 rounded-2xl border border-white/5">
                        <p className="text-[11px] text-zinc-500 leading-relaxed text-center">
                            {t('help.pwa_banner.description')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
