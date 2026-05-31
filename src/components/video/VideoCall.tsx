import { X } from 'lucide-react';

interface VideoCallProps {
    url: string;
    displayName?: string;
    onLeave: () => void;
}

export function VideoCall({ url, onLeave }: VideoCallProps) {
    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8 bg-slate-950/95 backdrop-blur-md">
            <div className="relative w-full max-w-5xl h-[85vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/20 border border-slate-700/50 flex flex-col animate-in zoom-in-95 duration-300">
                <div className="p-4 bg-slate-900/95 border-b border-slate-800 flex justify-between items-center z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                        <span className="text-white font-bold uppercase tracking-widest text-sm">
                            Comunicação de Vídeo
                        </span>
                    </div>
                    <button
                        onClick={onLeave}
                        className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-transparent hover:border-red-500/20"
                        title="Fechar Vídeo"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-1 w-full bg-black relative">
                    <iframe
                        src={url}
                        allow="camera; microphone; fullscreen; display-capture"
                        className="w-full h-full border-0 absolute inset-0"
                    ></iframe>
                </div>
            </div>
        </div>
    );
}
