import React, { useRef, useEffect, useState } from 'react';
import { UsersRound, Video, X, MessageSquare, Send, Loader2, XCircle, CheckCircle2 } from 'lucide-react';
import { useVisitorChat } from '../../hooks/useVisitorChat';
import { useToast } from '../ui/Toast';

interface VisitorChatProps {
    selectedVisitor: any;
    setSelectedVisitor: (visitor: any) => void;
    updateStatus: (id: string, status: string) => void;
    t: any;
}

export function VisitorChat({ selectedVisitor, setSelectedVisitor, updateStatus, t }: VisitorChatProps) {
    const { showToast } = useToast();
    const {
        messages,
        isSending,
        activeVideoCallUrl,
        setActiveVideoCallUrl,
        handleSendMessage,
        handleStartVideoCall
    } = useVisitorChat(selectedVisitor, t, showToast);

    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;
        handleSendMessage(newMessage);
        setNewMessage('');
    };

    if (!selectedVisitor) return null;

    return (
        <div className="bg-[var(--bg-sidebar)]/80 backdrop-blur-2xl flex flex-col h-[500px] md:h-[650px] max-h-[75vh] md:max-h-none overflow-hidden relative border border-[var(--border-dim)] shadow-2xl shadow-black/50 rounded-[28px]">
            {/* Header do Chat */}
            <div className="p-4 sm:p-5 border-b border-[var(--border-dim)] bg-[var(--bg-main)]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between z-10 shadow-sm gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-blue-600 text-white flex items-center justify-center shadow-lg shadow-[var(--primary)]/30">
                        <UsersRound className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-[var(--text-primary)] text-lg tracking-tight leading-none mb-1.5">{selectedVisitor.visitor_name}</h3>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-[0.2em] opacity-80">
                                {t('visitors.chat.waiting_at')}: <span className="text-[var(--primary)]">{selectedVisitor.unit?.name}</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button 
                        onClick={handleStartVideoCall} 
                        className="px-4 py-2 font-bold text-[10px] sm:text-[11px] uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white shadow-[var(--primary)]/20"
                        title={t('visitors.chat.call')}
                    >
                        <Video className="w-4 h-4" /> <span className="sm:inline">{t('visitors.chat.start_video')}</span>
                    </button>
                    <button onClick={() => setSelectedVisitor(null)} className="p-2 text-[var(--text-muted)] hover:text-white hover:bg-red-500/80 rounded-xl transition-all border border-transparent flex items-center justify-center">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Lista de Mensagens do Chat */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar bg-[var(--bg-main)]/20">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] opacity-50">
                        <div className="w-20 h-20 rounded-3xl bg-[var(--bg-card)] flex items-center justify-center mb-5 border border-[var(--border-dim)] shadow-inner">
                            <MessageSquare className="w-8 h-8" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em]">{t('visitors.chat.ice_breaker')}</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isVideoMessage = msg.content.startsWith('[SISTEMA_VIDEO]:');

                        if (isVideoMessage) {
                            const url = msg.content.replace('[SISTEMA_VIDEO]:', '');
                            return (
                                <div key={msg.id || idx} className="flex justify-center my-10">
                                    <div className="bg-[var(--bg-card)] border border-[var(--primary)]/30 rounded-3xl p-8 text-center min-w-[320px] shadow-2xl shadow-[var(--primary)]/10 backdrop-blur-xl relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 flex items-center justify-center mx-auto mb-5 text-[var(--primary)] border border-[var(--primary)]/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                            <Video className="w-7 h-7" />
                                        </div>
                                        <h4 className="text-base text-[var(--text-primary)] font-bold mb-1.5">{t('visitors.chat.video_started')}</h4>
                                        <p className="text-[10px] text-[var(--text-muted)] mb-6 uppercase tracking-[0.2em] opacity-80 flex items-center justify-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {t('visitors.chat.p2p_encrypted')}
                                        </p>
                                        <button
                                            onClick={() => setActiveVideoCallUrl(url)}
                                            className="w-full py-3.5 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-[var(--primary)]/25 transition-all outline-none hover:-translate-y-1"
                                        >
                                            {t('visitors.chat.enter_room')}
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        const isResident = msg.sender_type === 'resident';
                        return (
                            <div key={msg.id || idx} className={`flex flex-col ${isResident ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`px-6 py-3.5 max-w-[80%] text-[15px] leading-relaxed shadow-md transition-all duration-300 ${
                                    isResident 
                                    ? 'bg-gradient-to-br from-[var(--primary)] to-blue-600 text-white rounded-[24px] rounded-tr-sm shadow-[var(--primary)]/20' 
                                    : 'bg-[var(--bg-card)] text-[var(--text-primary)] rounded-[24px] rounded-tl-sm border border-[var(--border-dim)]/80 shadow-black/5'
                                }`}>
                                    {msg.content}
                                </div>
                                <div className="flex items-center gap-2 mt-2 px-1 opacity-60">
                                    <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-[0.15em]">
                                        {isResident ? t('visitors.chat.you') : selectedVisitor.visitor_name}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]/30"></span>
                                    <span className="text-[9px] text-[var(--text-muted)] font-medium tracking-wider">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Field do Chat */}
            <form onSubmit={onSubmit} className="p-4 bg-[var(--bg-card)] border-t border-[var(--border-dim)] flex gap-3">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('visitors.chat.placeholder')}
                    className="flex-1 bg-[var(--bg-main)]/50 border border-[var(--border-dim)] rounded-xl px-5 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] opacity-80 focus:opacity-100 focus:outline-none focus:border-[var(--primary)]/50 transition-all font-medium"
                    disabled={isSending}
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="p-3.5 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center shadow-lg shadow-[var(--primary)]/20 border-none"
                >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
                </button>
            </form>

            {/* Botões de Ação Final Dentro do Chat */}
            <div className="p-4 sm:p-6 bg-[var(--bg-card)]/80 backdrop-blur-md border-t border-[var(--border-dim)] flex flex-col sm:flex-row justify-between gap-3 mb-2">
                {['pending', 'waiting'].includes(selectedVisitor.status) ? (
                    <>
                        <button 
                            onClick={() => updateStatus(selectedVisitor.id, 'rejected')} 
                            className="flex-1 py-4 sm:py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 rounded-2xl transition-all text-[11px] font-black uppercase tracking-[2px] flex items-center justify-center gap-2 active:scale-95"
                        >
                            <XCircle className="w-4 h-4" /> {t('visitors.chat.reject')}
                        </button>
                        <button 
                            onClick={() => updateStatus(selectedVisitor.id, 'approved')} 
                            className="flex-1 py-4 sm:py-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 hover:border-emerald-500 rounded-2xl transition-all text-[11px] font-black uppercase tracking-[2px] flex items-center justify-center gap-2 active:scale-95"
                        >
                            <CheckCircle2 className="w-4 h-4" /> {t('visitors.chat.approve')}
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={() => updateStatus(selectedVisitor.id, 'completed')} 
                        className="w-full py-4 sm:py-3 bg-slate-500/10 hover:bg-slate-500 text-[var(--text-secondary)] hover:text-white border border-slate-500/20 hover:border-slate-500 rounded-2xl transition-all text-[11px] font-black uppercase tracking-[2px] flex items-center justify-center gap-2 active:scale-95"
                    >
                        <CheckCircle2 className="w-4 h-4" /> {t('visitors.chat.complete')}
                    </button>
                )}
            </div>
        </div>
    );
}
