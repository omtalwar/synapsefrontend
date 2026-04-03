import { useReactFlow } from 'reactflow';
import { ZoomIn, ZoomOut, Maximize2, LayoutGrid } from 'lucide-react';
import { categoryBorderColors } from '../../utils/helpers';

const categories = ['startup', 'content', 'study', 'personal', 'tech', 'health', 'finance', 'other'];

export default function GraphControls({ onAutoLayout, activeCategory, onCategoryFilter }) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      {/* Zoom controls */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col overflow-hidden">
        <button
          onClick={() => zoomIn()}
          className="p-2.5 hover:bg-gray-50 transition-colors text-gray-600 border-b border-gray-100"
          title="Zoom in"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => zoomOut()}
          className="p-2.5 hover:bg-gray-50 transition-colors text-gray-600 border-b border-gray-100"
          title="Zoom out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={() => fitView({ padding: 0.1, duration: 400 })}
          className="p-2.5 hover:bg-gray-50 transition-colors text-gray-600 border-b border-gray-100"
          title="Fit view"
        >
          <Maximize2 size={16} />
        </button>
        <button
          onClick={onAutoLayout}
          className="p-2.5 hover:bg-gray-50 transition-colors text-gray-600"
          title="Auto layout"
        >
          <LayoutGrid size={16} />
        </button>
      </div>

      {/* Category filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-2 flex flex-col gap-1">
        <p className="text-[10px] text-gray-400 font-semibold uppercase px-1 mb-0.5">Filter</p>
        <button
          onClick={() => onCategoryFilter('all')}
          className={`text-[11px] px-2 py-1 rounded-lg font-medium transition-colors text-left ${
            activeCategory === 'all' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryFilter(cat)}
            className={`text-[11px] px-2 py-1 rounded-lg font-medium capitalize transition-colors text-left ${
              activeCategory === cat ? 'text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
            style={activeCategory === cat ? { background: categoryBorderColors[cat] } : {}}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
