import { create } from 'zustand';

const useGraphStore = create((set) => ({
  nodes: [],
  edges: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  updateNodePosition: (id, x, y) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, position: { x, y } } : n
      ),
    })),
}));

export default useGraphStore;
