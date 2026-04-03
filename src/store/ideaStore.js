import { create } from 'zustand';
import { getIdeasAPI, createIdeaAPI, updateIdeaAPI, deleteIdeaAPI, connectIdeasAPI, disconnectIdeasAPI } from '../api/ideas';

let searchDebounceTimer = null;

const useIdeaStore = create((set, get) => ({
  ideas: [],
  allIdeas: [],
  selectedIdea: null,
  isLoading: false,
  filters: { category: 'all', status: 'all', priority: 'all', search: '' },

  fetchIdeas: async () => {
    set({ isLoading: true });
    try {
      const { filters } = get();
      const params = {};
      if (filters.category !== 'all') params.category = filters.category;
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.priority !== 'all') params.priority = filters.priority;
      if (filters.search) params.search = filters.search;

      const hasFilter = Object.keys(params).length > 0;

      if (hasFilter) {
        const [filtered, all] = await Promise.all([getIdeasAPI(params), getIdeasAPI()]);
        set({ ideas: filtered.data.data, allIdeas: all.data.data });
      } else {
        const res = await getIdeasAPI(params);
        set({ ideas: res.data.data, allIdeas: res.data.data });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  // Always fetches ALL ideas with no filters — used by GraphPage so every node appears
  fetchAllIdeas: async () => {
    set({ isLoading: true });
    try {
      const res = await getIdeasAPI();
      set({ ideas: res.data.data, allIdeas: res.data.data });
    } finally {
      set({ isLoading: false });
    }
  },

  addIdea: async (data) => {
    const res = await createIdeaAPI(data);
    set((s) => ({ ideas: [res.data.data, ...s.ideas], allIdeas: [res.data.data, ...s.allIdeas] }));
    get().fetchAllIdeas();
    return res.data.data;
  },

  updateIdea: async (id, data) => {
    const res = await updateIdeaAPI(id, data);
    set((s) => ({
      ideas: s.ideas.map((i) => (i._id === id ? res.data.data : i)),
      allIdeas: s.allIdeas.map((i) => (i._id === id ? res.data.data : i)),
      selectedIdea: res.data.data,
    }));
    return res.data.data;
  },

  deleteIdea: async (id) => {
    await deleteIdeaAPI(id);
    set((s) => ({
      ideas: s.ideas.filter((i) => i._id !== id),
      allIdeas: s.allIdeas.filter((i) => i._id !== id),
    }));
  },

  connectIdeas: async (id, targetId) => {
    await connectIdeasAPI(id, targetId);
    await get().fetchAllIdeas();
  },

  disconnectIdeas: async (id, targetId) => {
    await disconnectIdeasAPI(id, targetId);
    await get().fetchAllIdeas();
  },

  setSelectedIdea: (idea) => set({ selectedIdea: idea }),

  setFilters: (filters) => {
    set((s) => ({ filters: { ...s.filters, ...filters } }));
    if ('search' in filters) {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => get().fetchIdeas(), 350);
    } else {
      get().fetchIdeas();
    }
  },

  clearFilters: () => {
    set({ filters: { category: 'all', status: 'all', priority: 'all', search: '' } });
    get().fetchIdeas();
  },
}));

export default useIdeaStore;