import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Trash2, ExternalLink, Loader2, Link2, Zap, SlidersHorizontal } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import useIdeaStore from '../store/ideaStore';
import { categoryColors, priorityColors, statusColors, priorityDot, categoryBorderColors, formatDate, truncate } from '../utils/helpers';

const categories = ['all', 'startup', 'content', 'study', 'personal', 'tech', 'health', 'finance', 'other'];
const statuses   = ['all', 'raw', 'in-progress', 'decided'];
const priorities = ['all', 'high', 'medium', 'low'];
const priorityDotMap = { high: 'bg-red-500', medium: 'bg-amber-500', low: 'bg-green-500' };

export default function NotesPage() {
  const navigate = useNavigate();
  const { ideas, allIdeas, isLoading, filters, setFilters, clearFilters, fetchIdeas, deleteIdea } = useIdeaStore();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => { fetchIdeas(); }, []);

  const hasActiveFilter = filters.category !== 'all' || filters.status !== 'all' || filters.priority !== 'all' || filters.search;

  const handleDelete = async (id) => {
    await deleteIdea(id);
    setDeleteConfirm(null);
  };

  const count = (key, val) => val === 'all' ? allIdeas.length : allIdeas.filter((i) => i[key] === val).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">All Ideas</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {ideas.length} result{ideas.length !== 1 ? 's' : ''}
              {hasActiveFilter && <span> · <button onClick={clearFilters} className="text-blue-500 hover:underline">Clear filters</button></span>}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <SlidersHorizontal size={14} /> Filters
            {hasActiveFilter && <span className="w-2 h-2 rounded-full bg-blue-500" />}
          </button>
        </div>

        <div className="flex gap-6 items-start">
          {/* Filters sidebar */}
          {showFilters && (
            <aside className="w-52 shrink-0 space-y-5 bg-white rounded-2xl border border-gray-200 p-4 sticky top-20">
              {/* Search */}
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ search: e.target.value })}
                  placeholder="Search..."
                  className="w-full pl-8 pr-8 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {filters.search && (
                  <button onClick={() => setFilters({ search: '' })} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Category */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Category</p>
                <div className="space-y-0.5">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setFilters({ category: c })}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs capitalize transition-colors ${filters.category === c ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <span>{c}</span>
                      <span className={`text-[10px] rounded-full px-1.5 py-0.5 ${filters.category === c ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>{count('category', c)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Status</p>
                <div className="space-y-0.5">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilters({ status: s })}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs capitalize transition-colors ${filters.status === s ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <span>{s}</span>
                      <span className={`text-[10px] rounded-full px-1.5 py-0.5 ${filters.status === s ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>{count('status', s)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Priority</p>
                <div className="space-y-0.5">
                  {priorities.map((p) => (
                    <button
                      key={p}
                      onClick={() => setFilters({ priority: p })}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs capitalize transition-colors ${filters.priority === p ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <span className="flex items-center gap-1.5">
                        {p !== 'all' && <span className={`w-1.5 h-1.5 rounded-full ${priorityDotMap[p]}`} />}
                        {p}
                      </span>
                      <span className={`text-[10px] rounded-full px-1.5 py-0.5 ${filters.priority === p ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>{count('priority', p)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          )}

          {/* Ideas list */}
          <div className="flex-1 min-w-0 space-y-3">
            {isLoading && !ideas.length ? (
              <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-gray-300" /></div>
            ) : ideas.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                <p className="text-3xl mb-3">🔍</p>
                <p className="text-gray-400 text-sm">No ideas match your filters.</p>
                {hasActiveFilter && <button onClick={clearFilters} className="text-blue-500 text-sm mt-2 hover:underline">Clear all filters</button>}
              </div>
            ) : (
              ideas.map((idea) => (
                <IdeaRow
                  key={idea._id}
                  idea={idea}
                  onOpen={() => navigate(`/ideas/${idea._id}`)}
                  onDelete={() => setDeleteConfirm(idea._id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-2xl mb-2">🗑️</p>
            <h3 className="font-bold text-gray-800 mb-1">Delete this idea?</h3>
            <p className="text-sm text-gray-400 mb-5">This can't be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IdeaRow({ idea, onOpen, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const borderColor = categoryBorderColors[idea.category] || '#6B7280';

  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group overflow-hidden"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(v => !v)}>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full border capitalize font-medium ${categoryColors[idea.category]}`}>{idea.category}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${priorityColors[idea.priority]}`}>
                <span className="inline-flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${priorityDot[idea.priority]}`} />{idea.priority}
                </span>
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${statusColors[idea.status]}`}>{idea.status}</span>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm leading-snug">{idea.title}</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {expanded ? idea.content : truncate(idea.content, 140)}
            </p>
          </div>

          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onOpen} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Open detail">
              <ExternalLink size={14} />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
            {idea.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {idea.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">#{tag}</span>
                ))}
              </div>
            )}

            {idea.insights && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Zap size={10} /> AI insight
                </p>
                <p className="text-xs text-gray-700 leading-relaxed">{idea.insights}</p>
              </div>
            )}

            {idea.actionSteps?.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Next steps</p>
                <div className="space-y-1">
                  {idea.actionSteps.slice(0, 3).map((step, i) => (
                    <p key={i} className="text-xs text-gray-600 flex gap-2">
                      <span className="text-blue-400 font-bold shrink-0">{i + 1}.</span> {step}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
              <span className="flex items-center gap-1"><Link2 size={11} /> {idea.connections?.length || 0} hidden links</span>
              <span>{formatDate(idea.createdAt)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
