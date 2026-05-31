import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { User, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { useTranslation } from 'react-i18next';

export function Register() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMSG, setErrorMSG] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    // const planParam = queryParams.get('plan') || 'Free'; // Removed unused variable
    const inviteToken = queryParams.get('invite');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMSG('');

        try {
            // 1. Criar Auth User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw authError;

            if (authData.user) {
                let finalOrgId;
                let finalRole = 'super_admin';

                // 2. Verificar convites pendentes (por TOKEN ou EMAIL)
                let inviteData = null;

                if (inviteToken) {
                    const { data: inviteByToken } = await supabase
                        .from('team_invitations')
                        .select('*')
                        .eq('token', inviteToken)
                        .single();
                    inviteData = inviteByToken;
                } else {
                    const { data: inviteByEmail } = await supabase
                        .from('team_invitations')
                        .select('*')
                        .eq('email', email.trim().toLowerCase())
                        .single();
                    inviteData = inviteByEmail;
                }

                if (inviteData) {
                    finalOrgId = inviteData.organization_id;
                    finalRole = inviteData.role || 'resident';
                } else {
                    // Sem convite: Criar nova Organização automática e silenciosa
                    const defaultOrgName = `Sistema de ${fullName.split(' ')[0] || 'Acesso'}`;
                    const { data: orgData, error: orgError } = await supabase
                        .from('organizations')
                        .insert([{ name: defaultOrgName }])
                        .select()
                        .single();

                    if (orgError) throw orgError;
                    finalOrgId = orgData.id;
                }

                // 3. Atualizar Profile
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert([{
                        id: authData.user.id,
                        full_name: fullName,
                        organization_id: finalOrgId,
                        role: finalRole 
                    }]);

                if (profileError) throw profileError;

                // Limpar convite usado
                if (inviteData) {
                    await supabase.from('team_invitations').delete().eq('id', inviteData.id);
                }

                // Login automático e redirecionar
                navigate('/dashboard');
            }
        } catch (error: any) {
            setErrorMSG(error.message || 'Ocorreu um erro ao registar.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setErrorMSG('');
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard${inviteToken ? `?invite=${inviteToken}` : ''}`
            }
        });

        if (error) {
            setErrorMSG(error.message);
            setLoading(false);
        }
    };

    const { t } = useTranslation();

    return (
        <div className="container min-h-[85vh] flex flex-col items-center justify-center py-20 px-4 bg-[var(--bg-main)]">
            <div className="w-full max-w-xl glass-panel !p-10 border-[var(--border-dim)] shadow-xl relative overflow-hidden bg-[var(--bg-sidebar)]/30">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--primary)]/5 rounded-bl-full -z-10"></div>

                <div className="text-center mb-10">
                    <Logo size="lg" className="mb-6" />
                    <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-2">{t('auth.register.title')}</h2>
                    <p className="text-sm text-[var(--text-secondary)] font-medium opacity-70">{t('auth.register.subtitle')}</p>
                </div>

                {errorMSG && (
                    <div className="bg-red-500/5 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl mb-8 text-xs font-medium text-center">
                        {errorMSG}
                    </div>
                )}

                <div className="mb-6 space-y-4">
                    <button
                        onClick={handleGoogleRegister}
                        disabled={loading}
                        className="btn w-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 transition-all font-semibold py-3 rounded-xl flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
                        type="button"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-cyan-500" /> : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                {t('auth.register.google')}
                            </>
                        )}
                    </button>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-slate-700/50"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-500 font-medium text-xs uppercase tracking-widest">{t('auth.register.or_email')}</span>
                        <div className="flex-grow border-t border-slate-700/50"></div>
                    </div>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="input-group !mb-0">
                            <label className="input-label">{t('auth.register.name_label')}</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="input-field !pl-11"
                                    placeholder={t('auth.register.name_placeholder')}
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">{t('auth.register.email_label')}</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="email"
                                required
                                className="input-field !pl-11"
                                placeholder="nome@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">{t('auth.register.password_label')}</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <ShieldCheck className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="password"
                                required
                                minLength={6}
                                className="input-field !pl-11"
                                placeholder={t('auth.register.password_placeholder')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full mt-6"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t('auth.register.submit')}
                    </button>
                </form>

                <div className="mt-10 text-center text-sm border-t border-[var(--border-dim)] pt-8">
                    <span className="text-[var(--text-secondary)] opacity-70">{t('auth.register.have_account')}</span>{' '}
                    <Link to="/login" className="text-[var(--primary)] hover:text-[var(--primary)]/80 font-bold transition-colors">
                        {t('auth.register.login')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
