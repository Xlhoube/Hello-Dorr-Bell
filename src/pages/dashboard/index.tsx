import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { UsersRound, Building2, Clock, Loader2, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function DashboardOverview() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        pending: 0,
        properties: 0,
        residents: 0,
        residentsList: [] as any[],
        units: 0
    });
    const [profile, setProfile] = useState<any>(null);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [weather, setWeather] = useState(() => {
        const saved = localStorage.getItem('hello-last-weather');
        return saved ? JSON.parse(saved) : { temp: 22, code: 0 };
    });

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        const updateWeatherAndLocation = async () => {
            if ("geolocation" in navigator) {
                const geoPromise = new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { 
                        timeout: 5000, 
                        enableHighAccuracy: false 
                    });
                });

                try {
                    const position: any = await geoPromise;
                    const { latitude, longitude } = position.coords;
                    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
                    const weatherData = await weatherRes.json();
                    
                    if (weatherData.current_weather) {
                        const newWeather = {
                            temp: Math.round(weatherData.current_weather.temperature),
                            code: weatherData.current_weather.weathercode
                        };
                        setWeather(newWeather);
                        localStorage.setItem('hello-last-weather', JSON.stringify(newWeather));
                    }
                } catch (err) {
                    console.warn("⚠️ [Dashboard] Could not update location/weather:", err);
                }
            }
        };

        updateWeatherAndLocation();
        const weatherRefreshInterval = setInterval(updateWeatherAndLocation, 15 * 60 * 1000);

        return () => {
            clearInterval(timer);
            clearInterval(weatherRefreshInterval);
        };
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (!profileData?.organization_id) {
                setLoading(false);
                return;
            }

            const orgId = profileData.organization_id;
            setProfile(profileData);

            const [visitorsRes, propertiesRes, residentsRes, unitsRes] = await Promise.all([
                supabase.from('visitors').select('status', { count: 'exact' }).eq('organization_id', orgId),
                supabase.from('properties').select('id', { count: 'exact' }).eq('organization_id', orgId),
                supabase.from('profiles').select('id, full_name, avatar_url', { count: 'exact' }).eq('organization_id', orgId).limit(5),
                supabase.from('units').select('id', { count: 'exact' }).eq('organization_id', orgId)
            ]);

            const allVisitors = visitorsRes.data || [];
            const residentsData = residentsRes.data || [];
            const totalVisits = visitorsRes.count || 0;
            const approvedVisits = allVisitors.filter(v => v.status === 'approved' || v.status === 'completed').length;
            const pendingVisits = allVisitors.filter(v => v.status === 'pending' || v.status === 'waiting' || v.status === 'rejected').length;

            setStats({
                total: totalVisits,
                approved: approvedVisits,
                pending: pendingVisits,
                properties: propertiesRes.count || 0,
                residents: residentsRes.count || 0,
                residentsList: residentsData.slice(0, 3),
                units: unitsRes.count || 0
            });

            const { data: recent } = await supabase
                .from('visitors')
                .select('*, unit:units(name, property:properties(name))')
                .eq('organization_id', orgId)
                .order('created_at', { ascending: false })
                .limit(4);

            setRecentActivity(recent || []);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-gradient-to-b from-[var(--primary)] to-indigo-400 rounded-full"></div>
                        <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight !mb-0">
                            {t('dashboard.welcome', { name: profile?.full_name?.split(' ')[0] || 'User' })}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3 pl-4">
                        <div className="text-sm text-[var(--text-secondary)] font-medium !mb-0 group cursor-default flex items-center gap-2">
                             {currentTime.toLocaleDateString(({ pt: 'pt-PT', en: 'en-GB', es: 'es-ES', fr: 'fr-FR' } as Record<string, string>)[i18n.language] || 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                             <span className="mx-2 opacity-30">|</span>
                             <span className="text-[var(--primary)] font-bold">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                             <span className="mx-2 opacity-30">|</span>
                             <div className="flex items-center gap-1.5 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                                 <Sun className="w-3.5 h-3.5" />
                                 <span className="text-xs font-bold">{weather.temp}°C</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 auto-rows-auto">
                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
                    <div className="glass-panel !p-4 sm:!p-8 flex flex-col justify-between hover:border-[var(--primary)] transition-all group shadow-sm bg-indigo-50/50 dark:bg-indigo-500/5">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px] mb-0">{t('dashboard.activity.total_visitors')}</p>
                            <UsersRound className="w-5 h-5 text-[var(--primary)] opacity-20 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex flex-col gap-4">
                            <h3 className="text-4xl font-bold text-[var(--primary)] tracking-tight !mb-0">{stats.total}</h3>
                            <div className="flex items-center gap-4 border-t border-[var(--primary)]/10 pt-4">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">{t('dashboard.stats.attended')}</span>
                                    <span className="text-lg font-bold text-emerald-700">{stats.approved}</span>
                                </div>
                                <div className="w-px h-8 bg-[var(--primary)]/10"></div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-rose-600 uppercase tracking-wider">{t('dashboard.stats.not_attended')}</span>
                                    <span className="text-lg font-bold text-rose-700">{stats.pending}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel !p-4 sm:!p-8 flex flex-col justify-between hover:border-[var(--primary)] transition-all group shadow-sm bg-emerald-50/50 dark:bg-emerald-500/5">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px] mb-0">{t('dashboard.activity.collaborators')}</p>
                            <UsersRound className="w-5 h-5 text-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex flex-col gap-4">
                            <h3 className="text-4xl font-bold text-emerald-600 tracking-tight !mb-0">{stats.residents}</h3>
                            <div className="flex items-center gap-2 border-t border-emerald-500/10 pt-4">
                                <div className="flex -space-x-3">
                                    {stats.residentsList.map((res: any) => (
                                        <div key={res.id} className="w-8 h-8 rounded-full border-2 border-white bg-[var(--bg-main)] flex items-center justify-center text-[8px] font-black text-emerald-600 overflow-hidden shadow-sm" title={res.full_name}>
                                            {res.avatar_url ? (
                                                <img src={res.avatar_url} alt={res.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                res.full_name?.substring(0, 2).toUpperCase() || 'U'
                                            )}
                                        </div>
                                    ))}
                                    {stats.residents > 3 && (
                                        <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-[8px] font-black text-emerald-600 shadow-sm">
                                            +{stats.residents - 3}
                                        </div>
                                    )}
                                </div>
                                <Link to="/dashboard/residents" className="text-[9px] font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-700 ml-2 transition-colors">
                                    {t('dashboard.activity.manage_access')}
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel !p-4 sm:!p-8 flex flex-col justify-between hover:border-[var(--primary)] transition-all group shadow-sm bg-amber-50/50 dark:bg-amber-500/5">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px] mb-0">{t('dashboard.activity.locations')}</p>
                            <Building2 className="w-5 h-5 text-amber-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex items-end gap-3">
                            <h3 className="text-4xl font-bold text-amber-500 tracking-tight !mb-0">{stats.properties}</h3>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-12 glass-panel !p-0 overflow-hidden flex flex-col min-h-[500px]">
                    <div className="p-4 sm:p-8 border-b border-[var(--border-dim)] flex items-center justify-between">
                        <div className="flex flex-col">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight !mb-0">{t('dashboard.activity.daily')}</h3>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">{t('dashboard.activity.realtime')}</p>
                        </div>
                        <Link to="/dashboard/visitors" className="px-5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-dim)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all rounded-xl shadow-sm">
                             {t('common.actions')}
                        </Link>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8 space-y-5">
                        {recentActivity.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-30 gap-4">
                                <div className="w-16 h-16 bg-[var(--border-dim)] rounded-full flex items-center justify-center">
                                    <Clock className="w-8 h-8" />
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-[4px] text-[var(--text-muted)]">{t('dashboard.activity.no_activity')}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto w-full">
                            <table className="w-full text-left border-collapse">
                                <tbody className="divide-y divide-[var(--border-dim)]">
                                    {recentActivity.map((visitor) => {
                                        let activeColor = 'bg-zinc-500/10 text-[var(--text-muted)]';
                                        if (visitor.status === 'approved') activeColor = 'bg-emerald-500/10 text-emerald-500';
                                        else if (visitor.status === 'pending' || visitor.status === 'waiting') activeColor = 'bg-amber-500/10 text-amber-500';

                                        return (
                                            <tr 
                                                key={visitor.id} 
                                                className="hover:bg-[var(--primary)]/[0.02] transition-colors group cursor-pointer"
                                                onClick={() => navigate(`/dashboard/visitors?chat=${visitor.id}`)}
                                            >
                                                <td className="py-5 px-4 sm:px-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-[var(--border-dim)] text-[10px] font-bold group-hover:border-[var(--primary)]/30 transition-all shadow-sm ${activeColor}`}>
                                                            <UsersRound className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-[var(--text-primary)] text-sm group-hover:text-[var(--primary)] transition-colors tracking-tight truncate max-w-[150px]">
                                                                {visitor.visitor_name}
                                                            </span>
                                                            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
                                                                ID: {visitor.id.slice(0, 8)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-4 sm:px-8">
                                                    <p className="text-[var(--text-secondary)] text-sm font-medium flex items-center gap-2">
                                                        <Building2 className="w-4 h-4 opacity-40 text-[var(--primary)]" />
                                                        {visitor.unit?.name || t('dashboard.activity.location')}
                                                    </p>
                                                </td>
                                                <td className="py-5 px-4 sm:px-8">
                                                    <span className="text-[10px] text-[var(--text-muted)] font-bold tracking-widest uppercase opacity-70 flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {new Date(visitor.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
