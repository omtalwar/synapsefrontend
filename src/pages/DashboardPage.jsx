import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Send, Trash2, ExternalLink, Loader2, Zap, GitFork, HelpCircle, Lightbulb, Sparkles } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import useIdeaStore from '../store/ideaStore';
import useAuthStore from '../store/authStore';
import { analyzeAPI, connectAIAPI } from '../api/ai';
import { connectIdeasAPI } from '../api/ideas';
import { formatDate, truncate } from '../utils/helpers';
import DiscoverInsightsModal from '../components/ai/DiscoverInsightsModal';
import '../styles/pages/DashboardPage.css';

const STICKY_COLORS = {
  startup:  { bg: '#FEF9C3', border: '#FDE047', shadow: '#ca8a04', tape: '#fef08a' },
  content:  { bg: '#F3E8FF', border: '#D8B4FE', shadow: '#9333ea', tape: '#e9d5ff' },
  study:    { bg: '#DCFCE7', border: '#86EFAC', shadow: '#16a34a', tape: '#bbf7d0' },
  personal: { bg: '#FEF3C7', border: '#FCD34D', shadow: '#d97706', tape: '#fde68a' },
  tech:     { bg: '#CFFAFE', border: '#67E8F9', shadow: '#0891b2', tape: '#a5f3fc' },
  health:   { bg: '#FFE4E6', border: '#FCA5A5', shadow: '#dc2626', tape: '#fecaca' },
  finance:  { bg: '#ECFCCB', border: '#BEF264', shadow: '#65a30d', tape: '#d9f99d' },
  other:    { bg: '#F1F5F9', border: '#CBD5E1', shadow: '#64748b', tape: '#e2e8f0' },
};

function getRotation(id) {
  const hash = id ? id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) : 0;
  return ((hash % 7) - 3) * 0.6;
}

