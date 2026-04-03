import { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export default function ActionSteps({ steps, isLoading }) {
  const [done, setDone] = useState([]);
  const toggle = (i) => setDone((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);

  if (isLoading) return <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-8 animate-pulse bg-gray-100 rounded-lg" />)}</div>;
  if (!steps?.length) return <p className="text-sm text-gray-400 text-center py-8">No action steps yet. Click "Analyze" to generate.</p>;

  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <button key={i} onClick={() => toggle(i)} className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${done.includes(i) ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 hover:border-accent'}`}>
          {done.includes(i) ? <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" /> : <Circle size={16} className="text-gray-400 mt-0.5 shrink-0" />}
          <span className={`text-sm ${done.includes(i) ? 'line-through text-gray-400' : 'text-navy-900'}`}>
            <span className="font-semibold text-xs text-gray-400 mr-2">#{i + 1}</span>{step}
          </span>
        </button>
      ))}
    </div>
  );
}
