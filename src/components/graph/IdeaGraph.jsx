import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import CustomNode from './CustomNode';
import GraphControls from './GraphControls';
import useIdeaStore from '../../store/ideaStore';
import useGraphStore from '../../store/graphStore';
import { updatePositionAPI, connectIdeasAPI } from '../../api/ideas';
import { categoryBorderColors } from '../../utils/helpers';

const nodeTypes = { ideaNode: CustomNode };

const AUTO_LAYOUT_COLS = 4;
const H_GAP = 240;
const V_GAP = 160;

// Returns true if the idea has never been manually positioned (server default is {x:0, y:0})
function hasNoSavedPosition(idea) {
  return !idea.graphPosition || (idea.graphPosition.x === 0 && idea.graphPosition.y === 0);
}

export default function IdeaGraph({ onNodeClick, selectedIdeaId }) {
  const { ideas, fetchAllIdeas } = useIdeaStore();
  const { setNodes: setStoreNodes, setEdges: setStoreEdges } = useGraphStore();
  const [activeCategory, setActiveCategory] = useState('all');

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Always fetch all ideas on mount — bypasses any active store filters
  useEffect(() => { fetchAllIdeas(); }, []);

  useEffect(() => {
    const filtered = activeCategory === 'all'
      ? ideas
      : ideas.filter((i) => i.category === activeCategory);

    // Auto-layout index only counts ideas that have no saved position
    let autoIdx = 0;
    const newNodes = filtered.map((idea) => {
      let position;
      if (hasNoSavedPosition(idea)) {
        // Spread unsaved ideas in a grid — each gets a unique slot
        position = {
          x: (autoIdx % AUTO_LAYOUT_COLS) * H_GAP + 50,
          y: Math.floor(autoIdx / AUTO_LAYOUT_COLS) * V_GAP + 50,
        };
        autoIdx++;
      } else {
        position = { x: idea.graphPosition.x, y: idea.graphPosition.y };
      }

      return {
        id: idea._id,
        type: 'ideaNode',
        position,
        selected: idea._id === selectedIdeaId,
        data: {
          title: idea.title,
          category: idea.category,
          priority: idea.priority,
          status: idea.status,
          idea,
        },
      };
    });

    const filteredIds = new Set(filtered.map((i) => i._id));

    const newEdges = [];
    filtered.forEach((idea) => {
      (idea.connections || []).forEach((connId) => {
        const targetId = typeof connId === 'object' ? connId._id || connId.toString() : connId;
        if (filteredIds.has(targetId) && idea._id < targetId) {
          newEdges.push({
            id: `${idea._id}-${targetId}`,
            source: idea._id,
            target: targetId,
            animated: true,
            style: { stroke: categoryBorderColors[idea.category] || '#6B7280', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: categoryBorderColors[idea.category] || '#6B7280' },
          });
        }
      });
    });

    // Preserve positions the user has manually dragged this session
    setNodes((prev) => {
      const draggedPos = new Map(prev.map((n) => [n.id, n.position]));
      return newNodes.map((n) => ({
        ...n,
        // Only use the in-memory dragged position if it exists AND the idea has no server-saved position
        // (if it has a server position, always use that — it was saved intentionally)
        position: (draggedPos.has(n.id) && hasNoSavedPosition(n.data.idea))
          ? draggedPos.get(n.id)
          : n.position,
      }));
    });

    setEdges(newEdges);
    setStoreNodes(newNodes);
    setStoreEdges(newEdges);
  }, [ideas, activeCategory, selectedIdeaId]);

  const onNodeDragStop = useCallback(async (_, node) => {
    try {
      await updatePositionAPI(node.id, node.position.x, node.position.y);
    } catch { }
  }, []);

  const onConnect = useCallback(async (params) => {
    try {
      await connectIdeasAPI(params.source, params.target);
      const color = categoryBorderColors['other'];
      setEdges((eds) =>
        addEdge({
          ...params,
          animated: true,
          style: { stroke: color, strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color },
        }, eds)
      );
      await fetchAllIdeas();
    } catch { }
  }, [fetchAllIdeas]);

  const handleAutoLayout = useCallback(() => {
    setNodes((nds) =>
      nds.map((n, idx) => ({
        ...n,
        position: {
          x: (idx % AUTO_LAYOUT_COLS) * H_GAP + 50,
          y: Math.floor(idx / AUTO_LAYOUT_COLS) * V_GAP + 50,
        },
      }))
    );
  }, []);

  const minimapNodeColor = (node) => categoryBorderColors[node.data?.category] || '#6B7280';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        onNodeClick={(_, node) => onNodeClick && onNodeClick(node.data.idea)}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        deleteKeyCode={null}
      >
        <Background color="#e2e8f0" gap={20} />
        <MiniMap nodeColor={minimapNodeColor} maskColor="rgba(240,244,255,0.6)" className="rounded-xl" />
        <GraphControls
          onAutoLayout={handleAutoLayout}
          activeCategory={activeCategory}
          onCategoryFilter={setActiveCategory}
        />
      </ReactFlow>
    </div>
  );
}