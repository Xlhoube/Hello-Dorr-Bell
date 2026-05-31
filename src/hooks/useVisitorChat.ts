import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useVisitorChat(selectedVisitor: any, t: any, showToast: any) {
    const [messages, setMessages] = useState<any[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [activeVideoCallUrl, setActiveVideoCallUrl] = useState<string | null>(null);

    const fetchMessages = async (visitorId: string) => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('visitor_id', visitorId)
                .order('created_at', { ascending: true });

            if (!error && data) setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    // Realtime Messages (Selected Visitor Level)
    useEffect(() => {
        let messagesSubscription: any = null;

        if (selectedVisitor) {
            fetchMessages(selectedVisitor.id);
            messagesSubscription = supabase
                .channel(`chat_${selectedVisitor.id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `visitor_id=eq.${selectedVisitor.id}`
                }, (payload) => {
                    setMessages((prev) => {
                        // Avoid duplicates if already added locally
                        if (prev.some(m => m.id === payload.new.id)) return prev;
                        return [...prev, payload.new];
                    });
                })
                .subscribe();
        } else {
            setMessages([]);
        }

        return () => {
            if (messagesSubscription) supabase.removeChannel(messagesSubscription);
        };
    }, [selectedVisitor?.id]);

    const handleSendMessage = async (content: string) => {
        if (!content.trim() || !selectedVisitor || isSending) return;

        setIsSending(true);
        try {
            const { error } = await supabase
                .from('messages')
                .insert([{
                    visitor_id: selectedVisitor.id,
                    sender_type: 'resident',
                    content: content.trim()
                }]);

            if (error) throw error;
        } catch (error) {
            console.error('Error sending message:', error);
            showToast(t('common.error', 'Ocorreu um erro ao enviar a mensagem.'), 'error');
        } finally {
            setIsSending(false);
        }
    };

    const handleStartVideoCall = async () => {
        if (!selectedVisitor) return;

        const DAILY_API_KEY = import.meta.env.VITE_DAILY_API_KEY || '13faf6ae2817adaa5999aaca31d24d10e4feb73355b47740d6ecc20ce4e7cc33';
        const roomName = `acesso-${selectedVisitor.id.replace(/-/g, '').slice(0, 15)}`;
        const roomUrl = `https://hellodoorbell.daily.co/${roomName}`;

        try {
            await fetch('https://api.daily.co/v1/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${DAILY_API_KEY}`
                },
                body: JSON.stringify({
                    name: roomName,
                    properties: {
                        exp: Math.round(Date.now() / 1000) + 3600,
                        enable_prejoin_ui: false,
                    }
                })
            }).catch(e => console.log('Daily API creation info:', e));

            const { error } = await supabase
                .from('messages')
                .insert([{
                    visitor_id: selectedVisitor.id,
                    sender_type: 'resident',
                    content: `[SISTEMA_VIDEO]:${roomUrl}`
                }]);

            if (error) throw error;
            setActiveVideoCallUrl(roomUrl);
        } catch (error) {
            console.error('Error starting video:', error);
            showToast(t('visitors.chat.call_error'), 'error');
        }
    };

    return {
        messages,
        isSending,
        activeVideoCallUrl,
        setActiveVideoCallUrl,
        handleSendMessage,
        handleStartVideoCall
    };
}