function BrainHealthScore({ allIdeas }) {
  const [showInfo, setShowInfo] = useState(false);
  if (!allIdeas.length) return null;

  const total = allIdeas.length;
  const connected = allIdeas.filter((i) => i.connections?.length > 0).length;
  const analyzed = allIdeas.filter((i) => i.insights).length;
  const highPri = allIdeas.filter((i) => i.priority === 'high').length;
  const decided = allIdeas.filter((i) => i.status === 'decided').length;

  const connectedness = total > 1 ? (connected / total) * 40 : 0;
  const coverage = (analyzed / total) * 30;
  const decisiveness = (decided / total) * 20;
  const urgency = Math.min(highPri * 2, 10);
  const score = Math.round(connectedness + coverage + decisiveness + urgency);

  const color = score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#dc2626';
  const bg = score >= 70 ? '#f0fdf4' : score >= 40 ? '#fffbeb' : '#fef2f2';
  const borderCol = score >= 70 ? '#bbf7d0' : score >= 40 ? '#fde68a' : '#fecaca';
  const label = score >= 70 ? 'Thriving' : score >= 40 ? 'Growing' : 'Just Starting';

  const breakdown = [
    { label: 'Ideas linked to others', val: `${connected}/${total}`, pts: Math.round(connectedness), max: 40, tip: 'Link ideas together to earn up to 40 pts' },
    { label: 'Ideas analyzed by AI', val: `${analyzed}/${total}`, pts: Math.round(coverage), max: 30, tip: 'Hit Analyze on each idea to earn up to 30 pts' },
    { label: 'Decisions made', val: `${decided}/${total}`, pts: Math.round(decisiveness), max: 20, tip: 'Set status to "decided" to earn up to 20 pts' },
    { label: 'High priority ideas', val: `${highPri}`, pts: Math.round(urgency), max: 10, tip: 'Mark ideas as high priority to earn up to 10 pts' },
  ];

  return (
    <div className="rounded-2xl border p-4 mb-6" style={{ background: bg, borderColor: borderCol }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm dashboard-brain-icon"><span className="dashboard-brain-emoji">&#128301;</span></div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-gray-700">Brain Health</p>
              <button onClick={() => setShowInfo(v => !v)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <HelpCircle size={13} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{total} idea{total !== 1 ? 's' : ''} · {connected} linked · {analyzed} analyzed</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black" style={{ color }}>{score}</p>
          <p className="text-xs font-semibold" style={{ color }}>{label}</p>
        </div>
      </div>

      {showInfo && (
        <div className="mt-4 pt-4 border-t border-black/10 space-y-3">
          <p className="text-xs text-gray-500">Score is out of <strong>100</strong>. Here's how to increase it:</p>
          {breakdown.map(({ label, val, pts, max, tip }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">{label} <span className="text-gray-400">({val})</span></span>
                <span className="text-xs font-bold text-gray-700">{pts}/{max} pts</span>
              </div>
              <div className="h-1.5 rounded-full bg-black/10">
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${(pts / max) * 100}%`, background: color }} />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">{tip}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { allIdeas, fetchIdeas, addIdea, deleteIdea, isLoading } = useIdeaStore();
  const { user } = useAuthStore();

  const [input, setInput] = useState('');
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [listening, setListening] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [newIdeaId, setNewIdeaId] = useState(null);
  const [focused, setFocused] = useState(false);
  const [showDiscover, setShowDiscover] = useState(false);

  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => { fetchIdeas(); }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault(); inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const toggleVoice = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert('Voice input needs Chrome.');
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const r = new SR();
    r.continuous = false; r.interimResults = false; r.lang = 'en-US';
    r.onresult = (e) => { setInput(p => p ? p + ' ' + e.results[0][0].transcript : e.results[0][0].transcript); setListening(false); };
    r.onerror = r.onend = () => setListening(false);
    recognitionRef.current = r; r.start(); setListening(true);
  }, [listening]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setCreating(true);
    try {
      const ideaTitle = title.trim() || input.slice(0, 60);
      const idea = await addIdea({ title: ideaTitle, content: input });
      setNewIdeaId(idea._id);
      setInput(''); setTitle(''); setFocused(false);
      analyzeAPI({ ideaId: idea._id })
        .then(() => {
          connectAIAPI({ ideaId: idea._id })
            .then(async (res) => {
              const conns = res.data?.data?.connections || [];
              await Promise.all(conns.slice(0, 3).map((c) => connectIdeasAPI(idea._id, c.ideaId).catch(() => {})));
              fetchIdeas();
            }).catch(() => {});
          fetchIdeas();
        }).catch(() => {});
      setTimeout(() => setNewIdeaId(null), 3000);
    } catch { } finally { setCreating(false); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(); };
  const handleDelete = async (id) => { await deleteIdea(id); setDeleteConfirm(null); };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">

        <div className="mb-6 text-center dashboard-greeting">
          <h1 className="text-3xl font-bold text-gray-800">Hey, {user?.name?.split(' ')[0]}</h1>
          <p className="text-gray-400 text-sm mt-1">Drop a thought. AI will surface hidden insights.</p>
        </div>

        {/* Discover Insights CTA */}
        {allIdeas.length >= 2 && (
          <div className="mb-6 flex justify-center">
            <button
              onClick={() => setShowDiscover(true)}
              className="inline-flex items-center gap-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-semibold px-6 py-2.5 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 text-sm"
            >
              <Sparkles size={15} />
              Discover Hidden Insights
              <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">AI</span>
            </button>
          </div>
        )}

        <BrainHealthScore allIdeas={allIdeas} />

        {/* Polished input card */}
        <div
          className={`bg-white rounded-2xl border-2 shadow-sm mb-10 overflow-hidden transition-all duration-200 ${
            focused ? 'border-blue-400 shadow-blue-100 shadow-md' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {(focused || title) && (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full px-5 pt-4 pb-2 text-sm font-semibold text-gray-700 placeholder-gray-300 outline-none border-b border-gray-100 bg-transparent"
            />
          )}

          <div className="relative">
            {!focused && !input && (
              <div className="absolute left-5 top-4 pointer-events-none flex items-center gap-2">
                <Lightbulb size={15} className="text-blue-300" />
                <span className="text-sm text-gray-400">What's on your mind? Press <kbd className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-xs font-mono">/</kbd> to focus</span>
              </div>
            )}
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => { if (!input && !title) setFocused(false); }}
              rows={focused ? 4 : 2}
              className="w-full px-5 py-4 text-sm text-gray-700 placeholder-transparent outline-none resize-none bg-transparent transition-all duration-200"
            />
          </div>

          <div className="flex items-center justify-between px-4 pb-3 pt-1 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleVoice}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium ${
                  listening ? 'bg-red-50 border-red-200 text-red-500 animate-pulse' : 'border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300'
                }`}
              >
                {listening ? <MicOff size={13} /> : <Mic size={13} />}
                {listening ? 'Listening...' : 'Voice'}
              </button>
              {focused && <span className="text-xs text-gray-300 hidden sm:inline">⌘+Enter to save</span>}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || creating}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {creating ? 'Saving...' : 'Save idea'}
            </button>
          </div>
        </div>

        {/* Notes header */}
        {allIdeas.length > 0 && (
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              {allIdeas.length} idea{allIdeas.length !== 1 ? 's' : ''}
            </h2>
            <button
              onClick={() => navigate('/notes')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Filter & manage all →
            </button>
          </div>
        )}

        {/* Sticky board */}
        {isLoading && !allIdeas.length ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-gray-300" /></div>
        ) : allIdeas.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center dashboard-empty-icon"><Sparkles size={26} className="text-blue-400" /></div>
            <p className="text-gray-700 font-semibold text-base">Start adding ideas to unlock hidden insights</p>
            <p className="text-gray-400 text-sm mt-1">AI will analyze patterns, find connections, and suggest what you can build.</p>
          </div>
        ) : (
          <div className="dashboard-sticky-grid">
            {allIdeas.map((idea) => (
              <StickyNote
                key={idea._id}
                idea={idea}
                isNew={idea._id === newIdeaId}
                onDelete={() => setDeleteConfirm(idea._id)}
                onOpen={() => navigate(`/ideas/${idea._id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {showDiscover && (
        <DiscoverInsightsModal ideas={allIdeas} onClose={() => setShowDiscover(false)} />
      )}

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

function StickyNote({ idea, isNew, onDelete, onOpen }) {
  const colors = STICKY_COLORS[idea.category] || STICKY_COLORS.other;
  const rotation = getRotation(idea._id);

  return (
    <div
      className={`relative group transition-all duration-300 ${isNew ? 'scale-105 z-10' : 'hover:scale-[1.04] hover:-translate-y-1.5 hover:z-10'}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Tape */}
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-9 h-5 rounded-sm z-10 opacity-80"
        style={{ background: colors.tape, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
      />

      {/* Note body */}
      <div
        className="rounded-sm px-4 pt-5 pb-3 min-h-[170px] flex flex-col"
        style={{
          background: `linear-gradient(160deg, ${colors.bg} 0%, ${colors.bg}dd 100%)`,
          border: `1px solid ${colors.border}`,
          boxShadow: `2px 4px 14px rgba(0,0,0,0.13), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -2px 0 ${colors.border}88`,
        }}
      >
        {/* Actions */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button
            onClick={(e) => { e.stopPropagation(); onOpen(); }}
            className="w-6 h-6 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ExternalLink size={11} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="w-6 h-6 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow text-gray-500 hover:text-red-500 transition-colors"
          >
            <Trash2 size={11} />
          </button>
        </div>

        <div className="flex-1 cursor-pointer" onClick={onOpen}>
          <h3 className="font-bold text-gray-800 text-sm leading-snug mb-2 pr-8">{idea.title}</h3>
          <p className="text-xs text-gray-600 leading-relaxed">{truncate(idea.content, 90)}</p>

          {idea.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {idea.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded font-medium sticky-tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {idea.insights && (
            <div className="mt-3 pt-2 border-t border-black/10">
              <p className="text-[10px] flex items-center gap-1 text-gray-500 mb-0.5 font-medium">
                <Zap size={9} /> AI Insight
              </p>
              <p className="text-[11px] text-gray-600 leading-snug italic">{truncate(idea.insights, 65)}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/10">
          <span className="flex items-center gap-1 text-[10px] text-gray-500">
            <GitFork size={9} /> {idea.connections?.length || 0}
          </span>
          <span className="text-[10px] text-gray-500">{formatDate(idea.createdAt)}</span>
        </div>
      </div>

      {/* Shadow layer */}
      <div
        className="absolute -bottom-1.5 left-3 right-3 h-4 -z-10 opacity-25 rounded-b"
        style={{ background: colors.shadow, filter: 'blur(6px)' }}
      />
    </div>
  );
}
