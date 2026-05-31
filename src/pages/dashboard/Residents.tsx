import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Users, Trash2, Loader2, ShieldAlert, X, CheckCircle2, Share2, Copy, MessageCircle, QrCode, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../components/ui/Toast';
import { useConfirm } from '../../components/ui/ConfirmDialog';

export function Residents() {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [residents, setResidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [organizationId, setOrganizationId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [invitations, setInvitations] = useState<any[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [lastInviteEmail, setLastInviteEmail] = useState('');

    useEffect(() => {
        fetchResidents();
    }, []);

    const fetchResidents = async () => {
        setLoading(true);
        try {
            // Get current user's profile and org
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: currentUserProfile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (!currentUserProfile?.organization_id) {
                setLoading(false);
                return;
            }

            setOrganizationId(currentUserProfile.organization_id);

            // Get all profiles in this organization
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, role, phone, created_at, avatar_url')
                .eq('organization_id', currentUserProfile.organization_id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            console.log('👥 [Residents] Data received:', data);
            setResidents(data || []);

            // Obter convites pendentes
            try {
                const { data: invitesInfo, error: inviteErr } = await supabase
                    .from('team_invitations')
                    .select('*')
                    .eq('organization_id', currentUserProfile.organization_id)
                    .order('created_at', { ascending: false });
                    
                if (inviteErr) {
                    console.warn("⚠️ [Residents] Contas de convites não carregadas. A tabela 'team_invitations' pode não existir:", inviteErr.message);
                } else {
                    setInvitations(invitesInfo || []);
                }
            } catch (err) {
                console.error("❌ [Residents] Critical error fetching invites:", err);
            }
        } catch (error) {
            console.error('Error fetching residents/invites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirm({
            title: t('residents.delete_confirm_title', 'Remover Membro'),
            message: t('residents.delete_confirm', 'Tem a certeza que deseja remover este membro da organização?'),
            confirmLabel: t('common.delete', 'Eliminar'),
            variant: 'danger'
        });

        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ organization_id: null, role: 'user' })
                .eq('id', id);

            if (error) throw error;
            fetchResidents();
            showToast(t('common.delete_success', 'Removido com sucesso!'), 'success');
        } catch (error) {
            console.error('Error removing resident:', error);
            showToast(t('residents.delete_error', 'Erro ao remover membro.'), 'error');
        }
    };

    const getInviteLink = (token: string) => {
        return `${window.location.origin}/register?invite=${token}`;
    };

    const handleShareWhatsApp = (token: string) => {
        const link = getInviteLink(token);
        const text = encodeURIComponent(t('residents.modal.whatsapp_message', { link }));
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const handleShareEmail = (token: string) => {
        const link = getInviteLink(token);
        const subject = encodeURIComponent(t('residents.modal.email_subject'));
        const body = encodeURIComponent(t('residents.modal.email_body', { link }));
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const handleCopyLink = (token: string) => {
        const link = getInviteLink(token);
        navigator.clipboard.writeText(link);
        showToast(t('residents.modal.link_copied', 'Link copiado!'), 'success');
    };

    const handleGenerateInvite = async () => {
        setIsSubmitting(true);
        setMessage(null);

        try {
            const { data, error: inviteError } = await supabase
                .from('team_invitations')
                .insert([{ organization_id: organizationId, role: 'resident' }])
                .select()
                .single();

            if (inviteError) throw inviteError;
 
            setMessage({ type: 'success', text: t('residents.modal.invite_success') });
            setLastInviteEmail(data.token); // Usamos o campo lastInviteEmail para guardar o token temporariamente
            setShowShareOptions(true);
            fetchResidents();
        } catch (error: any) {
            console.error('Error generating invite:', error);
            const errorDetail = error.message || 'Erro desconhecido';
            setMessage({ 
                type: 'error', 
                text: `${t('residents.modal.invite_error')}: ${errorDetail}` 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteInvite = async (invitationId: string) => {
        const confirmed = await confirm({
            title: t('residents.modal.delete_invite_title', 'Cancelar Convite'),
            message: t('residents.modal.delete_invite_confirm', 'Tem a certeza que deseja cancelar este convite?'),
            confirmLabel: t('common.cancel', 'Cancelar'),
            variant: 'danger'
        });

        if (!confirmed) return;
        try {
            const { error } = await supabase
                .from('team_invitations')
                .delete()
                .eq('id', invitationId);

            if (error) throw error;
            fetchResidents();
            showToast(t('common.delete_success', 'Cancelado com sucesso!'), 'success');
        } catch (error) {
            console.error('Error removing invite:', error);
            showToast(t('residents.modal.error', 'Erro ao cancelar convite.'), 'error');
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 px-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-gradient-to-b from-[var(--primary)] to-indigo-400 rounded-full"></div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                            {t('residents.title')}
                        </h1>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] font-medium">
                        {t('residents.subtitle')}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setShowShareOptions(false);
                        setIsModalOpen(true);
                    }}
                    className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-all hover:translate-y-[-2px] active:scale-95 border-none"
                >
                    <Share2 className="w-4 h-4" /> {t('residents.add_member')}
                </button>
            </div>

            <div className="glass-panel overflow-hidden min-h-[400px] m-2">
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : !organizationId ? (
                    <div className="text-center py-16 text-[var(--text-muted)]">
                        <ShieldAlert className="w-12 h-12 text-[var(--text-muted)] opacity-30 mx-auto mb-4" />
                        <h3 className="text-xl mb-2 text-[var(--text-primary)] font-bold uppercase">{t('residents.unknown_org')}</h3>
                        <p>{t('residents.wait_association')}</p>
                    </div>
                ) : residents.length === 0 ? (
                    <div className="text-center py-16 text-[var(--text-secondary)] flex flex-col items-center">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-card)] flex items-center justify-center mb-6 shadow-inner border border-[var(--border-dim)]">
                            <Users className="w-8 h-8 text-blue-500" />
                        </div>
                        <p className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-wider">{t('residents.no_residents')}</p>
                        <p className="text-xs mt-2 max-w-sm text-center text-[var(--text-muted)]">{t('residents.no_residents_desc')}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest border-b border-[var(--border-dim)] bg-[var(--bg-sidebar)]/30">
                                    <th className="py-5 px-4 sm:px-8 font-bold">{t('residents.table.name')}</th>
                                    <th className="py-5 px-4 sm:px-8 font-bold">{t('residents.table.role')}</th>
                                    <th className="py-5 px-4 sm:px-8 font-bold">{t('residents.table.accesses')}</th>
                                    <th className="py-5 px-4 sm:px-8 font-bold">{t('residents.table.email')}</th>
                                    <th className="py-5 px-4 sm:px-8 text-right font-bold">{t('residents.table.action')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-dim)]">
                                {residents.map((person) => (
                                    <tr key={person.id} className="hover:bg-[var(--primary)]/[0.02] transition-colors group">
                                        <td className="py-5 px-4 sm:px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-[var(--bg-main)] flex items-center justify-center border border-[var(--border-dim)] text-[10px] font-bold text-[var(--primary)] group-hover:border-[var(--primary)]/30 transition-all shadow-sm overflow-hidden relative">
                                                    {person.avatar_url ? (
                                                        <img src={person.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        person.full_name ? person.full_name.substring(0, 2).toUpperCase() : 'U'
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[var(--text-primary)] text-sm group-hover:text-[var(--primary)] transition-colors tracking-tight">{person.full_name || t('common.unknown')}</span>
                                                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">ID: {person.id.slice(0, 8)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8 text-[10px] font-bold uppercase tracking-wider">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full border shadow-sm ${person.role === 'super_admin'
                                                ? 'bg-[var(--primary)]/5 text-[var(--primary)] border-[var(--primary)]/10'
                                                : 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10'
                                                }`}>
                                                {person.role === 'super_admin' ? t('residents.role.admin') : t('residents.role.resident')}
                                            </span>
                                        </td>
                                        <td className="py-5 px-4 sm:px-8">
                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 rounded-lg text-[9px] font-black uppercase tracking-wider">
                                                    {t('residents.access.total')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8 text-[var(--text-secondary)] text-sm font-medium">
                                            {person.email || '—'}
                                        </td>
                                        <td className="py-5 px-8 text-right">
                                            <button
                                                onClick={() => handleDelete(person.id)}
                                                className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all disabled:opacity-20"
                                                title={t('residents.table.revoke_access')}
                                                disabled={person.role === 'super_admin'}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {invitations.map((invite) => (
                                    <tr key={invite.id} className="hover:bg-[var(--primary)]/[0.01] transition-colors group opacity-70">
                                        <td className="py-5 px-4 sm:px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-[var(--bg-main)]/50 flex items-center justify-center border border-dashed border-[var(--border-dim)] text-[var(--text-muted)]">
                                                    <Mail className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[var(--text-primary)] text-[10px] uppercase tracking-wider opacity-60">{t('residents.invite_status')}</span>
                                                    <span className="text-[10px] text-[var(--text-muted)] font-medium tracking-tight mt-0.5">Token: {invite.token?.slice(0, 8)}...</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8 text-[10px] font-bold uppercase tracking-wider">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full border bg-zinc-500/5 text-[var(--text-muted)] border-[var(--border-dim)]">
                                                {invite.role === 'super_admin' ? t('residents.role.admin') : t('residents.role.resident')}
                                            </span>
                                        </td>
                                        <td className="py-5 px-8 text-[var(--text-secondary)] text-sm font-medium opacity-60 italic">
                                            {invite.email || t('residents.access.link_invite')}
                                        </td>
                                        <td className="py-5 px-8 text-[var(--text-secondary)] text-sm">
                                            —
                                        </td>
                                        <td className="py-5 px-8 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setLastInviteEmail(invite.token || invite.email);
                                                        setShowShareOptions(true);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-2 text-[var(--primary)] hover:bg-[var(--primary)]/5 rounded-xl transition-all"
                                                    title={t('common.share')}
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteInvite(invite.id)}
                                                    className="p-2 text-[var(--text-muted)] hover:text-amber-500 hover:bg-amber-500/5 rounded-xl transition-all"
                                                    title={t('common.cancel')}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Member Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-md glass-panel !p-8 animate-in fade-in zoom-in duration-300 border-[var(--border-dim)] shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                                {showShareOptions ? t('residents.modal.share_title') : t('residents.modal.title')}
                            </h3>
                            <button onClick={() => {
                                setIsModalOpen(false);
                                setShowShareOptions(false);
                                setMessage(null);
                            }} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {message && (
                            <div className={`mb-8 p-5 rounded-[var(--radius-md)] flex items-center gap-4 border shadow-sm ${message.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400'
                                }`}>
                                <div className={`p-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                                </div>
                                <span className="text-xs font-bold uppercase tracking-[1.5px] leading-relaxed">{message.text}</span>
                            </div>
                        )}

                        {showShareOptions ? (
                            <div className="space-y-4">
                                <p className="text-sm font-medium text-[var(--text-secondary)] mb-8 opacity-70 leading-relaxed text-center">
                                    {t('residents.modal.share_desc')}
                                </p>
                                
                                <button
                                    onClick={() => handleShareWhatsApp(lastInviteEmail)}
                                    className="w-full py-4 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-[2px] shadow-lg shadow-emerald-500/20 transition-all hover:translate-y-[-2px] active:scale-95"
                                >
                                    <MessageCircle className="w-5 h-5" /> {t('residents.modal.whatsapp')}
                                </button>
 
                                <button
                                    onClick={() => handleShareEmail(lastInviteEmail)}
                                    className="w-full py-4 bg-[var(--zinc-100)] dark:bg-[var(--zinc-800)] hover:bg-[var(--zinc-200)] dark:hover:bg-[var(--zinc-700)] text-[var(--zinc-900)] dark:text-white rounded-xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-[2px] transition-all hover:translate-y-[-2px] active:scale-95 border border-[var(--border-dim)]"
                                >
                                    <Mail className="w-5 h-5" /> {t('residents.modal.email')}
                                </button>
 
                                <button
                                    onClick={() => handleCopyLink(lastInviteEmail)}
                                    className="w-full py-4 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/[0.15] text-[var(--primary)] border border-[var(--primary)]/20 rounded-xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-[2px] transition-all hover:translate-y-[-2px] active:scale-95"
                                >
                                    <Copy className="w-5 h-5" /> {t('residents.modal.copy')}
                                </button>
                                
                                <div className="pt-6">
                                    <button 
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setShowShareOptions(false);
                                            setMessage(null);
                                        }}
                                        className="w-full text-[10px] uppercase font-bold tracking-[2.5px] text-[var(--text-muted)] hover:text-[var(--primary)] transition-all opacity-60 hover:opacity-100"
                                    >
                                        {t('residents.modal.done')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8 text-center">
                                <div className="p-8 bg-[var(--primary)]/5 rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--primary)]/20 mb-2 shadow-inner">
                                    <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[var(--primary)] shadow-sm">
                                        <Share2 className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-xl font-bold text-[var(--text-primary)] tracking-tight mb-3">{t('residents.modal.new_link_title')}</h4>
                                    <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-widest font-medium leading-relaxed opacity-70">
                                        {t('residents.modal.new_link_desc')}
                                    </p>
                                </div>
 
                                <button
                                    onClick={handleGenerateInvite}
                                    disabled={isSubmitting}
                                    className="w-full py-5 bg-[var(--primary)] hover:bg-[var(--primary-light)] disabled:opacity-50 text-white rounded-xl flex items-center justify-center gap-4 font-bold text-[11px] uppercase tracking-[3px] shadow-xl shadow-[var(--primary)]/20 transition-all hover:translate-y-[-2px] active:scale-95 border-none"
                                >
                                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <QrCode className="w-6 h-6" />}
                                    {t('residents.modal.generate_btn')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
