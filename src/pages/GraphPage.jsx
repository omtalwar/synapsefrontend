import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import {
  X, ExternalLink, Sparkles, Loader2, Link2, Unlink,
  ChevronRight, ArrowLeftRight, Brain, Zap
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import IdeaGraph from '../components/graph/IdeaGraph';
import { compareAPI } from '../api/ai';
import { connectIdeasAPI, disconnectIdeasAPI } from '../api/ideas';
import { categoryBorderColors, categoryColors, priorityDot, statusColors, truncate } from '../utils/helpers';
import useIdeaStore from '../store/ideaStore';
import '../styles/pages/GraphPage.css';

export default function GraphPage() {
  const navigate = useNavigate();
  const { ideas, fetchIdeas, fetchAllIdeas } = useIdeaStore();

  useEffect(() => { fetchAllIdeas(); }, []);
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);
  const [connectTarget, setConnectTarget] = useState('');
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Always derive selectedIdea fresh from the store — this fixes the stale state bug
  const selectedIdea = ideas.find(i => i._id === selectedIdeaId) || null;

  // When ideas refresh, keep panel open with fresh data
  useEffect(() => {
    if (selectedIdeaId && !ideas.find(i => i._id === selectedIdeaId)) {
      setSelectedIdeaId(null);
      setPanelVisible(false);
    }
  }, [ideas]);

  const handleNodeClick = useCallback((idea) => {
    setSelectedIdeaId(idea._id);
    setConnectTarget('');
    setCheckResult(null);
    setSuccessMsg('');
    setPanelVisible(true);
  }, []);

  const handleClose = () => {
    setPanelVisible(false);
    setTimeout(() => { setSelectedIdeaId(null); setConnectTarget(''); setCheckResult(null); }, 300);
  };

  const handleCheckCompatibility = async () => {
    if (!connectTarget || !selectedIdeaId) return;
    setChecking(true);
    setCheckResult(null);
    try {
      const res = await compareAPI({ ideaId1: selectedIdeaId, ideaId2: connectTarget });
      setCheckResult(res.data.data);
    } catch {
      setCheckResult({ error: true });
    } finally {
      setChecking(false);
    }
  };

  const handleConnect = async () => {
    if (!connectTarget || !selectedIdeaId) return;
    setActionLoading(true);
    try {
      await connectIdeasAPI(selectedIdeaId, connectTarget);
      await fetchIdeas(); // selectedIdea auto-updates via derived state
      setConnectTarget('');
      setCheckResult(null);
      setSuccessMsg('Connected!');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch { }
    finally { setActionLoading(false); }
  };

  const handleDisconnect = async (targetId) => {
    setActionLoading(true);
    try {
      await disconnectIdeasAPI(selectedIdeaId, targetId);
      await fetchIdeas(); // selectedIdea auto-updates via derived state
      setSuccessMsg('Disconnected');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch { }
    finally { setActionLoading(false); }
  };

  const borderColor = selectedIdea ? categoryBorderColors[selectedIdea.category] || '#6B7280' : '#6B7280';

  const connectedIds = new Set(
    (selectedIdea?.connections || []).map(c => (typeof c === 'object' ? c._id : c))
  );

  const connectableIdeas = ideas.filter(i =>
    i._id !== selectedIdeaId && !connectedIds.has(i._id)
  );

  const targetIdea = ideas.find(i => i._id === connectTarget);

  return (
    <div className="h-screen flex flex-col overflow-hidden graph-root">
      <Navbar />

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0 animate-fade-in">
        <div>
          <h1 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span className="graph-label-badge">GRAPH</span>
            Idea Network
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Click any node to connect, disconnect, or get AI insights</p>
        </div>
        <div className="flex items-center gap-3">
          {successMsg && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full animate-scale-in flex items-center gap-1.5">
              ✓ {successMsg}
            </span>
          )}
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-mono">
            {ideas.length} ideas
          </span>
        </div>
      </div>

      {/* Graph + Side Panel */}
      <div className="flex flex-1 overflow-hidden relative">
        <ReactFlowProvider>
          <IdeaGraph onNodeClick={handleNodeClick} selectedIdeaId={selectedIdeaId} />
        </ReactFlowProvider>

        {/* Side Panel */}
        {selectedIdea && (
          <div
            className={`absolute top-0 right-0 h-full bg-white shadow-2xl border-l border-gray-200 flex flex-col z-20 ${panelVisible ? 'panel-slide-in' : ''}`}
            style={{
              width: 380,
              borderTop: `3px solid ${borderColor}`,
              opacity: panelVisible ? 1 : 0,
              transition: 'opacity 0.3s'
            }}
          >
            {/* Panel Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${borderColor}08, ${borderColor}03)` }}>
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`w-2 h-2 rounded-full ${priorityDot[selectedIdea.priority]}`} />
                  <span className="text-[11px] font-bold capitalize px-2 py-0.5 rounded-full"
                    style={{ background: borderColor + '18', color: borderColor }}>
                    {selectedIdea.category}
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full capitalize font-medium ${statusColors[selectedIdea.status]}`}>
                    {selectedIdea.status}
                  </span>
                </div>
                <h2 className="font-bold text-gray-800 text-sm leading-snug">{selectedIdea.title}</h2>
              </div>
              <button onClick={handleClose}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-1.5 transition-all flex-shrink-0">
                <X size={15} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto">

              {/* Content preview */}
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="text-xs text-gray-500 leading-relaxed">{truncate(selectedIdea.content, 160)}</p>
                {selectedIdea.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {selectedIdea.tags.map(tag => (
                      <span key={tag} className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Insight */}
              {selectedIdea.insights && (
                <div className="px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles size={12} className="text-violet-500" />
                    <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">AI Insight</p>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed bg-violet-50 border border-violet-100 rounded-xl p-3">
                    {selectedIdea.insights}
                  </p>
                </div>
              )}

              {/* Current connections */}
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Link2 size={13} className="text-emerald-500" />
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                      Connected ({selectedIdea.connections?.length || 0})
                    </p>
                  </div>
                  {actionLoading && <Loader2 size={13} className="animate-spin text-gray-400" />}
                </div>

                {selectedIdea.connections?.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedIdea.connections.map((c, idx) => {
                      const cid = typeof c === 'object' ? c._id : c;
                      const connIdea = ideas.find(i => i._id === cid);
                      if (!connIdea) return null;
                      const cb = categoryBorderColors[connIdea.category] || '#6B7280';
                      return (
                        <div key={cid}
                          className="flex items-center justify-between p-2.5 rounded-xl border group transition-all animate-fade-up"
                          style={{ background: cb + '08', borderColor: cb + '30', animationDelay: `${idx * 50}ms` }}>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cb }} />
                            <button onClick={() => navigate(`/ideas/${connIdea._id}`)}
                              className="text-xs font-medium text-gray-700 hover:text-blue-600 truncate flex items-center gap-1 transition-colors">
                              {connIdea.title} <ChevronRight size={9} />
                            </button>
                          </div>
                          <button
                            onClick={() => handleDisconnect(connIdea._id)}
                            disabled={actionLoading}
                            className="text-gray-300 hover:text-red-500 ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all p-1 rounded-lg hover:bg-red-50 disabled:cursor-not-allowed"
                            title="Disconnect"
                          >
                            <Unlink size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-xs text-gray-400">No connections yet</p>
                  </div>
                )}
              </div>

              {/* Connect to another idea */}
              {connectableIdeas.length > 0 && (
                <div className="px-5 py-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <ArrowLeftRight size={13} className="text-blue-500" />
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Connect to Idea</p>
                  </div>

                  <select
                    value={connectTarget}
                    onChange={e => { setConnectTarget(e.target.value); setCheckResult(null); }}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400/40 bg-white transition-all"
                  >
                    <option value="">Choose an idea...</option>
                    {connectableIdeas.map(i => (
                      <option key={i._id} value={i._id}>{i.title}</option>
                    ))}
                  </select>

                  {connectTarget && (
                    <div className="space-y-2 animate-fade-up">
                      {/* Preview */}
                      {targetIdea && (
                        <div className="p-3 rounded-xl border text-xs" style={{
                          background: (categoryBorderColors[targetIdea.category] || '#6B7280') + '08',
                          borderColor: (categoryBorderColors[targetIdea.category] || '#6B7280') + '30'
                        }}>
                          <p className="font-semibold text-gray-700 mb-0.5 truncate">{targetIdea.title}</p>
                          <p className="text-gray-500 leading-snug">{truncate(targetIdea.content, 70)}</p>
                        </div>
                      )}

                      {/* AI Check */}
                      <button
                        onClick={handleCheckCompatibility}
                        disabled={checking}
                        className="btn-shine w-full inline-flex items-center justify-center gap-2 border border-violet-300 text-violet-700 hover:bg-violet-50 font-semibold px-4 py-2.5 rounded-xl transition-all text-xs disabled:opacity-50"
                      >
                        {checking
                          ? <><Loader2 size={12} className="animate-spin" /> Asking AI...</>
                          : <><Sparkles size={12} /> Do these work together?</>
                        }
                      </button>

                      {/* AI Result */}
                      {checkResult && !checkResult.error && (
                        <div className="space-y-2 animate-fade-up">
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Brain size={11} className="text-gray-500" />
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">AI says</p>
                            </div>
                            <p className="text-xs text-gray-700 leading-snug">{checkResult.recommendation}</p>
                          </div>
                          {checkResult.combinedPotential && (
                            <div className="bg-violet-50 border border-violet-100 rounded-xl p-3">
                              <p className="text-[10px] font-bold text-violet-500 mb-1 uppercase tracking-widest">If connected</p>
                              <p className="text-xs text-gray-700 leading-snug">{checkResult.combinedPotential}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Connect Button */}
                      <button
                        onClick={handleConnect}
                        disabled={actionLoading}
                        className="graph-connect-btn active:scale-95"
                      >
                        {actionLoading
                          ? <><Loader2 size={14} className="animate-spin" /> Connecting...</>
                          : <><Link2 size={14} /> Connect These Ideas</>
                        }
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3.5 border-t border-gray-100 flex-shrink-0 bg-gray-50/50">
              <button
                onClick={() => navigate(`/ideas/${selectedIdea._id}`)}
                className="graph-open-btn active:scale-95"
              >
                Open Full Detail <ExternalLink size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}