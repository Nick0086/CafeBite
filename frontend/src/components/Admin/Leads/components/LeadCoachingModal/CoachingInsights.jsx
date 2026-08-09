import React from 'react';
import { CheckCircle2, AlertCircle, Target, Sparkles, Star } from 'lucide-react';

function SectionCard({ icon: Icon, iconColor, title, children }) {
    return (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h5 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${iconColor}`}>
                <Icon className="w-4 h-4" />
                {title}
            </h5>
            {children}
        </div>
    );
}

export function CoachingInsights({ activeRecording }) {
    if (!activeRecording) return null;

    return (
        <div className="space-y-4">
            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SectionCard icon={CheckCircle2} iconColor="text-emerald-400" title="Key Strengths">
                    {activeRecording.strengths?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {activeRecording.strengths.map((str, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                                    <Star className="w-2.5 h-2.5" />
                                    {str}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-500">No strengths recorded.</p>
                    )}
                </SectionCard>

                <SectionCard icon={AlertCircle} iconColor="text-amber-400" title="Areas to Improve">
                    {activeRecording.improvements?.length > 0 ? (
                        <ul className="space-y-1.5">
                            {activeRecording.improvements.map((imp, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                    <span className="text-amber-400 font-bold mt-0.5">•</span>
                                    <span>{imp}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-xs text-slate-500">No improvements listed.</p>
                    )}
                </SectionCard>
            </div>

            {/* Objection Handling */}
            {activeRecording.objection_handling?.length > 0 && (
                <SectionCard icon={Target} iconColor="text-indigo-400" title="Objection Handling Tips">
                    <ul className="space-y-2">
                        {activeRecording.objection_handling.map((obj, idx) => (
                            <li key={idx} className="text-xs text-slate-300 p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                                {obj}
                            </li>
                        ))}
                    </ul>
                </SectionCard>
            )}

            {/* Closing Recommendations */}
            {activeRecording.closing_recommendations && (
                <SectionCard icon={Sparkles} iconColor="text-purple-400" title="Closing Plan & Next Steps">
                    <p className="text-xs text-slate-300 leading-relaxed bg-purple-500/5 border border-purple-500/15 p-3 rounded-xl">
                        {activeRecording.closing_recommendations}
                    </p>
                </SectionCard>
            )}
        </div>
    );
}

export default CoachingInsights;
