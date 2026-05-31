import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../components/ui/Toast';
import { useConfirm } from '../../components/ui/ConfirmDialog';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Loader2, QrCode, CheckCircle2, Clock, Download, Trash2 } from 'lucide-react';
import { subscribeUserToPush } from '../../lib/push';
import { useVisitors } from '../../hooks/useVisitors';
import { VisitorList } from '../../components/visitors/VisitorList';
import { VisitorChat } from '../../components/visitors/VisitorChat';

export function Visitors() {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [searchParams] = useSearchParams();
    
    const [activeTab, setActiveTab] = useState<'ativos' | 'historico' | 'mensagens'>('ativos');

    const {
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
    } = useVisitors(t, showToast, confirm, searchParams);

    // 0. Pedir Permissões de Notificação Móvel / PWA
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
        
        // Ativar Subscrição PWA / Push Notifications
        subscribeUserToPush();
    }, []);

    // 1. Initial Load
    useEffect(() => {
        fetchVisitors();
    }, []);

    useEffect(() => {
        if (activeTab === 'mensagens') {
            fetchOfflineMessages();
        }
    }, [activeTab]);

    const handleExportCSV = () => {
        if (historyVisitors.length === 0) return;

        const headers = ["ID", "Visitor Name", "Status", "Destination", "Date", "Time"];
        const rows = historyVisitors.map(v => [
            v.id,
            v.visitor_name,
            v.status,
            v.unit?.name || 'N/A',
            new Date(v.created_at).toLocaleDateString(),
            new Date(v.created_at).toLocaleTimeString()
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", `${t('visitors.tabs.export_filename', { defaultValue: 'historico_visitantes' })}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const activeVisitors = visitors.filter(v => ['pending', 'waiting', 'approved'].includes(v.status));
    const historyVisitors = visitors.filter(v => !['pending', 'waiting', 'approved'].includes(v.status));

    const displayVisitors = activeTab === 'ativos' ? activeVisitors : historyVisitors;

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-2 mb-12 px-4">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-[var(--primary)] to-indigo-400 rounded-full"></div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                        {t('visitors.title')}
                    </h1>
                </div>
                <p className="text-sm text-[var(--text-secondary)] font-medium">
                    {t('visitors.subtitle')}
                </p>
            </div>

            <div className="glass-panel min-h-[500px] overflow-hidden m-0 sm:m-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 gap-4 border-b border-[var(--border-dim)] bg-[var(--bg-sidebar)]/30">
                    <div className="flex items-center gap-4">
                        <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                            {activeTab === 'ativos' ? t('visitors.tabs.active_queue') : t('visitors.tabs.entry_history')}
                        </h3>
                        {activeTab === 'ativos' && activeVisitors.length > 0 && (
                            <button
                                onClick={handleFinishAll}
                                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/20 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {t('visitors.tabs.finish_all')}
                            </button>
                        )}
                    </div>
                    <div className="flex bg-[var(--bg-main)] p-1 rounded-xl border border-[var(--border-dim)] w-full sm:w-auto">
                        <button
                            onClick={() => setActiveTab('ativos')}
                            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'ativos' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                {t('visitors.tabs.active')}
                                {activeVisitors.filter(v => v.status === 'pending').length > 0 && (
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                )}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('historico')}
                            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'historico' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                        >
                            {t('visitors.tabs.history')}
                        </button>
                        <button
                            onClick={() => setActiveTab('mensagens')}
                            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'mensagens' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                        >
                            {t('visitors.tabs.offline_messages')}
                        </button>
                    </div>
                </div>

                {activeTab === 'historico' && (
                    <div className="mx-8 my-6 p-6 bg-gradient-to-r from-[var(--primary)]/10 via-[var(--primary)]/5 to-transparent border border-[var(--primary)]/10 rounded-[var(--radius-lg)] flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-[var(--primary)]/10 rounded-2xl border border-[var(--primary)]/20 shadow-sm shadow-[var(--primary)]/5">
                                <Clock className="w-6 h-6 text-[var(--primary)]" />
                            </div>
                            <div className="flex flex-col">
                                <p className="text-[10px] font-bold uppercase tracking-[2px] text-[var(--primary)]/80 mb-1">
                                    {t('visitors.tabs.status_info')}
                                </p>
                                <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed max-w-xl opacity-80">
                                    {t('visitors.tabs.retention_notice')}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleExportCSV}
                            disabled={historyVisitors.length === 0}
                            className="group relative px-8 py-3.5 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white rounded-xl text-[10px] font-bold uppercase tracking-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--primary)]/20 flex items-center gap-3 active:scale-95"
                        >
                            <Download className="w-5 h-5 transition-transform group-hover:translate-y-0.5" />
                            {t('visitors.tabs.export')}
                        </button>
                    </div>
                )}

                {activeTab === 'mensagens' ? (
                    <div className="p-0 sm:p-6 overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--border-dim)] text-left bg-[var(--bg-sidebar)]/20">
                                    <th className="px-3 sm:px-6 py-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{t('visitors.table.visitor')}</th>
                                    <th className="px-3 sm:px-6 py-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{t('visitors.table.destination')}</th>
                                    <th className="px-3 sm:px-6 py-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{t('common.date')}</th>
                                    <th className="px-3 sm:px-6 py-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{t('visitors.table.status')}</th>
                                    <th className="px-3 sm:px-6 py-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest text-right">{t('visitors.table.action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingMessages ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--primary)] opacity-50" />
                                        </td>
                                    </tr>
                                ) : offlineMessages.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">
                                            {t('visitors.activity.no_history')}
                                        </td>
                                    </tr>
                                ) : (
                                    offlineMessages.map((msg) => (
                                        <tr key={msg.id} className="border-b border-[var(--border-dim)] hover:bg-[var(--bg-main)]/50 transition-colors group">
                                            <td className="px-3 sm:px-6 py-4">
                                                <span className="font-bold text-[var(--text-primary)]">{msg.visitor_name}</span>
                                            </td>
                                            <td className="px-3 sm:px-6 py-4">
                                                <span className="text-sm text-[var(--text-secondary)]">{msg.unit?.name || '-'}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-[var(--text-primary)]">{new Date(msg.created_at).toLocaleDateString()}</span>
                                                    <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-tighter">
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[var(--text-secondary)] italic max-w-xs truncate">
                                                "{msg.message}"
                                            </td>
                                            <td className="px-3 sm:px-6 py-4 text-right">
                                                <button
                                                    onClick={() => deleteOfflineMessage(msg.id)}
                                                    className="p-2 text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : displayVisitors.length === 0 ? (
                    <div className="text-center py-20 text-[var(--text-muted)] flex flex-col items-center border border-dashed border-[var(--border-dim)] rounded-xl m-2 bg-[var(--bg-main)]/40">
                        <div className="p-5 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-main)] rounded-3xl mb-4 shadow-inner border border-[var(--border-dim)]">
                            <QrCode className="w-12 h-12 opacity-80 text-cyan-500 font-light" />
                        </div>
                        <p className="text-xl font-medium text-[var(--text-primary)]">
                            {activeTab === 'ativos' ? t('visitors.activity.no_activity') : t('visitors.activity.no_history')}
                        </p>
                        <p className="text-sm mt-3 max-w-sm text-center text-[var(--text-muted)]">
                            {activeTab === 'ativos'
                                ? t('visitors.activity.no_activity_desc')
                                : t('visitors.activity.no_history_desc')}
                        </p>
                    </div>
                ) : (
                    <div className="w-full max-w-5xl mx-auto mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {!selectedVisitor ? (
                            <VisitorList 
                                displayVisitors={displayVisitors} 
                                setSelectedVisitor={setSelectedVisitor} 
                                t={t} 
                            />
                        ) : (
                            <VisitorChat 
                                selectedVisitor={selectedVisitor} 
                                setSelectedVisitor={setSelectedVisitor} 
                                updateStatus={updateStatus} 
                                t={t} 
                            />
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
