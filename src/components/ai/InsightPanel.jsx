import { Sparkles } from 'lucide-react';

export default function InsightPanel({ insights, isLoading }) {
  if (isLoading) return <div className="h-24 animate-pulse bg-gray-100 rounded-lg" />;
  if (!insights) return <p className="text-sm text-gray-400 text-center py-8">No insights yet. Click "Analyze" to generate.</p>;
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={15} className="text-accent" />
        <span className="text-xs font-semibold text-accent uppercase tracking-wider">AI Insight</span>
      </div>
      <p className="text-sm text-navy-900 leading-relaxed">{insights}</p>
    </div>
  );
}
