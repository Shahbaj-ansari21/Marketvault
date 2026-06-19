import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

const DESC: Record<string, string> = {
  architecture: 'Architectural plans, floor plans, blueprints, elevation drawings, and 3D renders.',
  autocad: '2D and 3D AutoCAD drawings, DWG/DXF files, and CAD drafting templates.',
  mechanical: 'Mechanical parts, assemblies, gear designs, engine components, and machine drawings.',
  'cnc-design': 'CNC machining programs, G-code files, toolpaths, and CNC-ready designs.',
  '3d-printing': 'STL, OBJ, 3MF files optimized for FDM, SLA, and resin 3D printing.',
  'interior-design': 'Interior layouts, furniture arrangements, room designs, and decoration plans.',
  electrical: 'Circuit diagrams, PCB layouts, wiring plans, and electrical panel designs.',
  'civil-engineering': 'Structural designs, bridge designs, road layouts, and infrastructure plans.',
  industrial: 'Industrial plant layouts, machinery designs, and factory floor plans.',
  construction: 'Construction site plans, material lists, and structural building plans.',
  furniture: 'Furniture CAD models, woodworking designs, joinery plans, and cabinet designs.',
  jewelry: 'Jewelry CAD models, ring designs, pendant designs, and 3D renderings.',
  'product-design': 'Product concepts, prototypes, consumer goods designs, and renders.',
  other: 'Designs that don\'t fit into standard categories - open to all creative work.',
};

const ICONS: Record<string, string> = {
  architecture: '🏛️', autocad: '📐', mechanical: '⚙️', 'cnc-design': '🔩',
  '3d-printing': '🖨️', 'interior-design': '🛋️', electrical: '⚡', 'civil-engineering': '🌉',
  industrial: '🏭', construction: '🏗️', furniture: '🪑', jewelry: '💎',
  'product-design': '📦', other: '📁',
};

export function CategoriesPage() {
  const { categories, loading } = useCategories();
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-dark-50 mb-1">Design Categories</h1>
          <p className="text-dark-500 text-sm">Browse by your professional field</p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-6"><div className="h-12 w-12 bg-dark-700 rounded-xl shimmer mb-4" /><div className="h-5 bg-dark-700 rounded shimmer mb-2 w-1/2" /><div className="h-3 bg-dark-700 rounded shimmer w-3/4" /></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <Link key={cat.id} to={`/browse?category=${cat.id}`} className="card p-6 group hover:border-primary-500/30 hover:bg-primary-900/5 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-dark-700/80 border border-dark-600 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shrink-0">{ICONS[cat.slug] || '📁'}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg font-semibold text-dark-100 mb-1 group-hover:text-primary-300 transition-colors">{cat.name}</h3>
                    <p className="text-sm text-dark-500 leading-relaxed">{DESC[cat.slug] || cat.description}</p>
                    <span className="badge-neutral text-xs mt-3"><FileText className="w-3 h-3" />Explore</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
