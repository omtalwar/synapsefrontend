import { Lightbulb } from 'lucide-react';
import IdeaCard from './IdeaCard';

export default function IdeaList({ ideas, onDelete, isLoading }) {
  if (isLoading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card p-5 h-48 animate-pulse bg-gray-100" />
      ))}
    </div>
  );

  if (ideas.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Lightbulb size={48} className="text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-400">No ideas yet</h3>
      <p className="text-sm text-gray-400 mt-1">Click "New Idea" to capture your first thought</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {ideas.map((idea) => <IdeaCard key={idea._id} idea={idea} onDelete={onDelete} />)}
    </div>
  );
}
