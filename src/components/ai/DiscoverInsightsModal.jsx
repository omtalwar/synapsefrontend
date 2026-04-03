import { useState } from 'react';
import { X, Loader2, Sparkles, Zap, ArrowRight, Brain } from 'lucide-react';
import { discoverAPI } from '../../api/ai';

export default function DiscoverInsightsModal({ ideas, onClose }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const run = async () => {
    setLoading(true); setError('');
    try {
      const res = await discoverAPI();
      setResult(res.data.data);
    } catch {
      setError('AI couldn\'t process ideas. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Map ideaId to title for display
  const ideaMap = {};
  ideas.forEach((i) => { ideaMap[i._id] = i.title; });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-sm">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">Discover Insights</h2>
              <p className="text-xs text-gray-400">AI finds hidden links across your ideas</p>
            </div>
            <span className="ml-2 text-[10px] font-bold bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full uppercase tracking-wide">AI Powered</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Idle state */}
          {!result && !loading && (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">Uncover what you're missing</h3>
              <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                AI will scan all {ideas.length} idea{ideas.length !== 1 ? 's' : ''} and surface hidden connections, patterns, and opportunities you haven't noticed yet.
              </p>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <button
                onClick={run}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <Zap size={16} />
                Run Discovery
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-14">
              <Loader2 size={32} className="animate-spin text-violet-500 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Analyzing your ideas...</p>
              <p className="text-gray-400 text-xs mt-1">Finding hidden patterns and connections</p>
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <div className="space-y-6">

              {/* Hidden Connections */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">💡</span>
                  <h3 className="font-bold text-gray-900">Hidden Connections Found</h3>
                  <span className="text-xs bg-blue-100 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
                    {result.connections?.length || 0} found
                  </span>
                </div>

                {(!result.connections || result.connections.length === 0) && (
                  <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-400 text-sm">
                    No strong connections found yet. Add more ideas to unlock deeper patterns.
                  </div>
                )}

                <div className="space-y-4">
                  {result.connections?.map((conn, i) => {
                    const [id1, id2] = conn.ideaIds || [];
                    const title1 = ideaMap[id1] || 'Idea';
                    const title2 = ideaMap[id2] || 'Idea';
                    return (
                      <div key={i} className="border border-blue-100 bg-blue-50/40 rounded-xl p-4">
                        {/* Idea pills */}
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <span className="bg-white border border-blue-200 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                            {title1}
                          </span>
                          <ArrowRight size={14} className="text-blue-300" />
                          <span className="bg-white border border-blue-200 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                            {title2}
                          </span>
                          {conn.ideaIds?.slice(2).map((xid) => (
                            <span key={xid} className="bg-white border border-blue-200 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                              {ideaMap[xid] || 'Idea'}
                            </span>
                          ))}
                        </div>

                        <p className="text-xs text-gray-500 mb-2">
                          <span className="font-semibold text-gray-700">Why this connects: </span>{conn.reason}
                        </p>

                        <div className="bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-100 rounded-lg p-3 mb-3">
                          <p className="text-xs text-violet-500 font-semibold mb-1">🚀 What you can build:</p>
                          <p className="text-sm text-gray-700 font-medium">{conn.opportunity}</p>
                        </div>

                        {conn.nextSteps?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1.5">📌 Execution Plan:</p>
                            <ol className="space-y-1">
                              {conn.nextSteps.map((step, j) => (
                                <li key={j} className="flex items-start gap-2 text-xs text-gray-600">
                                  <span className="w-4 h-4 rounded-full bg-violet-100 text-violet-600 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                                    {j + 1}
                                  </span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Thinking Patterns */}
              {result.patterns?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Brain size={16} className="text-emerald-500" />
                    <h3 className="font-bold text-gray-900">Your Thinking Patterns</h3>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-2">
                    {result.patterns.map((p, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Re-run */}
              <div className="pt-2 border-t border-gray-100 flex justify-end">
                <button
                  onClick={run}
                  className="flex items-center gap-2 text-xs text-violet-600 hover:text-violet-700 font-semibold hover:underline"
                >
                  <Zap size={12} /> Run again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
