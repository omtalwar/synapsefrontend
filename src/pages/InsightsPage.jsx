import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, Sparkles, Zap, Brain, RefreshCw, ChevronRight,
  ArrowRight, TrendingUp, Lightbulb, Target, Plus
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import useIdeaStore from '../store/ideaStore';
import { discoverAPI, summaryAPI } from '../api/ai';

export default function InsightsPage() {
  const { allIdeas, fetchIdeas } = useIdeaStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [discover, setDiscover] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIdeas().then(() => {});
  }, []);

  // Auto-run once ideas are loaded
  useEffect(() => {
    if (allIdeas.length >= 2 && !discover && !loading) {
      run();
    }
  }, [allIdeas]);

  const ideaMap = {};
  allIdeas.forEach((i) => { ideaMap[i._id] = i; });

  const run = async () => {
    setLoading(true);
    setError('');
    try {
      const [discRes, sumRes] = await Promise.all([discoverAPI(), summaryAPI()]);
      setDiscover(discRes.data.data);
      setSummary(sumRes.data.data);
    } catch {
      setError('Something went wrong. Try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  // Empty state
  if (!loading && allIdeas.length < 2) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="text-6xl mb-5">🧠</div>
          <h1 className="text-2xl font-black text-gray-900 mb-3">Not enough ideas yet</h1>
          <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
            Add at least 2 ideas to your workspace and AI will start finding connections between them.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold px-7 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 text-sm"
          >
            <Plus size={15} /> Add Ideas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 animate-fade-up">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Sparkles size={20} className="text-white" />
              </div>
              <span className="text-xs font-bold bg-violet-100 text-violet-600 px-2.5 py-1 rounded-full uppercase tracking-wide">AI Powered</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mt-2">Your Idea Intelligence</h1>
            <p className="text-gray-400 text-sm mt-1">{allIdeas.length} ideas · AI found the patterns and connections for you</p>
          </div>
          <button
            onClick={run}
            disabled={loading}
            className="inline-flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 font-semibold px-4 py-2.5 rounded-xl transition-all text-sm shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {/* Summary skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse" />
                <div className="h-4 w-36 bg-gray-100 animate-pulse rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-50 rounded-xl animate-pulse border border-gray-100" />
                ))}
              </div>
            </div>
            {/* Connections skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="h-4 w-48 bg-gray-100 animate-pulse rounded-lg mb-5" />
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-50 rounded-xl animate-pulse border border-gray-100 mb-3" />
              ))}
            </div>
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 size={16} className="animate-spin text-violet-400" />
              <p className="text-sm text-gray-400">Reading all your ideas and finding patterns...</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && summary && discover && (
          <div className="space-y-6 animate-fade-up delay-150">

            {/* ── BIG PICTURE SUMMARY ── */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <Brain size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">The Big Picture</h2>
                  <p className="text-xs text-gray-400">What your ideas say about you</p>
                </div>
              </div>

              {/* Overview — full width */}
              <div className="px-6 pt-5 pb-2">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 mb-4">
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-wide mb-2">Overview</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{summary.overview}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  {/* Dominant Theme */}
                  <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <TrendingUp size={13} className="text-violet-500" />
                      <p className="text-xs font-bold text-violet-600 uppercase tracking-wide">Main Theme</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{summary.dominantTheme}</p>
                  </div>

                  {/* Top Priority */}
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Target size={13} className="text-amber-500" />
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">Focus On</p>
                    </div>
                    <p className="text-sm text-gray-700 leading-snug">{summary.topPriority}</p>
                  </div>

                  {/* Next Step */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Zap size={13} className="text-emerald-500" />
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Do This Today</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{summary.nextStep}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── HIDDEN CONNECTIONS ── */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-sm">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">Hidden Connections</h2>
                    <p className="text-xs text-gray-400">
                      {discover.connections?.length || 0} connection{discover.connections?.length !== 1 ? 's' : ''} found across your ideas
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 space-y-4">
                {(!discover.connections || discover.connections.length === 0) && (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-500 font-medium text-sm">No strong connections found yet</p>
                    <p className="text-xs text-gray-400 mt-1">Add more ideas across different topics</p>
                  </div>
                )}

                {discover.connections?.map((conn, i) => {
                  const ideas = (conn.ideaIds || []).map(xid => ideaMap[xid]).filter(Boolean);
                  return (
                    <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                      {/* Top bar — connected ideas */}
                      <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2 flex-wrap">
                        {ideas.map((idea, j) => (
                          <div key={idea._id} className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/ideas/${idea._id}`)}
                              className="bg-white border border-blue-200 text-blue-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm hover:border-blue-400 transition-all flex items-center gap-1"
                            >
                              {idea.title} <ChevronRight size={10} />
                            </button>
                            {j < ideas.length - 1 && <ArrowRight size={13} className="text-gray-300 shrink-0" />}
                          </div>
                        ))}
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold text-gray-800">Why they connect: </span>{conn.reason}
                        </p>

                        <div className="bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-100 rounded-xl p-3.5">
                          <p className="text-xs font-bold text-violet-500 mb-1.5">🚀 What you could build:</p>
                          <p className="text-sm text-gray-800 font-medium leading-snug">{conn.opportunity}</p>
                        </div>

                        {conn.nextSteps?.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-gray-500 mb-2">Steps to make it real:</p>
                            <div className="space-y-1.5">
                              {conn.nextSteps.map((step, j) => (
                                <div key={j} className="flex items-start gap-2.5 text-sm text-gray-700">
                                  <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">{j + 1}</span>
                                  <span className="leading-snug">{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── THINKING PATTERNS ── */}
            {discover.patterns?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
                    <Lightbulb size={16} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">How You Think</h2>
                    <p className="text-xs text-gray-400">Patterns AI noticed across all your ideas</p>
                  </div>
                </div>
                <div className="px-6 py-5 space-y-3">
                  {discover.patterns.map((p, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <span className="text-emerald-500 text-lg shrink-0 mt-0.5">→</span>
                      <p className="text-sm text-gray-700 leading-snug">{p}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
