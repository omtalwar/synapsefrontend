import { useState, useEffect } from 'react';
import { GitCompare, ArrowRight, Loader2, Zap, Target, Lightbulb, RotateCcw } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import useIdeaStore from '../store/ideaStore';
import { compareAPI } from '../api/ai';
import { getErrorMessage } from '../utils/helpers';
import '../styles/pages/ComparePage.css';

export default function ComparePage() {
  const { allIdeas, fetchIdeas } = useIdeaStore();
  const [idea1, setIdea1] = useState('');
  const [idea2, setIdea2] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchIdeas(); }, []);

  const idea1Data = allIdeas.find(i => i._id === idea1);
  const idea2Data = allIdeas.find(i => i._id === idea2);

  const handleCompare = async () => {
    if (!idea1 || !idea2 || idea1 === idea2) return;
    setLoading(true); setResult(null); setError('');
    try {
      const res = await compareAPI({ ideaId1: idea1, ideaId2: idea2 });
      setResult(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setIdea1(''); setIdea2(''); setResult(null); setError(''); };

  return (
    <div className="compare-root">
      <Navbar />

      <div className="compare-container">

        <div className="compare-header">
          <div className="compare-header-row">
            <div className="compare-header-icon">
              <GitCompare size={20} style={{ color: '#7da7f0' }} />
            </div>
            <div>
              <h1 className="compare-header-title">Compare Ideas</h1>
              <p className="compare-header-sub">AI-powered side-by-side analysis of any two ideas</p>
            </div>
          </div>
        </div>

        <div className="compare-card compare-selector-card">
          <div className="compare-selector-grid">
            <div>
              <label className="compare-label">IDEA A</label>
              <select
                value={idea1}
                onChange={e => { setIdea1(e.target.value); setResult(null); }}
                className="compare-select"
              >
                <option value="">Select an idea…</option>
                {allIdeas.map(i => (
                  <option key={i._id} value={i._id} disabled={i._id === idea2}>{i.title}</option>
                ))}
              </select>
            </div>

            <div className="compare-vs-icon">
              <ArrowRight size={16} style={{ color: '#a78bfa' }} />
            </div>

            <div>
              <label className="compare-label">IDEA B</label>
              <select
                value={idea2}
                onChange={e => { setIdea2(e.target.value); setResult(null); }}
                className="compare-select"
              >
                <option value="">Select an idea…</option>
                {allIdeas.map(i => (
                  <option key={i._id} value={i._id} disabled={i._id === idea1}>{i.title}</option>
                ))}
              </select>
            </div>
          </div>

          {idea1Data && idea2Data && (
            <div className="compare-preview-grid">
              {[idea1Data, idea2Data].map((idea, idx) => (
                <div key={idea._id} className="compare-preview-item">
                  <div className="compare-preview-label">IDEA {idx === 0 ? 'A' : 'B'}</div>
                  <div className="compare-preview-title">{idea.title}</div>
                  {idea.description && (
                    <div className="compare-preview-desc">{idea.description}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="compare-actions">
            <button
              onClick={handleCompare}
              disabled={!idea1 || !idea2 || idea1 === idea2 || loading}
              className="compare-btn-primary"
            >
              {loading ? <><Loader2 size={15} className="animate-spin" /> Analyzing…</> : <><Zap size={15} /> Compare with AI</>}
            </button>
            {(idea1 || idea2 || result) && (
              <button onClick={handleReset} className="compare-btn-reset">
                <RotateCcw size={14} /> Reset
              </button>
            )}
          </div>

          {idea1 && idea2 && idea1 === idea2 && (
            <p className="compare-same-error">Select two different ideas to compare</p>
          )}
        </div>

        {error && <div className="compare-error">{error}</div>}

        {loading && (
          <div className="compare-card compare-loading">
            <div className="compare-loading-icon">
              <Loader2 size={24} className="animate-spin" style={{ color: '#4A7FDB' }} />
            </div>
            <p className="compare-loading-text">AI is analyzing your ideas…</p>
          </div>
        )}

        {result && !loading && (
          <div className="compare-results">
            <div className="compare-results-grid">
              <div className="compare-card compare-result-card">
                <div className="compare-result-icon-row">
                  <div className="compare-result-icon compare-result-icon--blue">
                    <GitCompare size={16} style={{ color: '#7da7f0' }} />
                  </div>
                  <span className="compare-result-label">Comparison</span>
                </div>
                <p className="compare-result-text">{result.comparison}</p>
              </div>

              <div className="compare-card compare-result-card">
                <div className="compare-result-icon-row">
                  <div className="compare-result-icon compare-result-icon--green">
                    <Target size={16} style={{ color: '#34d399' }} />
                  </div>
                  <span className="compare-result-label">Recommendation</span>
                </div>
                <p className="compare-result-text">{result.recommendation}</p>
              </div>
            </div>

            <div className="compare-card compare-result-card">
              <div className="compare-result-icon-row">
                <div className="compare-result-icon compare-result-icon--amber">
                  <Lightbulb size={16} style={{ color: '#fbbf24' }} />
                </div>
                <span className="compare-result-label">Combined Potential</span>
              </div>
              <p className="compare-result-text">{result.combinedPotential}</p>
            </div>

            <div className="compare-card compare-rerun-bar">
              <span className="compare-rerun-hint">Want a different angle?</span>
              <button onClick={handleCompare} className="compare-rerun-btn">
                <Zap size={13} /> Re-analyze
              </button>
            </div>
          </div>
        )}

        {!idea1 && !idea2 && !result && allIdeas.length === 0 && (
          <div className="compare-card compare-empty">
            <div className="compare-empty-emoji">🧠</div>
            <p className="compare-empty-title">No ideas yet</p>
            <p className="compare-empty-sub">Head to the Dashboard to create some ideas first</p>
          </div>
        )}
      </div>
    </div>
  );
}
