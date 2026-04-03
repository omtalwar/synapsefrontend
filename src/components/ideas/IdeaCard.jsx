import { useNavigate } from 'react-router-dom';
import { Trash2, ExternalLink, Link2, Zap } from 'lucide-react';
import { categoryColors, priorityColors, statusColors, priorityDot, truncate, formatDate } from '../../utils/helpers';

export default function IdeaCard({ idea, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            {idea.insights && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                <Zap size={9} /> AI Insight
              </span>
            )}
            {idea.priority === 'high' && (
              <span className="inline-flex text-[10px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                Recommended
              </span>
            )}
          </div>
          <h3 className="font-semibold text-navy-900 text-sm leading-snug line-clamp-2">{idea.title}</h3>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => navigate(`/ideas/${idea._id}`)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-accent transition-colors">
            <ExternalLink size={14} />
          </button>
          <button onClick={() => onDelete(idea._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <p className="text-gray-500 text-xs leading-relaxed">{truncate(idea.content, 120)}</p>

      <div className="flex flex-wrap gap-1.5">
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${categoryColors[idea.category]}`}>{idea.category}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${priorityColors[idea.priority]}`}>
          <span className="inline-flex items-center gap-1"><span className={`w-1.5 h-1.5 rounded-full ${priorityDot[idea.priority]}`} />{idea.priority}</span>
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[idea.status]}`}>{idea.status}</span>
      </div>

      {idea.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {idea.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">#{tag}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Link2 size={11} /> {idea.connections?.length || 0} Hidden Links
        </span>
        <span className="text-xs text-gray-400">{formatDate(idea.createdAt)}</span>
      </div>
    </div>
  );
}
