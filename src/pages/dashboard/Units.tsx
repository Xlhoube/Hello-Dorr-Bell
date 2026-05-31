import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../components/ui/Toast';
import { useConfirm } from '../../components/ui/ConfirmDialog';
import { supabase } from '../../lib/supabase';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Plus, Trash2, Loader2, ArrowLeft, DoorOpen, Edit2, Check, X, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { QRPrintTemplate } from '../../components/qr/QRPrintTemplate';

export function Units() {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const { propertyId } = useParams<{ propertyId: string }>();
    const navigate = useNavigate();

    const [property, setProperty] = useState<any>(null);
    const [units, setUnits] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [newUnitName, setNewUnitName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);


    // Edit states
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    // QR Modal states
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<any>(null);

    useEffect(() => {
        if (propertyId) {
            fetchPropertyAndUnits();
        }
    }, [propertyId]);

    const fetchPropertyAndUnits = async () => {
        setLoading(true);
        try {
            // Get property details
            const { data: propData, error: propError } = await supabase
                .from('properties')
                .select('*')
                .eq('id', propertyId)
                .single();

            if (propError) throw propError;
            setProperty(propData);

            // Get units for this property
            const { data: unitsData, error: unitsError } = await supabase
                .from('units')
                .select('*')
                .eq('property_id', propertyId)
                .order('name', { ascending: true });

            if (unitsError) throw unitsError;
            setUnits(unitsData || []);

            // Get user profile for QR template
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setProfile(profileData);


            }
        } catch (error) {
            console.error('Error fetching units:', error);
            navigate('/dashboard/properties');
        } finally {
            setLoading(false);
        }
    };

    const handleAddUnit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUnitName.trim() || !propertyId) return;



        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('units')
                .insert([{ name: newUnitName, property_id: propertyId }]);

            if (error) throw error;

            setNewUnitName('');
            fetchPropertyAndUnits();
            showToast(t('common.add_success', 'Adicionado com sucesso!'), 'success');
        } catch (error) {
            console.error('Error adding unit:', error);
            showToast(t('common.error'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSave = async (id: string) => {
        if (!editValue.trim() || editValue.trim() === units.find(u => u.id === id)?.name) {
            setEditingId(null);
            return;
        }

        try {
            const { error } = await supabase
                .from('units')
                .update({ name: editValue.trim() })
                .eq('id', id);

            if (error) throw error;

            // Actualizar state local
            setUnits(units.map(u => u.id === id ? { ...u, name: editValue.trim() } : u));
            setEditingId(null);
            showToast(t('common.update_success', 'Atualizado com sucesso!'), 'success');
        } catch (error) {
            console.error('Error updating unit:', error);
            showToast(t('common.error'), 'error');
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirm({
            title: t('units.delete_confirm_title', 'Eliminar Unidade'),
            message: t('units.delete_confirm', 'Tem a certeza que deseja eliminar esta unidade?'),
            confirmLabel: t('common.delete', 'Eliminar'),
            variant: 'danger'
        });

        if (!confirmed) return;

        try {
            const { error } = await supabase.from('units').delete().eq('id', id);
            if (error) throw error;
            fetchPropertyAndUnits();
            showToast(t('common.delete_success', 'Eliminado com sucesso!'), 'success');
        } catch (error) {
            console.error('Error deleting unit:', error);
            showToast(t('common.error'), 'error');
        }
    };

    const getAccessUrl = (unitId: string) => {
        return `${window.location.origin}/visitor/access/${unitId}`;
    };

    return (
        <DashboardLayout>
            <div className="flex items-center gap-6 mb-12 px-4">
                <button
                    onClick={() => navigate('/dashboard/properties')}
                    className="p-3 bg-[var(--bg-sidebar)] border border-[var(--border-dim)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--primary)] transition-all hover:scale-105"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-[var(--primary)] rounded-full"></div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                            {property ? property.name : '...'}
                        </h1>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] font-medium">
                        {t('units.subtitle', { defaultValue: 'Gira os espaços de acesso (ex: Porta Principal, Garagem, Anexo).' })}
                    </p>

                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* New Unit Form */}
                <div className="lg:col-span-1">
                    <div className="glass-panel !p-8">
                        <div className="flex flex-col items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-[var(--primary-glow)] rounded-xl flex items-center justify-center text-[var(--primary)] border border-[var(--primary)]/10">
                                <Plus className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                                {t('units.new_unit')}
                            </h3>
                        </div>
                        <form onSubmit={handleAddUnit} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[2px] ml-1 opacity-60">
                                    {t('units.form.name_label', { defaultValue: 'Nome (ex: Porta Frente, Apto 101)' })}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newUnitName}
                                    onChange={(e) => setNewUnitName(e.target.value)}
                                    className="input-field"
                                    placeholder={t('units.form.name_placeholder', { defaultValue: 'Indique o ponto de acesso' })}
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSubmitting || !newUnitName.trim()}
                                className="w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all hover:translate-y-[-2px] active:scale-95 border-none" 
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t('common.add')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Lista de Unidades */}
                <div className="lg:col-span-3">
                    <div className="mb-6 px-2">
                        <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
                            {t('units.list_title', { defaultValue: `Pontos de Acesso em ${property ? property.name : '...'}` })}
                        </h3>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-10 h-10 animate-spin text-[var(--primary-color)] opacity-40" />
                        </div>
                    ) : units.length === 0 ? (
                        <div className="glass-card !p-12 text-center flex flex-col items-center border-dashed !bg-[var(--bg-main)]">
                            <div className="w-20 h-20 rounded-2xl bg-[var(--primary-glow)] flex items-center justify-center mb-6">
                                <DoorOpen className="w-8 h-8 text-[var(--primary)] opacity-50" />
                            </div>
                            <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">
                                {t('units.empty.title', { defaultValue: 'Sem acessos criados' })}
                            </h3>
                            <p className="text-[var(--text-secondary)] max-w-sm mx-auto text-sm">
                                {t('units.empty.desc', { defaultValue: 'Para gerar os convites QR Premium, deve primeiro definir a hierarquia de locais.' })}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 px-1 pb-20">
                            {units.map((unit) => (
                                <div key={unit.id} className="glass-card group flex flex-col hover:border-[var(--primary)]">
                                    {/* Header do Cartão */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-14 h-14 bg-[var(--primary-glow)] rounded-[1rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <DoorOpen className="w-7 h-7 text-[var(--primary)]" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingId(unit.id);
                                                    setEditValue(unit.name);
                                                }}
                                                className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-glow)] rounded-lg transition-all border border-transparent hover:border-[var(--primary)]/20"
                                                title={t('units.edit', { defaultValue: 'Mudar Nome' })}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(unit.id)}
                                                className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20"
                                                title={t('units.delete', { defaultValue: 'Eliminar' })}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Nome / Edição */}
                                    <div className="flex-1">
                                        {editingId === unit.id ? (
                                            <div className="flex flex-col gap-2 mb-4">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        autoFocus
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleEditSave(unit.id);
                                                            if (e.key === 'Escape') setEditingId(null);
                                                        }}
                                                        className="w-full bg-[var(--bg-main)] border border-[var(--primary)] rounded-lg py-2 pl-3 pr-16 text-[var(--text-primary)] font-bold text-sm outline-none shadow-[0_0_0_2px_var(--primary-glow)]"
                                                    />
                                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                                                        <button onClick={() => handleEditSave(unit.id)} className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-md">
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
                                                {unit.name}
                                            </h3>
                                        )}


                                    </div>

                                    {/* Botão Ação */}
                                    <button
                                        onClick={() => {
                                            setSelectedUnit(unit);
                                            setShowQRModal(true);
                                        }}
                                        className="w-full mt-8 py-3.5 bg-[var(--bg-sidebar)] hover:bg-[var(--primary)] text-[var(--text-primary)] hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider border border-[var(--border-dim)] hover:border-[var(--primary)] transition-all flex items-center justify-center gap-3 group/btn shadow-sm hover:shadow-lg hover:shadow-[var(--primary-glow)]"
                                    >
                                        {t('units.qr_btn', { defaultValue: 'Gerar QR' })}
                                        <QrCode className="w-4 h-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:scale-110 transition-all" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de QR Code Fixo */}
            {showQRModal && selectedUnit && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="glass-panel max-w-lg w-full !p-0 relative animate-in zoom-in-95 duration-500 border-[var(--border-dim)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-[var(--border-dim)] bg-[var(--bg-card)]/50 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
                             <div className="flex items-center gap-3">
                                <QrCode className="w-5 h-5 text-[var(--primary)]" />
                                <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                                    {t('units.modal.title', { defaultValue: 'QR Code Permanente' })}
                                </h3>
                            </div>
                            <button 
                                onClick={() => setShowQRModal(false)}
                                className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-all hover:rotate-90"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <div className="text-center">
                                <p className="text-sm font-medium text-[var(--text-secondary)] mb-6 leading-relaxed opacity-70">
                                    {t('units.modal.desc', { defaultValue: `Cole este código no local físico (${selectedUnit.name}). Qualquer pessoa que o ler poderá identificar-se e tocar a campainha.` })}
                                </p>

                                <div className="bg-white p-6 rounded-[2rem] inline-block shadow-2xl shadow-[var(--primary)]/10 mb-6 border-8 border-[var(--zinc-50)] dark:border-[var(--zinc-800)]">
                                    <QRCodeSVG 
                                        value={getAccessUrl(selectedUnit.id)}
                                        size={180}
                                        level="H"
                                        includeMargin={true}
                                        imageSettings={profile?.org_logo ? {
                                            src: profile.org_logo,
                                            x: undefined,
                                            y: undefined,
                                            height: 35,
                                            width: 35,
                                            excavate: true,
                                        } : undefined}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="p-4 bg-[var(--bg-main)]/50 rounded-2xl border border-[var(--border-dim)] text-left mb-4">
                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[2px] mb-1 opacity-60">
                                            {t('units.modal.link_label', { defaultValue: 'Link Direto' })}
                                        </p>
                                        <p className="text-[11px] font-mono text-[var(--primary)] break-all select-all font-medium opacity-80">{getAccessUrl(selectedUnit.id)}</p>
                                    </div>
                                    
                                    <button 
                                        onClick={() => window.print()}
                                        className="w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl font-bold uppercase tracking-[2.5px] text-[10px] transition-all shadow-xl shadow-[var(--primary)]/20 flex items-center justify-center gap-3 border-none active:scale-95"
                                    >
                                        <QrCode className="w-5 h-5" /> {t('units.modal.print', { defaultValue: 'Imprimir Cartaz Agora' })}
                                    </button>
                                    
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(getAccessUrl(selectedUnit.id));
                                            alert(t('units.modal.copy_success', { defaultValue: 'Link copiado para a área de transferência!' }));
                                        }}
                                        className="w-full py-3 text-[var(--text-muted)] hover:text-[var(--primary)] rounded-xl font-bold uppercase tracking-[2px] text-[10px] transition-all opacity-60 hover:opacity-100"
                                    >
                                        {t('units.modal.copy_btn', { defaultValue: 'Copiar Link de Acesso' })}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Template de Impressão (Invisível no ecrã, visível no papel) */}
            <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
                <style dangerouslySetInnerHTML={{ __html: '@page { margin: 0; }' }} />
                {selectedUnit && (
                    <>
                        <div style={{ breakAfter: 'page' }}>
                            <QRPrintTemplate 
                                template={profile?.qr_template || 'classic'}
                                unitName={selectedUnit.name}
                                propertyName={property?.name || ''}
                                qrValue={getAccessUrl(selectedUnit.id)}
                                orgLogo={profile?.org_logo}
                            />
                        </div>
                        <QRPrintTemplate 
                            template="mini_cards"
                            unitName={selectedUnit.name}
                            propertyName={property?.name || ''}
                            qrValue={getAccessUrl(selectedUnit.id)}
                            orgLogo={profile?.org_logo}
                        />
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
