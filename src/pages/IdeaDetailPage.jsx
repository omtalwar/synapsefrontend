import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Loader2, Trash2, Save, Link2, X, ChevronRight,
  ArrowLeftRight, Sparkles, Zap, AlertTriangle, CheckCircle2,
  RefreshCw, ChevronDown, ChevronUp, ArrowLeft, ArrowRight,
  MessageSquare, Target, TrendingUp
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { getIdeaAPI, getIdeasAPI, updateIdeaAPI, deleteIdeaAPI, connectIdeasAPI, disconnectIdeasAPI } from '../api/ideas';
import { analyzeAPI, connectAIAPI, compareAPI, discoverAPI } from '../api/ai';
import { categoryColors, priorityColors, statusColors, priorityDot, categoryBorderColors, getErrorMessage } from '../utils/helpers';

const categories = ['startup', 'content', 'study', 'personal', 'tech', 'health', 'finance', 'other'];
const priorities = ['high', 'medium', 'low'];
const statuses   = ['raw', 'in-progress', 'decided'];

export default function IdeaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [idea, setIdea] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [findingConnections, setFindingConnections] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [allIdeas, setAllIdeas] = useState([]);
  const [error, setError] = useState('');
  const [compareTarget, setCompareTarget] = useState('');
  const [comparing, setComparing] = useState(false);
  const [compareResult, setCompareResult] = useState(null);
  const [checkedSteps, setCheckedSteps] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [crossConnections, setCrossConnections] = useState([]);
  const [loadingCross, setLoadingCross] = useState(false);

  useEffect(() => { fetchIdea(); }, [id]);

  const fetchIdea = async () => {
    setLoading(true);
    try {
      const [res, allRes] = await Promise.all([getIdeaAPI(id), getIdeasAPI()]);
      setIdea(res.data.data);
      setAllIdeas(allRes.data.data || []);
      const d = res.data.data;
      setForm({ title: d.title, content: d.content, category: d.category, priority: d.priority, status: d.status });
      // load cross-connections for this idea
      fetchCrossConnections(allRes.data.data || []);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  const fetchCrossConnections = async (ideas) => {
    if (ideas.length < 2) return;
    setLoadingCross(true);
    try {
      const res = await discoverAPI();
      const all = res.data.data?.connections || [];
      // only keep connections that involve this idea
      const relevant = all.filter(c => (c.ideaIds || []).includes(id));
      setCrossConnections(relevant);
    } catch { /* silent fail */ }
    finally { setLoadingCross(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try { const res = await updateIdeaAPI(id, form); setIdea(res.data.data); setShowEdit(false); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try { await analyzeAPI({ ideaId: id }); await fetchIdea(); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setAnalyzing(false); }
  };

  const handleFindConnections = async () => {
    setFindingConnections(true); setSuggestions([]);
    try { const res = await connectAIAPI({ ideaId: id }); setSuggestions(res.data.data.connections || []); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setFindingConnections(false); }
  };

  const handleConnect = async (targetId) => {
    try { await connectIdeasAPI(id, targetId); setSuggestions(p => p.filter(s => s.ideaId !== targetId)); await fetchIdea(); }
    catch (err) { setError(getErrorMessage(err)); }
  };

  const handleDisconnect = async (targetId) => {
    try { await disconnectIdeasAPI(id, targetId); await fetchIdea(); }
    catch (err) { setError(getErrorMessage(err)); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this idea?')) return;
    try { await deleteIdeaAPI(id); navigate('/dashboard'); }
    catch (err) { setError(getErrorMessage(err)); }
  };

  const handleCompare = async () => {
    if (!compareTarget) return;
    setComparing(true); setCompareResult(null);
    try { const res = await compareAPI({ ideaId1: id, ideaId2: compareTarget }); setCompareResult(res.data.data); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setComparing(false); }
  };

  const toggleStep = (i) => setCheckedSteps(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center h-96">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    </div>
  );
  if (!idea) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-8 text-center text-gray-500">Idea not found.</div>
    </div>
  );

  const borderColor = categoryBorderColors[idea.category] || '#6B7280';
  const hasAI = idea.insights || idea.actionSteps?.length || idea.missingParts?.length;
  const doneCount = checkedSteps.length;
  const totalSteps = idea.actionSteps?.length || 0;
  const ideaMap = {};
  allIdeas.forEach(i => { ideaMap[i._id] = i; });
  const compareIdea = allIdeas.find(i => i._id === compareTarget);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-up">

        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-4 transition-colors">
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 border border-red-200 flex justify-between">
            <span>{error}</span><button onClick={() => setError('')}><X size={14} /></button>
          </div>
        )}

        {/* ── IDEA HEADER ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4" style={{ borderTop: `4px solid ${borderColor}` }}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border capitalize font-medium ${categoryColors[idea.category]}`}>{idea.category}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${priorityColors[idea.priority]}`}>
                  <span className="inline-flex items-center gap-1"><span className={`w-1.5 h-1.5 rounded-full ${priorityDot[idea.priority]}`} />{idea.priority}</span>
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${statusColors[idea.status]}`}>{idea.status}</span>
                {hasAI && <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-violet-100 text-violet-600 flex items-center gap-1"><Zap size={9} />AI Insight</span>}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 leading-snug">{idea.title}</h1>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setShowEdit(v => !v)} className="text-xs text-gray-500 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition-colors flex items-center gap-1">
                Edit {showEdit ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              <button onClick={handleDelete} className="text-xs text-red-400 border border-red-100 rounded-xl px-3 py-1.5 hover:bg-red-50 transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{idea.content}</p>
          {idea.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {idea.tags.map(tag => <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">#{tag}</span>)}
            </div>
          )}
          {showEdit && (
            <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full text-sm font-semibold border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Title" />
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" rows={4} />
              <div className="grid grid-cols-3 gap-2">
                {[['category', categories], ['priority', priorities], ['status', statuses]].map(([field, opts]) => (
                  <div key={field}>
                    <label className="block text-xs text-gray-400 mb-1 capitalize">{field}</label>
                    <select value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none bg-white capitalize">
                      {opts.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg disabled:opacity-50">
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                </button>
                <button onClick={() => setShowEdit(false)} className="text-xs text-gray-500 px-3 py-2 rounded-lg hover:bg-gray-100">Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* ── AI ANALYSIS ── */}
        <div className="bg-white rounded-2xl border border-gray-200 mb-4 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-sm">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">AI Analysis</h2>
                <p className="text-xs text-gray-400">{hasAI ? 'Insights ready' : 'Not analyzed yet'}</p>
              </div>
              <span className="text-[10px] font-bold bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full uppercase tracking-wide">AI Powered</span>
            </div>
            <button onClick={handleAnalyze} disabled={analyzing}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-semibold px-5 py-2 rounded-xl shadow-sm transition-all active:scale-95 text-xs disabled:opacity-60">
              {analyzing ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
              {analyzing ? 'Analyzing...' : hasAI ? 'Re-analyze' : 'Analyze Idea'}
            </button>
          </div>

          <div className="px-6 py-5">
            {analyzing && (
              <div className="flex flex-col items-center py-12 gap-3">
                <Loader2 size={30} className="animate-spin text-violet-400" />
                <p className="text-sm font-medium text-gray-500">Reading your idea...</p>
                <p className="text-xs text-gray-400">Giving you honest feedback, not just nice words</p>
              </div>
            )}

            {!analyzing && !hasAI && (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-700 font-semibold mb-1">No analysis yet</p>
                <p className="text-gray-400 text-sm max-w-sm mx-auto">Hit <strong>Analyze Idea</strong> — AI will tell you what's missing, what to do first, and what you might not have thought about yet.</p>
              </div>
            )}

            {!analyzing && hasAI && (
              <div className="space-y-6">

                {/* Honest Insight */}
                {idea.insights && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare size={15} className="text-violet-500" />
                      <h3 className="font-bold text-gray-900 text-sm">Honest Take</h3>
                    </div>
                    <div className="bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 rounded-xl p-4 relative">
                      <div className="absolute top-3 right-3 text-violet-200 text-2xl">"</div>
                      <p className="text-sm text-gray-700 leading-relaxed pr-6">{idea.insights}</p>
                    </div>
                  </div>
                )}

                {/* Execution Plan */}
                {idea.actionSteps?.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Target size={15} className="text-emerald-500" />
                        <h3 className="font-bold text-gray-900 text-sm">What To Do Next</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{doneCount}/{totalSteps} done</span>
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full">
                          <div
                            className="h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all"
                            style={{ width: `${totalSteps ? (doneCount / totalSteps) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {idea.actionSteps.map((step, i) => (
                        <button key={i} onClick={() => toggleStep(i)}
                          className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${checkedSteps.includes(i) ? 'bg-emerald-50 border-emerald-200 opacity-60' : 'bg-gray-50 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'}`}>
                          {checkedSteps.includes(i)
                            ? <CheckCircle2 size={17} className="text-emerald-500 mt-0.5 shrink-0" />
                            : <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-[9px] font-bold text-gray-400">{i + 1}</span>
                              </div>}
                          <span className={`text-sm leading-snug ${checkedSteps.includes(i) ? 'line-through text-gray-400' : 'text-gray-700'}`}>{step}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hard Questions (What's Missing) */}
                {idea.missingParts?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle size={15} className="text-amber-500" />
                      <h3 className="font-bold text-gray-900 text-sm">Hard Questions to Answer</h3>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">These are the gaps that could stop this idea from working. Face them early.</p>
                    <div className="space-y-2">
                      {idea.missingParts.map((part, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                          <span className="text-amber-500 font-bold text-sm shrink-0 mt-0.5">?</span>
                          <p className="text-sm text-amber-900 leading-snug font-medium">{part}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── HOW THIS IDEA FITS THE BIGGER PICTURE ── */}
        {(crossConnections.length > 0 || loadingCross) && (
          <div className="bg-white rounded-2xl border border-gray-200 mb-4 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <TrendingUp size={16} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">This Idea in the Bigger Picture</h2>
                <p className="text-xs text-gray-400">How this idea connects to your other ideas</p>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              {loadingCross && (
                <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
                  <Loader2 size={14} className="animate-spin" /> Looking for cross-idea connections...
                </div>
              )}
              {crossConnections.map((conn, i) => {
                const otherIds = (conn.ideaIds || []).filter(xid => xid !== id);
                const others = otherIds.map(xid => ideaMap[xid]).filter(Boolean);
                return (
                  <div key={i} className="border border-blue-100 bg-blue-50/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="text-xs font-semibold text-gray-500">This idea</span>
                      <ArrowRight size={12} className="text-gray-300" />
                      {others.map(other => (
                        <button key={other._id} onClick={() => navigate(`/ideas/${other._id}`)}
                          className="text-xs font-semibold bg-white border border-blue-200 text-blue-700 px-2.5 py-1 rounded-full hover:border-blue-400 transition-all flex items-center gap-1">
                          {other.title} <ChevronRight size={9} />
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-semibold text-gray-800">Connection: </span>{conn.reason}
                    </p>
                    <div className="bg-white border border-blue-100 rounded-xl p-3">
                      <p className="text-xs font-bold text-blue-500 mb-1">🚀 What you could build:</p>
                      <p className="text-sm text-gray-700">{conn.opportunity}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── HIDDEN LINKS ── */}
        <div className="bg-white rounded-2xl border border-gray-200 mb-4 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
                <Link2 size={16} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Related Ideas</h2>
                <p className="text-xs text-gray-400">
                  {idea.connections?.length
                    ? `${idea.connections.length} idea${idea.connections.length !== 1 ? 's' : ''} linked to this one`
                    : 'No links yet — use AI to find related ideas'}
                </p>
              </div>
            </div>
            <button onClick={handleFindConnections} disabled={findingConnections}
              className="inline-flex items-center gap-2 border border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold px-4 py-2 rounded-xl transition-all text-xs disabled:opacity-50">
              {findingConnections ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              {findingConnections ? 'Finding...' : 'Find with AI'}
            </button>
          </div>
          <div className="px-6 py-5 space-y-2">
            {idea.connections?.map((c) => (
              <div key={c._id} className="flex items-center justify-between p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 group">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full border capitalize shrink-0 ${categoryColors[c.category]}`}>{c.category}</span>
                  <button onClick={() => navigate(`/ideas/${c._id}`)} className="text-sm font-medium text-gray-700 hover:text-emerald-600 truncate flex items-center gap-1">
                    {c.title} <ChevronRight size={12} />
                  </button>
                </div>
                <button onClick={() => handleDisconnect(c._id)} className="text-gray-300 hover:text-red-400 ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
              </div>
            ))}

            {suggestions.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">AI found these matches</p>
                {suggestions.map((s) => (
                  <div key={s.ideaId} className="flex items-start justify-between p-4 bg-blue-50 rounded-xl border border-blue-200 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800 truncate">{allIdeas.find(i => i._id === s.ideaId)?.title || s.ideaId}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-snug">{s.reason}</p>
                    </div>
                    <div className="flex gap-1.5 ml-3 shrink-0">
                      <button onClick={() => handleConnect(s.ideaId)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">Connect</button>
                      <button onClick={() => setSuggestions(p => p.filter(x => x.ideaId !== s.ideaId))} className="text-gray-400 hover:text-gray-600 px-2"><X size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {idea.connections?.length === 0 && suggestions.length === 0 && !findingConnections && (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-500 font-medium">No related ideas linked yet</p>
                <p className="text-xs text-gray-400 mt-1">Click <strong>Find with AI</strong> — it will scan your other ideas and tell you which ones actually connect</p>
              </div>
            )}
          </div>
        </div>

        {/* ── COMPARE IDEAS ── */}
        {allIdeas.filter(i => i._id !== id).length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
                  <ArrowLeftRight size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Compare with Another Idea</h2>
                  <p className="text-xs text-gray-400">Which one should you focus on — or can they work together?</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              {/* Selector */}
              <div className="flex gap-2 mb-4">
                <select
                  value={compareTarget}
                  onChange={(e) => { setCompareTarget(e.target.value); setCompareResult(null); }}
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                >
                  <option value="">Pick an idea to compare with...</option>
                  {allIdeas.filter(i => i._id !== id).map(i => <option key={i._id} value={i._id}>{i.title}</option>)}
                </select>
                <button
                  onClick={handleCompare}
                  disabled={!compareTarget || comparing}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-50 text-sm"
                >
                  {comparing ? <Loader2 size={14} className="animate-spin" /> : <ArrowLeftRight size={14} />}
                  {comparing ? 'Comparing...' : 'Compare'}
                </button>
              </div>

              {/* Side-by-side idea titles preview */}
              {compareTarget && !comparing && !compareResult && (
                <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex-1 text-center">
                    <p className="text-xs text-gray-400 mb-1">This idea</p>
                    <p className="text-sm font-bold text-gray-800 leading-snug">{idea.title}</p>
                  </div>
                  <div className="text-gray-300 font-bold text-lg">vs</div>
                  <div className="flex-1 text-center">
                    <p className="text-xs text-gray-400 mb-1">Comparing with</p>
                    <p className="text-sm font-bold text-gray-800 leading-snug">{compareIdea?.title}</p>
                  </div>
                </div>
              )}

              {comparing && (
                <div className="flex flex-col items-center py-10 gap-3">
                  <Loader2 size={28} className="animate-spin text-purple-400" />
                  <p className="text-sm text-gray-500">Comparing both ideas honestly...</p>
                </div>
              )}

              {compareResult && (
                <div className="space-y-3">
                  {/* Side by side labels */}
                  <div className="grid grid-cols-2 gap-2 mb-1">
                    <div className="bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 text-center">
                      <p className="text-xs font-bold text-purple-500 truncate">{idea.title}</p>
                    </div>
                    <div className="bg-pink-50 border border-pink-100 rounded-lg px-3 py-2 text-center">
                      <p className="text-xs font-bold text-pink-500 truncate">{compareIdea?.title}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">The Difference</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{compareResult.comparison}</p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-2">🎯 Which one to focus on</p>
                    <p className="text-sm text-gray-800 font-medium leading-relaxed">{compareResult.recommendation}</p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-wide mb-2">✨ If you combine both</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{compareResult.combinedPotential}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
