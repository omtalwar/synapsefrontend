import { Handle, Position } from 'reactflow';
import { categoryBorderColors, priorityDot } from '../../utils/helpers';
import '../../styles/components/CustomNode.css';

const statusStyle = {
  raw: { bg: '#f1f5f9', text: '#64748b' },
  'in-progress': { bg: '#eff6ff', text: '#3b82f6' },
  decided: { bg: '#f0fdf4', text: '#16a34a' },
};

export default function CustomNode({ data, selected }) {
  const borderColor = categoryBorderColors[data.category] || '#6B7280';
  const dotClass = priorityDot[data.priority] || 'bg-gray-400';
  const ss = statusStyle[data.status] || statusStyle.raw;

  return (
    <div
      className={`custom-node ${selected ? 'custom-node--selected' : 'custom-node--default'}`}
      style={{
        border: `2px solid ${selected ? borderColor : borderColor + '80'}`,
        boxShadow: selected
          ? `0 0 0 3px ${borderColor}30, 0 8px 24px rgba(0,0,0,0.12)`
          : '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <div
        className="custom-node-accent-bar"
        style={{
          background: `linear-gradient(90deg, ${borderColor}, ${borderColor}60)`,
          opacity: selected ? 1 : 0.5,
        }}
      />

      <Handle type="target" position={Position.Top}
        style={{ background: borderColor, width: 8, height: 8, border: '2px solid white', top: -5 }} />

      <div className="custom-node-title-row">
        <span className={`custom-node-priority-dot ${dotClass}`} />
        <p className="custom-node-title">{data.title}</p>
      </div>

      <div className="custom-node-meta">
        <span
          className="custom-node-badge"
          style={{ background: borderColor + '18', color: borderColor }}
        >
          {data.category}
        </span>
        <span
          className="custom-node-badge"
          style={{ background: ss.bg, color: ss.text }}
        >
          {data.status === 'in-progress' ? 'active' : data.status}
        </span>
      </div>

      {data.idea?.connections?.length > 0 && (
        <div
          className="custom-node-connection-count"
          style={{ background: borderColor }}
        >
          {data.idea.connections.length}
        </div>
      )}

      <Handle type="source" position={Position.Bottom}
        style={{ background: borderColor, width: 8, height: 8, border: '2px solid white', bottom: -5 }} />
    </div>
  );
}
