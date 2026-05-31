import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { Loader2, ArrowLeft, Send, Copy, CheckCircle2, QrCode } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export function Invites() {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const { unitId } = useParams<{ unitId: string }>();
    const navigate = useNavigate();

    const [unit, setUnit] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const [visitorName, setVisitorName] = useState('');
    const [validUntil, setValidUntil] = useState('');
    const [isPermanent, setIsPermanent] = useState(false);

    const [generatedInvite, setGeneratedInvite] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (unitId) {
            fetchUnitDetails();
        }
    }, [unitId]);

    const fetchUnitDetails = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('units')
                .select('*, property:properties(name)')
                .eq('id', unitId)
                .single();

            if (error) throw error;
            setUnit(data);

            // Get user profile for QR logo
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setProfile(profileData);
            }
        } catch (error) {
            console.error('Error fetching unit:', error);
            navigate('/dashboard/properties');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!visitorName.trim() || !unitId) return;

        setGenerating(true);
        try {
            // Gerar um token único aleatório
            const token = crypto.randomUUID();

            // Definir data limite (por defeito final do dia se não for definida)
            let expiresAt = new Date();
            if (isPermanent) {
                // Passe Permanente definido virtualmente para o final do século
                expiresAt = new Date('2099-12-31T23:59:59');
            } else if (validUntil) {
                expiresAt = new Date(validUntil);
            } else {
                expiresAt.setHours(23, 59, 59, 999);
            }

            const { data, error } = await supabase
                .from('invitations')
                .insert([{
                    unit_id: unitId,
                    token: token,
                    visitor_name: visitorName,
                    expires_at: expiresAt.toISOString(),
                }])
                .select()
                .single();

            if (error) throw error;
            setGeneratedInvite(data);
        } catch (error) {
            console.error('Error generating invite:', error);
            showToast('Erro ao gerar o convite.', 'error');
        } finally {
            setGenerating(false);
        }
    };

    const getInviteUrl = () => {
        if (!generatedInvite) return '';
        const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
        // Remover trailing slash do baseUrl se existir para evitar // na rota
        const cleanBaseUrl = baseUrl.replace(/\/$/, "");
        return `${cleanBaseUrl}/visitor/${generatedInvite.token}`;
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(getInviteUrl());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-[60vh]">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-[var(--border-dim)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-1">
                        {t('invites.new')}
                    </h1>
                    <p className="text-[var(--text-secondary)] font-medium">
                        {t('invites.form.destination')}: <span className="text-blue-400 font-bold uppercase">{unit?.name}</span> ({unit?.property?.name})
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
                {/* Lado Esquerdo - Formulário */}
                <div className="glass-panel p-8 rounded-2xl border-t border-blue-500/20 bg-[var(--bg-main)]/40 h-fit relative overflow-hidden group">
                    {/* Subtle Hover Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-700"></div>

                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-[var(--text-primary)] uppercase tracking-tight relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-[var(--bg-card)] flex items-center justify-center border border-[var(--border-dim)] shadow-inner">
                            <Send className="w-5 h-5 text-blue-500" />
                        </div>
                        {t('invites.form.details')}
                    </h3>

                    <form onSubmit={handleGenerateInvite} className="space-y-5">
                        <div>
                            <label className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[2px] mb-2 block">{t('invites.form.visitor_name')}</label>
                            <input
                                type="text"
                                required
                                value={visitorName}
                                onChange={(e) => setVisitorName(e.target.value)}
                                className="input-field relative z-10"
                                placeholder="Ex: Mário Silva, Uber Eats, CTT..."
                                disabled={generatedInvite !== null}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[2px] mb-2 flex justify-between pr-1">
                                <span>{t('invites.form.valid_until')}</span>
                                {!isPermanent && <span className="text-[10px] text-[var(--text-muted)] opacity-70 font-normal">Por defeito: Final do dia atual</span>}
                            </label>
                            <input
                                type="datetime-local"
                                value={validUntil}
                                onChange={(e) => setValidUntil(e.target.value)}
                                className={`input-field relative z-10 ${isPermanent ? 'opacity-40 cursor-not-allowed' : ''}`}
                                disabled={generatedInvite !== null || isPermanent}
                            />

                            <div className="flex items-center gap-3 mt-4">
                                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-[var(--text-secondary)] group">
                                    <input
                                        type="checkbox"
                                        checked={isPermanent}
                                        onChange={(e) => setIsPermanent(e.target.checked)}
                                        disabled={generatedInvite !== null}
                                        className="w-4 h-4 rounded border-[var(--border-dim)] bg-[var(--bg-main)] text-blue-600 focus:ring-blue-500/50 focus:ring-offset-[var(--bg-main)] transition-colors cursor-pointer disabled:opacity-50"
                                    />
                                    <span className="group-hover:text-[var(--text-primary)] transition-colors">{t('invites.form.permanent_access')}</span>
                                </label>
                            </div>
                        </div>

                        {!generatedInvite && (
                            <button type="submit" className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm uppercase tracking-[3px] shadow-2xl shadow-blue-500/30 transition-all flex items-center justify-center gap-3 w-full mt-6 relative z-10" disabled={generating}>
                                {generating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                                    <>
                                        <QrCode className="w-5 h-5" />
                                        {t('invites.form.generate_pass')}
                                    </>
                                )}
                            </button>
                        )}

                        {generatedInvite && (
                            <button
                                type="button"
                                onClick={() => {
                                    setGeneratedInvite(null);
                                    setVisitorName('');
                                    setValidUntil('');
                                    setIsPermanent(false);
                                }}
                                className="btn btn-outline border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 w-full mt-6 shadow-sm relative z-10 py-3 rounded-xl"
                            >
                                {t('invites.success.new_invite')}
                            </button>
                        )}
                    </form>
                </div>

                {/* Lado Direito - QR Code */}
                <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center min-h-[400px] border-dashed border border-[var(--border-dim)] bg-[var(--bg-main)]/20 relative overflow-hidden backdrop-blur-xl">
                    {!generatedInvite ? (
                        <div className="text-center text-[var(--text-muted)] relative z-10">
                            <div className="w-24 h-24 rounded-3xl bg-[var(--bg-card)] flex items-center justify-center mx-auto mb-6 shadow-inner border border-[var(--border-dim)]">
                                <QrCode className="w-10 h-10 opacity-40 text-blue-500" />
                            </div>
                            <p className="text-xl font-bold text-[var(--text-primary)] uppercase tracking-tight mb-2">{t('invites.activity.not_generated_title')}</p>
                            <p className="text-sm max-w-[280px] mx-auto text-[var(--text-muted)]">{t('invites.activity.not_generated_desc')}</p>
                        </div>
                    ) : (
                        <div className="w-full max-w-sm flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                            <div className="absolute top-1/3 left-1/2 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-black uppercase tracking-[2px] mb-6 shadow-glow-sm">
                                <CheckCircle2 className="w-4 h-4" /> {t('invites.activity.pass_ready')}
                            </div>

                            <div className="bg-white p-7 rounded-[2rem] shadow-2xl mb-8 border-[6px] border-[var(--bg-main)] relative">
                                <QRCodeSVG
                                    value={getInviteUrl()}
                                    size={220}
                                    bgColor={"#ffffff"}
                                    fgColor={"#0f172a"}
                                    level={"H"}
                                    imageSettings={profile?.org_logo ? {
                                        src: profile.org_logo,
                                        x: undefined,
                                        y: undefined,
                                        height: 45,
                                        width: 45,
                                        excavate: true,
                                    } : undefined}
                                />
                            </div>

                            <div className="w-full bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-dim)] mb-6 shadow-inner relative z-10">
                                <p className="text-[10px] text-[var(--text-muted)] mb-2 uppercase tracking-widest font-black">{t('invites.activity.direct_link')}</p>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        readOnly
                                        value={getInviteUrl()}
                                        className="bg-[var(--bg-main)] border border-[var(--border-dim)] text-[var(--text-primary)] text-sm px-4 py-3 rounded-xl flex-1 outline-none truncate shadow-inner focus:border-blue-500/30 transition-colors"
                                    />
                                    <button
                                        onClick={handleCopyLink}
                                        className={`p-3 rounded-xl transition-all shadow-md ${copied ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-[var(--border-dim)] text-[var(--text-muted)] border border-[var(--border-dim)] hover:text-white hover:bg-blue-600'}`}
                                        title={t('invites.success.copy_link')}
                                    >
                                        {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm text-center text-slate-400 max-w-[280px] mb-4">
                                {t('invites.activity.usage_desc')}
                            </p>

                            {window.location.hostname === 'localhost' && (
                                <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-500 font-bold uppercase tracking-wider text-center max-w-[280px]">
                                    {t('invites.activity.localhost_warning')}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
