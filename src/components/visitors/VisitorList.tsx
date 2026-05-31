import React from 'react';
import { Clock, MessageSquare } from 'lucide-react';

interface VisitorListProps {
    displayVisitors: any[];
    setSelectedVisitor: (visitor: any) => void;
    t: any;
}

export function VisitorList({ displayVisitors, setSelectedVisitor, t }: VisitorListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2 pb-20">
            {displayVisitors.map((visitor) => (
                <button
                    key={visitor.id}
                    onClick={() => setSelectedVisitor(visitor)}
                    className="group relative bg-[var(--bg-card)]/40 hover:bg-[var(--bg-card)]/60 border border-[var(--border-dim)] hover:border-[var(--primary)]/50 rounded-2xl p-6 transition-all text-left flex items-start gap-6 hover:shadow-2xl hover:shadow-[var(--primary)]/10 hover:-translate-y-1 overflow-hidden"
                >
                    {/* Initials/Avatar */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-blue-600 text-white flex items-center justify-center shadow-lg shadow-[var(--primary)]/20 text-2xl font-black group-hover:scale-110 transition-transform flex-shrink-0">
                        {visitor.visitor_name.substring(0, 1).toUpperCase()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-[var(--text-primary)] text-xl truncate pr-2 tracking-tight group-hover:text-[var(--primary)] transition-colors">
                                {visitor.visitor_name}
                            </h3>
                            <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                                ['pending', 'waiting'].includes(visitor.status) ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                visitor.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                            }`}>
                                {t(`visitors.status.${visitor.status}`, { defaultValue: visitor.status })}
                            </span>
                        </div>
                        
                        <div className="flex flex-col gap-2 pt-1">
                            <p className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider flex items-center gap-2.5">
                                <span className="w-2 h-2 rounded-full bg-[var(--primary)] opacity-60"></span>
                                {visitor.unit?.name || 'N/A'} {visitor.unit?.property?.name ? `· ${visitor.unit.property.name}` : ''}
                            </p>
                            <div className="flex items-center gap-3.5 opacity-60">
                                <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                                <span className="text-xs font-medium text-[var(--text-muted)]">
                                    {new Date(visitor.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="absolute right-6 bottom-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 scale-75 group-hover:scale-100">
                        <div className="p-3 bg-[var(--primary)] text-white rounded-xl shadow-xl shadow-[var(--primary)]/30">
                            <MessageSquare className="w-5 h-5 font-bold" />
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
}
