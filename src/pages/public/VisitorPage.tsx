import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, Loader2, BellRing, XCircle, Send, Video, User, Mic, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { supabase } from '../../lib/supabase';
import { VideoCall } from '../../components/video/VideoCall';

export function VisitorPage() {
    const { t } = useTranslation();
    const { token, unitId } = useParams<{ token?: string, unitId?: string }>();

    const [invitation, setInvitation] = useState<any>(null);
    const [unitData, setUnitData] = useState<any>(null);
    const [status, setStatus] = useState<'loading' | 'invalid' | 'identification' | 'ready' | 'waiting' | 'approved' | 'rejected'>('loading');
    const [visitorRecordId, setVisitorRecordId] = useState<string | null>(null);
    const [visitorName, setVisitorName] = useState('');

    // Chat states
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [activeVideoCallUrl, setActiveVideoCallUrl] = useState<string | null>(null);
    const [ringCooldown, setRingCooldown] = useState(0);

    // Offline Note states
    const [isLeavingNote, setIsLeavingNote] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [isSendingNote, setIsSendingNote] = useState(false);
    const [noteSubmitted, setNoteSubmitted] = useState(false);
    const [waitingSeconds, setWaitingSeconds] = useState(0);

    const handleRingAgain = async () => {
        if (ringCooldown > 0 || !visitorRecordId) return;
        setRingCooldown(10); // 10s cooldown
        
        try {
            const audio = new Audio('/Ring01.mp3');
            audio.play().catch(console.error);
        } catch(e) {}
        
        await supabase.from('visitors').update({ updated_at: new Date().toISOString() }).eq('id', visitorRecordId);
        
        const interval = setInterval(() => {
            setRingCooldown(prev => {
                if (prev <= 1) clearInterval(interval);
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        const checkSavedSession = async () => {
            const savedSessionStr = sessionStorage.getItem(`visitor_session_${token || unitId}`);
            if (savedSessionStr) {
                try {
                    const savedSession = JSON.parse(savedSessionStr);
                    const { data, error } = await supabase.from('visitors').select('status, visitor_name').eq('id', savedSession.id).single();
                    
                    if (!error && data && ['pending', 'waiting', 'approved'].includes(data.status)) {
                        setVisitorRecordId(savedSession.id);
                        setVisitorName(data.visitor_name);
                        setStatus(data.status as any); // Restaura o estado atual da DB
                        return; // Sessão válida e ativa restaurada!
                    } else {
                        // Limpa sessões inválidas, rejeitadas ou finalizadas
                        sessionStorage.removeItem(`visitor_session_${token || unitId}`);
                    }
                } catch (e) {
                    sessionStorage.removeItem(`visitor_session_${token || unitId}`);
                }
            }
            
            // Fluxo normal caso não aja sessão guardada
            if (token) {
                validateToken();
            } else if (unitId) {
                fetchUnitInfo();
            } else {
                setStatus('invalid');
            }
        };

        checkSavedSession();
    }, [token, unitId]);

    // Listen to changes on the visitor record and messages if we are waiting
    // Timer for "No Answer" (45 seconds)
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === 'waiting') {
            interval = setInterval(() => {
                setWaitingSeconds(prev => prev + 1);
            }, 1000);
        } else {
            setWaitingSeconds(0);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [status]);

    useEffect(() => {
        if ((status === 'waiting' || status === 'approved') && visitorRecordId) {
            fetchMessages();

            // Subscribe to visitor status changes
            const visitorSubscription = supabase
                .channel(`visitor_${visitorRecordId}`)
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'visitors',
                    filter: `id=eq.${visitorRecordId}`
                }, (payload) => {
                    console.log("📢 [VisitorPage] Realtime status update:", payload.new.status);
                    const newStatus = payload.new.status;
                    if (newStatus === 'approved') {
                        console.log("✅ [VisitorPage] Access APPROVED, updating UI state...");
                        setStatus('approved');
                    }
                    if (newStatus === 'rejected') setStatus('rejected');
                    if (newStatus === 'completed') setStatus('ready');
                })
                .subscribe();

            // Subscribe to incoming messages
            const messagesSubscription = supabase
                .channel(`messages_${visitorRecordId}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `visitor_id=eq.${visitorRecordId}`
                }, (payload) => {
                    setMessages((prev) => [...prev, payload.new]);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(visitorSubscription);
                supabase.removeChannel(messagesSubscription);
            };
        }
    }, [status, visitorRecordId]);

    const fetchMessages = async () => {
        if (!visitorRecordId) return;
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('visitor_id', visitorRecordId)
                .order('created_at', { ascending: true });

            if (!error && data) setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !visitorRecordId || isSending) return;

        setIsSending(true);
        try {
            const { error } = await supabase
                .from('messages')
                .insert([{
                    visitor_id: visitorRecordId,
                    sender_type: 'visitor',
                    content: newMessage.trim()
                }]);

            if (error) throw error;
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleSendNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteContent.trim() || isSendingNote) return;

        const finalName = visitorName.trim() || 'Visitante';
        setIsSendingNote(true);

        try {
            let orgId = null;
            let currentUnitId = null;

            if (invitation) {
                currentUnitId = invitation.unit_id;
                if (invitation.unit?.property) {
                    orgId = Array.isArray(invitation.unit.property) 
                        ? invitation.unit.property[0]?.organization_id 
                        : invitation.unit.property.organization_id;
                }
            } else if (unitData) {
                currentUnitId = unitData.id;
                orgId = unitData.property?.organization_id;
            }

            const { error } = await supabase
                .from('offline_messages')
                .insert([{
                    visitor_name: finalName,
                    message: noteContent.trim(),
                    unit_id: currentUnitId,
                    organization_id: orgId
                }]);

            if (error) throw error;
            
            setNoteSubmitted(true);
            setNoteContent('');
            
            setTimeout(() => {
                setNoteSubmitted(false);
                setIsLeavingNote(false);
            }, 3000);
        } catch (error) {
            console.error('Error sending note:', error);
            alert(t('visitor_page.note_error'));
        } finally {
            setIsSendingNote(false);
        }
    };

    const validateToken = async () => {
        try {
            const { data, error } = await supabase
                .from('invitations')
                .select('*, unit:units(name, property:properties(name, organization_id))')
                .eq('token', token)
                .single();

            if (error || !data) {
                setStatus('invalid');
                return;
            }

            setInvitation(data);
            setVisitorName(data.visitor_name);
            setStatus('ready');
        } catch (error) {
            console.error('Error validating token:', error);
            setStatus('invalid');
        }
    };

    const fetchUnitInfo = async () => {
        try {
            const { data, error } = await supabase
                .from('units')
                .select('*, property:properties(name, organization_id)')
                .eq('id', unitId)
                .single();

            if (error || !data) {
                setStatus('invalid');
                return;
            }

            setUnitData(data);
            setStatus('identification');
        } catch (error) {
            console.error('Error fetching unit info:', error);
            setStatus('invalid');
        }
    };

    const handleAnnounceArrival = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        const finalName = visitorName.trim();
        if (!finalName) return;

        setStatus('loading');

        try {
            const audio = new Audio('/Ring01.mp3');
            audio.play().catch(console.error);
            
            let orgId = null;
            let currentUnitId = null;

            if (invitation) {
                currentUnitId = invitation.unit_id;
                if (invitation.unit?.property) {
                    orgId = Array.isArray(invitation.unit.property) 
                        ? invitation.unit.property[0]?.organization_id 
                        : invitation.unit.property.organization_id;
                }
            } else if (unitData) {
                currentUnitId = unitData.id;
                orgId = unitData.property?.organization_id;
            }

            // Create a visitor record in the queue
            const { data, error } = await supabase
                .from('visitors')
                .insert([{
                    visitor_name: finalName,
                    unit_id: currentUnitId,
                    organization_id: orgId,
                    status: 'pending'
                }])
                .select()
                .single();

            if (error) throw error;

            setVisitorRecordId(data.id);
            sessionStorage.setItem(`visitor_session_${token || unitId}`, JSON.stringify({ id: data.id }));
            setStatus('waiting');
        } catch (error: any) {
            console.error('Error announcing arrival:', error);
            alert(`Não foi possível anunciar a chegada. Tente novamente.`);
            setStatus(invitation ? 'ready' : 'identification');
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-6 w-full text-[var(--text-primary)]">
                <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin mb-4" />
                <p className="text-[var(--text-secondary)] font-medium animate-pulse text-sm uppercase tracking-widest">A preparar acesso...</p>
            </div>
        );
    }

    if (status === 'invalid') {
        return (
            <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-6 w-full text-[var(--text-primary)]">
                <div className="w-full max-w-sm glass-card border-[var(--danger)]/30 flex flex-col items-center text-center !p-10">
                    <div className="w-20 h-20 rounded-[2rem] bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20 shadow-inner">
                        <ShieldAlert className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-black text-[var(--text-primary)] mb-3">Acesso Inválido</h2>
                    <p className="text-[var(--text-secondary)] mb-8 text-sm leading-relaxed">
                        Este código QR já expirou, foi cancelado ou não existe no nosso sistema.
                    </p>
                    <button onClick={() => window.location.reload()} className="w-full py-4 bg-[var(--bg-main)] border border-[var(--border-dim)] hover:border-[var(--primary)] hover:text-[var(--primary)] rounded-2xl font-bold transition-all text-sm uppercase tracking-wider">
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-4 sm:p-6 w-full text-[var(--text-primary)] relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--primary)]/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-sm glass-card border-[var(--primary)]/20 !p-0 overflow-hidden shadow-2xl relative z-10 flex flex-col !rounded-[2.5rem]">
                <div className="min-h-[180px] bg-[var(--bg-sidebar)] flex flex-col items-center justify-center border-b border-[var(--border-dim)] p-8 relative overflow-hidden">
                    {/* Background Glow for Logo */}
                    <div className="absolute inset-0 bg-[var(--primary)]/5 blur-3xl rounded-full scale-150 animate-pulse" />
                    <div className="relative z-10 animate-in zoom-in duration-1000 scale-125">
                        <Logo size="xl" />
                    </div>
                </div>

                <div className="p-8 flex flex-col items-center text-center bg-[var(--bg-main)]">

                    {status === 'identification' && (
                        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <div className="w-16 h-16 rounded-[1.5rem] bg-[var(--primary-glow)] flex items-center justify-center mb-6 border border-[var(--primary)]/20 mx-auto">
                                <User className="w-8 h-8 text-[var(--primary)]" />
                            </div>
                            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2">{t('visitor_page.identify')}</h2>
                            <p className="text-sm text-[var(--text-secondary)] mb-8 leading-relaxed">
                                {t('visitor_page.at_location')} <span className="text-[var(--primary)] font-bold">{unitData?.property?.name}</span> ({unitData?.name}).<br/>
                                {t('visitor_page.provide_name')}
                            </p>

                            <form onSubmit={handleAnnounceArrival} className="space-y-4">
                                <input
                                    type="text"
                                    required
                                    value={visitorName}
                                    onChange={(e) => setVisitorName(e.target.value)}
                                    placeholder={t('visitor_page.your_name')}
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border-dim)] focus:border-[var(--primary)] rounded-2xl p-4 text-[var(--text-primary)] text-center font-bold text-lg focus:outline-none transition-all focus:ring-4 focus:ring-[var(--primary-glow)]"
                                />
                                <button
                                    type="submit"
                                    disabled={!visitorName.trim()}
                                    className="w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-[var(--primary-glow)] disabled:opacity-50 mt-4 active:scale-95"
                                >
                                    {t('visitor_page.announce')}
                                </button>
                                
                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsLeavingNote(!isLeavingNote)}
                                        className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest hover:text-[var(--primary)] transition-colors"
                                    >
                                        {isLeavingNote ? t('common.cancel') : t('visitor_page.leave_note')}
                                    </button>
                                </div>
                            </form>

                            {isLeavingNote && (
                                <div className="w-full mt-6 p-6 bg-[var(--bg-sidebar)]/50 rounded-3xl border border-[var(--border-dim)] animate-in fade-in slide-in-from-top-2">
                                    {noteSubmitted ? (
                                        <div className="py-4 flex flex-col items-center gap-2 text-emerald-500">
                                            <CheckCircle2 className="w-8 h-8" />
                                            <p className="text-sm font-bold">{t('visitor_page.note_sent')}</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSendNote} className="space-y-4">
                                            <textarea
                                                required
                                                value={noteContent}
                                                onChange={(e) => setNoteContent(e.target.value)}
                                                placeholder={t('visitor_page.note_placeholder')}
                                                className="w-full bg-[var(--bg-main)] border border-[var(--border-dim)] focus:border-[var(--primary)] rounded-2xl p-4 text-sm text-[var(--text-primary)] min-h-[100px] resize-none focus:outline-none transition-all"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!noteContent.trim() || isSendingNote}
                                                className="w-full py-3 bg-[var(--bg-main)] border border-[var(--border-dim)] hover:border-[var(--primary)] hover:text-[var(--primary)] rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                                            >
                                                {isSendingNote ? t('common.loading') : t('visitor_page.send_note')}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {status === 'ready' && (
                        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                            <h2 className="text-2xl text-[var(--text-secondary)] mb-2">{t('visitor_page.hello')} <span className="font-black text-[var(--text-primary)]">{visitorName}</span></h2>
                            <p className="text-[var(--text-secondary)] mb-10 text-sm">
                                {t('visitor_page.welcome_to')} <span className="text-[var(--text-primary)] font-bold">{invitation?.unit?.property?.name || unitData?.property?.name}</span>.<br />
                                <span className="text-xs opacity-70 font-medium">{t('visitor_page.access_point')} {invitation?.unit?.name || unitData?.name}</span>
                            </p>

                            <div className="flex flex-col items-center gap-8">
                                <button
                                    onClick={() => handleAnnounceArrival()}
                                    className="w-48 h-48 rounded-[3rem] bg-gradient-to-tr from-[var(--primary)] to-indigo-500 hover:from-indigo-600 hover:to-[var(--primary)] shadow-2xl shadow-[var(--primary-glow)] flex flex-col items-center justify-center gap-4 transition-all active:scale-95 group mx-auto border-8 border-[var(--bg-main)] relative"
                                >
                                    <BellRing className="w-16 h-16 text-white group-hover:scale-110 transition-all duration-300 drop-shadow-xl" />
                                    <span className="font-black text-white uppercase tracking-widest text-[11px] opacity-90">{t('visitor_page.ring_doorbell')}</span>
                                </button>

                                <button
                                    onClick={() => setIsLeavingNote(!isLeavingNote)}
                                    className="px-6 py-3 bg-[var(--bg-sidebar)]/50 hover:bg-[var(--bg-sidebar)] border border-[var(--border-dim)] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                >
                                    <MessageSquare className="w-4 h-4 text-[var(--primary)]" />
                                    {t('visitor_page.leave_note')}
                                </button>
                            </div>

                            {isLeavingNote && (
                                <div className="w-full mt-10 p-6 bg-[var(--bg-sidebar)]/50 rounded-3xl border border-[var(--border-dim)] animate-in fade-in slide-in-from-bottom-4">
                                    {noteSubmitted ? (
                                        <div className="py-4 flex flex-col items-center gap-2 text-emerald-500">
                                            <CheckCircle2 className="w-8 h-8" />
                                            <p className="text-sm font-bold">{t('visitor_page.note_sent')}</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSendNote} className="space-y-4">
                                            <textarea
                                                required
                                                value={noteContent}
                                                onChange={(e) => setNoteContent(e.target.value)}
                                                placeholder={t('visitor_page.note_placeholder')}
                                                className="w-full bg-[var(--bg-main)] border border-[var(--border-dim)] focus:border-[var(--primary)] rounded-2xl p-4 text-sm text-[var(--text-primary)] min-h-[120px] resize-none focus:outline-none transition-all shadow-inner"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!noteContent.trim() || isSendingNote}
                                                className="w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-[var(--primary-glow)] disabled:opacity-50"
                                            >
                                                {isSendingNote ? t('common.loading') : t('visitor_page.send_note')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsLeavingNote(false)}
                                                className="w-full py-2 text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest"
                                            >
                                                {t('common.cancel')}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {(status === 'waiting' || status === 'approved') && (
                        <div className="w-full flex flex-col h-[500px]">
                            <div className="py-4 border-b border-[var(--border-dim)] flex-shrink-0">
                                <h3 className="text-xl font-black text-[var(--text-primary)] flex items-center justify-center gap-3">
                                    <span className={`flex h-3 w-3 rounded-full ${status === 'approved' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse' : 'bg-[var(--primary)] animate-pulse shadow-[0_0_10px_var(--primary)]'}`}></span>
                                    {status === 'approved' ? t('visitor_page.call_answered') : t('visitor_page.waiting_response')}
                                </h3>
                                {status === 'approved' && (
                                    <div className="flex items-center justify-center gap-1.5 mt-2 text-emerald-500">
                                        <Mic className="w-3.5 h-3.5 animate-pulse" />
                                        <p className="text-[10px] text-emerald-500 uppercase font-black tracking-widest mt-0.5">{t('visitor_page.connection_active')}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto pt-6 pb-2 space-y-4 text-left px-1">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] opacity-60">
                                        <BellRing className="w-10 h-10 mb-3 text-[var(--text-muted)] border border-[var(--border-dim)] rounded-full p-2" />
                                        <p className="text-sm font-medium">O residente já foi avisado.</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isVideoMessage = msg.content.startsWith('[SISTEMA_VIDEO]:');
                                        if (isVideoMessage) {
                                            // Ler exatamente a URL ÚNICA que o residente partilhou da API
                                            let url = msg.content.replace('[SISTEMA_VIDEO]:', '');
                                            if (url.includes('jit.si') || url.includes('ffmuc')) return null;
                                            return (
                                                <div key={msg.id || idx} className="flex justify-center my-6 w-full">
                                                    <div className="bg-[var(--bg-main)] border border-[var(--primary)]/30 rounded-2xl p-5 text-center w-full shadow-lg shadow-[var(--primary-glow)]">
                                                        <Video className="w-8 h-8 text-[var(--primary)] mx-auto mb-3" />
                                                        <p className="text-sm text-[var(--text-primary)] font-bold mb-4">Chamada de Vídeo</p>
                                                        <button
                                                            onClick={() => setActiveVideoCallUrl(url)}
                                                            className="w-full py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-transform"
                                                        >
                                                            Atender
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={msg.id || idx} className={`flex flex-col ${msg.sender_type === 'visitor' ? 'items-end' : 'items-start'}`}>
                                                <div className={`px-5 py-3 max-w-[85%] text-sm font-medium shadow-sm leading-relaxed ${msg.sender_type === 'visitor' ? 'bg-[var(--primary)] text-white rounded-[1.2rem] rounded-tr-sm' : 'bg-[var(--bg-sidebar)] text-[var(--text-primary)] border border-[var(--border-dim)] rounded-[1.2rem] rounded-tl-sm'}`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Input Field e Controlos de Toque no Final do Chat */}
                            <div className="pt-4 border-t border-[var(--border-dim)] bg-[var(--bg-main)]/50 p-4 rounded-b-[2.5rem]">
                                <form onSubmit={handleSendMessage} className="flex gap-3 mb-4">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={t('visitor_page.placeholder_chat', { defaultValue: 'Escreva algo...' })}
                                        className="flex-1 bg-[var(--bg-sidebar)] border border-[var(--border-dim)] focus:border-[var(--primary)] rounded-2xl px-5 py-4 text-sm text-[var(--text-primary)] outline-none transition-all shadow-inner focus:ring-4 focus:ring-[var(--primary-glow)]"
                                    />
                                    <button type="submit" disabled={!newMessage.trim() || isSending} className="px-5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-50 border-none flex items-center justify-center">
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                                
                                <div className="flex justify-between items-center px-2">
                                    <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">
                                        {t('visitor_page.footer_status', { defaultValue: 'Aguardar Aprovação' })}
                                    </p>
                                    <button 
                                        onClick={handleRingAgain} 
                                        disabled={ringCooldown > 0}
                                        className="px-4 py-2 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 disabled:opacity-50 text-[var(--primary)] rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        <BellRing className="w-3.5 h-3.5" />
                                        {ringCooldown > 0 ? `${ringCooldown}s` : t('visitor_page.ring_again', { defaultValue: '🔔 Tocar Novamente' })}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {(status === 'rejected' || (status === 'waiting' && waitingSeconds >= 45)) && (
                        <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-6 duration-700">
                            {status === 'rejected' ? (
                                <>
                                    <div className="w-20 h-20 rounded-[2rem] bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20 shadow-inner">
                                        <XCircle className="w-10 h-10 text-red-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">{t('visitor_page.rejected_title', { defaultValue: 'Acesso Recusado' })}</h3>
                                    <p className="text-sm text-[var(--text-secondary)] mb-8 leading-relaxed px-4">
                                        {t('visitor_page.rejected_desc', { defaultValue: 'O residente não pode recebê-lo agora.' })}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="w-20 h-20 rounded-[2rem] bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20 shadow-inner">
                                        <BellRing className="w-10 h-10 text-amber-500 animate-pulse" />
                                    </div>
                                    <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">{t('visitor_page.no_answer', { defaultValue: 'Sem Resposta' })}</h3>
                                    <p className="text-sm text-[var(--text-secondary)] mb-8 leading-relaxed px-4">
                                        {t('visitor_page.no_answer_desc', { defaultValue: 'Parece que ninguém está disponível para abrir a porta no momento.' })}
                                    </p>
                                </>
                            )}

                            {!noteSubmitted ? (
                                <button 
                                    onClick={() => setIsLeavingNote(true)}
                                    className="w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg flex items-center justify-center gap-2 group whitespace-nowrap px-4"
                                >
                                    <MessageSquare className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                    {t('visitor_page.leave_message_anyway', { defaultValue: 'Deixar Mensagem' })}
                                </button>
                            ) : (
                                <div className="py-4 flex flex-col items-center gap-2 text-emerald-500 bg-emerald-500/5 rounded-2xl w-full border border-emerald-500/20">
                                    <CheckCircle2 className="w-8 h-8" />
                                    <p className="text-sm font-bold uppercase tracking-widest">{t('visitor_page.note_sent')}</p>
                                </div>
                            )}

                            {isLeavingNote && !noteSubmitted && (
                                <div className="w-full mt-6 p-6 bg-[var(--bg-sidebar)]/50 rounded-3xl border border-[var(--border-dim)] animate-in fade-in slide-in-from-top-4">
                                    <form onSubmit={handleSendNote} className="space-y-4">
                                        <textarea
                                            required
                                            autoFocus
                                            value={noteContent}
                                            onChange={(e) => setNoteContent(e.target.value)}
                                            placeholder={t('visitor_page.note_placeholder')}
                                            className="w-full bg-[var(--bg-main)] border border-[var(--border-dim)] focus:border-[var(--primary)] rounded-2xl p-4 text-sm text-[var(--text-primary)] min-h-[120px] resize-none focus:outline-none transition-all shadow-inner"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsLeavingNote(false)}
                                                className="flex-1 py-3 bg-[var(--bg-sidebar)] border border-[var(--border-dim)] rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                                            >
                                                {t('common.cancel')}
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={!noteContent.trim() || isSendingNote}
                                                className="flex-[2] py-3 bg-[var(--primary)] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 shadow-md shadow-[var(--primary-glow)]"
                                            >
                                                {isSendingNote ? t('common.loading') : t('visitor_page.send_note')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {activeVideoCallUrl && (
                <VideoCall url={activeVideoCallUrl} displayName={visitorName} onLeave={() => setActiveVideoCallUrl(null)} />
            )}
        </div>
    );

}
