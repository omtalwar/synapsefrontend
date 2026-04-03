import { AlertTriangle } from 'lucide-react';

export default function MissingParts({ parts, isLoading }) {
  if (isLoading) return <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 animate-pulse bg-gray-100 rounded-lg" />)}</div>;
  if (!parts?.length) return <p className="text-sm text-gray-400 text-center py-8">No gaps identified yet. Click "Analyze" to generate.</p>;

  return (
    <div className="space-y-2">
      {parts.map((part, i) => (
        <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-900">{part}</p>
        </div>
      ))}
    </div>
  );
}
