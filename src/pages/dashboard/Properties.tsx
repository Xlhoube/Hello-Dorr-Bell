import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Building2, Plus, Trash2, Loader2, Edit2, Check, X, ArrowRight, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../components/ui/Toast';
import { useConfirm } from '../../components/ui/ConfirmDialog';

export function Properties() {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const navigate = useNavigate();
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPropName, setNewPropName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit states
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');


    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        const checkOnboarding = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const tutorialKey = `hello_onboarding_v2_${user.id}`;
                if (!localStorage.getItem(tutorialKey)) {
                    setShowOnboarding(true);
                }
            }
        };
        checkOnboarding();
        fetchProperties();
    }, []);

    const fetchProperties = async () => {

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .maybeSingle();

            if (!profile || !profile.organization_id) {
                setLoading(false);
                return;
            }

            const { data, error: fetchError } = await supabase
                .from('properties')
                .select('*, units(count)')
                .eq('organization_id', profile.organization_id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setProperties(data || []);


        } catch (error) {
            console.error('Error fetching properties:', error);
            showToast(t('properties.errors.add_failed', 'Não foi possível carregar os locais.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddProperty = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPropName.trim()) return;



        setIsSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .maybeSingle();

            if (profileError) {
                console.error("Erro RLS/Supabase ao obter perfil:", profileError);
                showToast(`Erro de base de dados: ${profileError.message}`, 'error');
                setIsSubmitting(false);
                return;
            }

            if (!profile || !profile.organization_id) {
                console.warn("Perfil ou organization_id não encontrado para o utilizador atual.");
                showToast("O seu perfil ainda não está configurado. Tente reentrar.", 'error');
                setIsSubmitting(false);
                return;
            }

            const { error: insertError } = await supabase
                .from('properties')
                .insert([{ 
                    name: newPropName, 
                    organization_id: profile.organization_id 
                }]);
            
            if (insertError) throw insertError;

            setNewPropName('');
            setIsModalOpen(false);
            fetchProperties();
            showToast(t('common.save_success', 'Guardado com sucesso!'), 'success');
        } catch (error: any) {
            console.error('Error adding property:', error);
            showToast(`Falha fatal ao criar local: ${error.message || 'Erro desconhecido.'}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSave = async (id: string) => {
        if (!editValue.trim() || editValue.trim() === properties.find(p => p.id === id)?.name) {
            setEditingId(null);
            return;
        }

        try {
            const { error } = await supabase
                .from('properties')
                .update({ name: editValue.trim() })
                .eq('id', id);

            if (error) throw error;

            setProperties(properties.map(p => p.id === id ? { ...p, name: editValue.trim() } : p));
            setEditingId(null);
        } catch (error) {
            console.error('Error updating property:', error);
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirm({
            title: t('properties.delete.title', 'Eliminar Local'),
            message: t('properties.delete.confirm', 'Tem a certeza que deseja eliminar esta propriedade? Todas as unidades e registos associados serão apagados.'),
            confirmLabel: t('common.delete', 'Eliminar'),
            variant: 'danger'
        });

        if (!confirmed) return;

        try {
            const { error } = await supabase.from('properties').delete().eq('id', id);
            if (error) throw error;
            fetchProperties();
            showToast(t('common.delete_success', 'Eliminado com sucesso!'), 'success');
        } catch (error) {
            console.error('Error deleting property:', error);
            showToast(t('common.error', 'Ocorreu um erro.'), 'error');
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header Superior */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 px-2">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-8 bg-gradient-to-b from-[var(--primary)] to-indigo-400 rounded-full"></div>
                            <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">{t('nav.properties', 'Locais')}</h1>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] font-medium opacity-70 ml-2 md:ml-5">
                            {t('properties.subtitle', 'Faça a gestão dos seus edifícios, condomínios ou espaços de escritórios.')}
                        </p>
                    </div>

                    <div className="relative">
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--primary)] via-indigo-600 to-indigo-800 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-900/20 hover:shadow-indigo-500/30 active:scale-95 transition-all group border-none whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                            {t('properties.add_btn', 'Novo Local')}
                        </button>

                        {/* Onboarding Hint for Add Property */}
                        {showOnboarding && (
                            <div className="absolute top-full mt-4 right-0 w-48 p-4 bg-indigo-600 rounded-2xl shadow-2xl z-[70] animate-bounce-y text-right">
                                <p className="text-[11px] text-white font-bold leading-tight">
                                    {t('onboarding.hint_add_property')}
                                </p>
                                <div className="absolute bottom-full right-6 border-8 border-transparent border-b-indigo-600" />
                            </div>
                        )}
                    </div>

                </div>

                {/* Filtros e Stats (Opcional - Layout Mockup) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 px-2 max-w-2xl">
                    <div className="glass-card flex items-center gap-4 !p-5">
                        <div className="w-12 h-12 bg-[var(--primary-glow)] rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-[var(--primary)]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{t('properties.total_locations')}</p>
                            <h4 className="text-xl font-black text-[var(--text-primary)]">{properties.length}</h4>
                        </div>
                    </div>
                </div>

                {/* Grid de Propriedades */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[400px]">
                        <Loader2 className="w-12 h-12 animate-spin text-[var(--primary)] opacity-40 mb-4" />
                        <p className="text-sm font-bold text-zinc-500 animate-pulse tracking-widest uppercase">Loading...</p>
                    </div>
                ) : properties.length === 0 ? (
                    <div className="glass-card !p-12 text-center flex flex-col items-center border-dashed !bg-[var(--bg-main)]">
                        <div className="w-20 h-20 rounded-2xl bg-[var(--primary-glow)] flex items-center justify-center mb-6">
                            <Building2 className="w-8 h-8 text-[var(--primary)] opacity-50" />
                        </div>
                        <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">
                            {t('properties.empty.title', 'Ainda sem locais registados')}
                        </h3>
                        <p className="text-[var(--text-secondary)] max-w-sm mx-auto mb-8 text-sm">
                            {t('properties.empty.subtitle', 'Crie o seu primeiro local de acesso para poder gerir unidades e residentes.')}
                        </p>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="btn btn-outline py-3 px-6 text-sm"
                        >
                             <Plus className="w-4 h-4" /> {t('properties.add_location')}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2 pb-20">
                        {properties.map((prop) => (
                            <div 
                                key={prop.id} 
                                className="glass-card group flex flex-col hover:border-[var(--primary)]"
                            >
                                {/* Header do Cartão */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-14 h-14 bg-[var(--primary-glow)] rounded-[1rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <Building2 className="w-7 h-7 text-[var(--primary)]" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => {
                                                setEditingId(prop.id);
                                                setEditValue(prop.name);
                                            }}
                                            className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-glow)] rounded-lg transition-all border border-transparent hover:border-[var(--primary)]/20"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(prop.id)}
                                            className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Nome / Edição */}
                                <div className="flex-1">
                                    {editingId === prop.id ? (
                                        <div className="flex flex-col gap-2 mb-4">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="w-full bg-[var(--bg-main)] border border-[var(--primary)] rounded-lg py-2 pl-3 pr-16 text-[var(--text-primary)] font-bold text-sm outline-none shadow-[0_0_0_2px_var(--primary-glow)]"
                                                />
                                                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                                                    <button onClick={() => handleEditSave(prop.id)} className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-md">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <h3 className="text-xl font-black text-[var(--text-primary)] mb-1 group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                                            {prop.name}
                                        </h3>
                                    )}
                                    
                                    {/* Stats (Unidades) */}
                                    <div className="flex items-center gap-3 mt-4">
                                        <div className="px-3 py-1.5 bg-[var(--bg-main)] border border-[var(--border-dim)] rounded-lg flex items-center gap-2">
                                            <LayoutGrid className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                            <span className="text-xs font-bold text-[var(--text-secondary)]">
                                                {prop.units?.[0]?.count || 0} {prop.units?.[0]?.count === 1 ? t('properties.access_point') : t('properties.access_points')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Botão Ação */}
                                <button 
                                    onClick={() => navigate(`/dashboard/properties/${prop.id}/units`)}
                                    className="w-full mt-8 py-3.5 bg-[var(--bg-sidebar)] hover:bg-[var(--primary)] text-[var(--text-primary)] hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider border border-[var(--border-dim)] hover:border-[var(--primary)] transition-all flex items-center justify-center gap-3 group/btn shadow-sm hover:shadow-lg hover:shadow-[var(--primary-glow)]"
                                >
                                    {t('properties.manage_access_points')}
                                    <ArrowRight className="w-4 h-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Criação (Thunder Style) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-lg border-[var(--primary)]/20 p-8 shadow-2xl relative overflow-hidden !rounded-[2.5rem] animate-in zoom-in-95 duration-300">
                        {/* Blob Background */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--primary)]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="w-14 h-14 bg-[var(--primary-glow)] rounded-2xl flex items-center justify-center border border-[var(--primary)]/10">
                                    <Building2 className="w-7 h-7 text-[var(--primary)]" />
                                </div>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-3 bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--danger)] rounded-2xl hover:bg-red-500/10 transition-all border border-[var(--border-dim)]"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-3 italic leading-none">
                                {t('properties.modal.title')}
                            </h2>
                            <p className="text-[var(--text-secondary)] mb-8 leading-relaxed font-medium text-sm max-w-sm">
                                {t('properties.modal.description')}
                            </p>

                            <form onSubmit={handleAddProperty} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[3px] text-[var(--primary)]/80 ml-2">
                                        {t('properties.modal.label')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                            <Building2 className="w-5 h-5 text-[var(--text-muted)]" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={newPropName}
                                            onChange={(e) => setNewPropName(e.target.value)}
                                            placeholder={t('properties.modal.placeholder')}
                                            className="w-full bg-[var(--bg-main)] border border-[var(--border-dim)] hover:border-[var(--primary)]/40 focus:border-[var(--primary)] rounded-2xl py-4 pl-14 pr-6 text-[var(--text-primary)] text-base font-bold placeholder-[var(--text-muted)] outline-none transition-all shadow-inner focus:ring-4 focus:ring-[var(--primary-glow)]"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 bg-[var(--bg-main)] hover:bg-[var(--border-highlight)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-2xl text-[10px] font-black uppercase tracking-[2.5px] transition-all border border-[var(--border-dim)]"
                                    >
                                        {t('properties.modal.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !newPropName.trim()}
                                        className="flex-[2] py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-2xl text-[10px] font-black uppercase tracking-[2.5px] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--primary-glow)] flex items-center justify-center gap-3 border-none active:scale-95"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>{t('properties.modal.submit')}</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
