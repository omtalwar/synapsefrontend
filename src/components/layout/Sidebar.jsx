import useIdeaStore from '../../store/ideaStore';

const categories = ['all', 'startup', 'content', 'study', 'personal', 'tech', 'health', 'finance', 'other'];
const statuses = ['all', 'raw', 'in-progress', 'decided'];
const priorities = ['all', 'high', 'medium', 'low'];

const priorityDot = { high: 'bg-red-500', medium: 'bg-amber-500', low: 'bg-green-500' };

export default function Sidebar() {
  const { filters, setFilters, clearFilters, allIdeas } = useIdeaStore();

  const count = (key, val) => val === 'all' ? allIdeas.length : allIdeas.filter((i) => i[key] === val).length;

  return (
    <aside className="w-56 shrink-0 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</p>
          {(filters.category !== 'all' || filters.status !== 'all' || filters.priority !== 'all') && (
            <button onClick={clearFilters} className="text-xs text-accent hover:underline">Clear</button>
          )}
        </div>
        <div className="space-y-0.5">
          {categories.map((c) => (
            <button key={c} onClick={() => setFilters({ category: c })}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${filters.category === c ? 'bg-accent text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <span>{c}</span>
              <span className={`text-xs rounded-full px-1.5 ${filters.category === c ? 'bg-white/20' : 'bg-gray-200 text-gray-500'}`}>{count('category', c)}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</p>
        <div className="space-y-0.5">
          {statuses.map((s) => (
            <button key={s} onClick={() => setFilters({ status: s })}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${filters.status === s ? 'bg-accent text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <span>{s}</span>
              <span className={`text-xs rounded-full px-1.5 ${filters.status === s ? 'bg-white/20' : 'bg-gray-200 text-gray-500'}`}>{count('status', s)}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Priority</p>
        <div className="space-y-0.5">
          {priorities.map((p) => (
            <button key={p} onClick={() => setFilters({ priority: p })}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${filters.priority === p ? 'bg-accent text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <span className="flex items-center gap-2">
                {p !== 'all' && <span className={`w-2 h-2 rounded-full ${priorityDot[p]}`} />}{p}
              </span>
              <span className={`text-xs rounded-full px-1.5 ${filters.priority === p ? 'bg-white/20' : 'bg-gray-200 text-gray-500'}`}>{count('priority', p)}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
