import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export function useVisitors(t: any, showToast: any, confirm: any, searchParams: URLSearchParams) {
    const [visitors, setVisitors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [offlineMessages, setOfflineMessages] = useState<any[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    
    const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
    const selectedVisitorRef = useRef<any>(null);

    const [doorbellSound, setDoorbellSound] = useState<string>('/Ring01.mp3');
    const doorbellSoundRef = useRef<string>('/Ring01.mp3');

    useEffect(() => {
        selectedVisitorRef.current = selectedVisitor;
    }, [selectedVisitor]);

    useEffect(() => {
        doorbellSoundRef.current = doorbellSound;
    }, [doorbellSound]);

    const fetchOfflineMessages = async () => {
        setLoadingMessages(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (!profile?.organization_id) return;

            const { data, error } = await supabase
                .from('offline_messages')
                .select('*, unit:units(name)')
                .eq('organization_id', profile.organization_id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOfflineMessages(data || []);
        } catch (error) {
            console.error('Error fetching offline messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const deleteOfflineMessage = async (id: string) => {
        const confirmed = await confirm({
            title: t('visitors.offline.delete_title', 'Eliminar Mensagem'),
            message: t('visitors.offline.delete_confirm', 'Tem a certeza que deseja eliminar esta mensagem?'),
            confirmLabel: t('common.delete', 'Eliminar'),
            variant: 'danger'
        });

        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from('offline_messages')
                .delete()
                .eq('id', id);
            if (error) throw error;
            setOfflineMessages(prev => prev.filter(m => m.id !== id));
            showToast(t('common.delete_success', 'Eliminado com sucesso!'), 'success');
        } catch (error) {
            console.error('Error deleting message:', error);
            showToast(t('common.error', 'Ocorreu um erro.'), 'error');
        }
    };

    const fetchVisitors = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id, doorbell_sound')
                .eq('id', user.id)
                .single();
            
            if (profile?.doorbell_sound) {
                setDoorbellSound(profile.doorbell_sound);
            }

            if (!profile?.organization_id) return;

            const { data, error } = await supabase
                .from('visitors')
                .select('*, unit:units(name, property:properties(name))')
                .eq('organization_id', profile.organization_id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            setVisitors(data || []);

            const chatVisitorId = searchParams.get('chat');
            if (chatVisitorId && data) {
                const visitorToSelect = data.find(v => v.id === chatVisitorId);
                if (visitorToSelect) {
                    setSelectedVisitor(visitorToSelect);
                }
            }
        } catch (error: any) {
            console.error('Error fetching visitors:', error);
        } finally {
            setLoading(false);
        }
    };

    // Realtime Visitors
    useEffect(() => {
        let visitorsSubscription: any = null;

        const setupRealtime = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id, doorbell_sound')
                .eq('id', user.id)
                .single();

            if (profile?.doorbell_sound) setDoorbellSound(profile.doorbell_sound);

            if (profile?.organization_id) {
                visitorsSubscription = supabase
                    .channel(`visitors_list_${profile.organization_id}`)
                    .on('postgres_changes', {
                        event: '*',
                        schema: 'public',
                        table: 'visitors',
                        filter: `organization_id=eq.${profile.organization_id}`
                    }, (payload) => {
                        if (payload.eventType === 'INSERT') {
                            if ('Notification' in window && Notification.permission === 'granted') {
                                new Notification(`🔔 ${t('visitor_page.notification_title')}`, {
                                    body: `${payload.new.visitor_name} ${t('visitor_page.notification_body')}`,
                                    icon: '/logo.png',
                                });
                            }
                            try {
                                const soundToPlay = doorbellSoundRef.current || localStorage.getItem('hello-doorbell-sound') || '/Ring01.mp3';
                                const audio = new Audio(soundToPlay);
                                audio.play().catch(e => console.log('Áudio bloqueado:', e));
                            } catch(e) {}

                            fetchVisitors(true);
                        } else if (payload.eventType === 'UPDATE') {
                            setVisitors(prev => prev.map(v => v.id === payload.new.id ? { ...v, ...payload.new } : v));
                            
                            if (selectedVisitorRef.current?.id === payload.new.id) {
                                setSelectedVisitor((prev: any) => ({ ...prev, ...payload.new }));
                            }

                            const newUpdate = payload.new.updated_at;
                            const oldUpdate = payload.old?.updated_at;
                            const wasPinged = oldUpdate ? newUpdate !== oldUpdate : true;
                            const isStillWaiting = ['pending', 'waiting'].includes(payload.new.status);
                            
                            if (wasPinged && isStillWaiting) {
                                try {
                                    const soundToPlay = doorbellSoundRef.current || localStorage.getItem('hello-doorbell-sound') || '/Ring01.mp3';
                                    const audio = new Audio(soundToPlay);
                                    audio.play().catch(e => console.log('Som bloqueado:', e));
                                } catch(e) {}
                            }
                        } else if (payload.eventType === 'DELETE') {
                            setVisitors(prev => prev.filter(v => v.id === payload.old.id));
                            if (selectedVisitorRef.current?.id === payload.old.id) {
                                setSelectedVisitor(null);
                            }
                        }
                    })
                    .subscribe();
            }
        };

        setupRealtime();

        return () => {
            if (visitorsSubscription) supabase.removeChannel(visitorsSubscription);
        };
    }, []);

    // Realtime Profile (Doorbell sound)
    useEffect(() => {
        let profileSubscription: any = null;

        const setupProfileRealtime = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            profileSubscription = supabase
                .channel(`profile_changes_${user.id}`)
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${user.id}`
                }, (payload) => {
                    if (payload.new.doorbell_sound) {
                        setDoorbellSound(payload.new.doorbell_sound);
                        localStorage.setItem('hello-doorbell-sound', payload.new.doorbell_sound);
                    }
                })
                .subscribe();
        };

        setupProfileRealtime();

        return () => {
            if (profileSubscription) supabase.removeChannel(profileSubscription);
        };
    }, []);

    const handleFinishAll = async () => {
        const confirmed = await confirm({
            title: t('visitors.activity.finish_all_title', 'Concluir Todos'),
            message: t('visitors.activity.finish_all_confirm', 'Deseja marcar todas as visitas ativas como concluídas?'),
            confirmLabel: t('common.confirm', 'Confirmar'),
            variant: 'primary'
        });

        if (!confirmed) return;
        
        try {
            let currentOrgId;
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();
            currentOrgId = profile?.organization_id;

            if (!currentOrgId) return;

            const { error } = await supabase
                .from('visitors')
                .update({ status: 'completed' })
                .eq('organization_id', currentOrgId)
                .in('status', ['pending', 'waiting', 'approved']);

            if (error) throw error;
            
            fetchVisitors(true);
            showToast(t('common.success', 'Sucesso!'), 'success');
        } catch (error) {
            console.error('Error finishing all:', error);
            showToast(t('common.error'), 'error');
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        setVisitors((prev: any[]) => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));

        try {
            const { error } = await supabase.rpc('update_visitor_status', {
                visitor_id: id,
                new_status: newStatus
            });

            if (error) {
                showToast(`Erro ao atualizar: ${error.message}`, 'error');
                fetchVisitors(true);
                return;
            }

            if (selectedVisitorRef.current?.id === id) {
                if (['rejected', 'completed'].includes(newStatus)) {
                    setSelectedVisitor(null);
                } else {
                    setSelectedVisitor({ ...selectedVisitorRef.current, status: newStatus });
                }
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            fetchVisitors(true);
        }
    };

    return {
        visitors,
        loading,
        offlineMessages,
        loadingMessages,
        selectedVisitor,
        setSelectedVisitor,
        fetchVisitors,
        fetchOfflineMessages,
        deleteOfflineMessage,
        handleFinishAll,
        updateStatus
    };
}
