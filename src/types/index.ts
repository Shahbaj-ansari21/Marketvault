export const PROFESSIONS = [
  'Architect','AutoCAD Designer','Mechanical Engineer','Civil Engineer',
  'CNC Operator / Designer','Interior Designer','Structural Engineer',
  'Electrical Engineer','Industrial Designer','Product Designer',
  '3D Designer','Construction Engineer','Furniture Designer',
  'Jewelry Designer','Graphic Designer','UI/UX Designer',
  'Textile Designer','Fashion Designer','Other',
];

export const FILE_TYPES: Record<string, { label: string; color: string; bg: string }> = {
  // CAD Formats
  dwg: { label: 'DWG', color: 'text-blue-300', bg: 'bg-blue-900/50' },
  dxf: { label: 'DXF', color: 'text-cyan-300', bg: 'bg-cyan-900/50' },
  stl: { label: 'STL', color: 'text-orange-300', bg: 'bg-orange-900/50' },
  step: { label: 'STEP', color: 'text-green-300', bg: 'bg-green-900/50' },
  stp: { label: 'STP', color: 'text-green-300', bg: 'bg-green-900/50' },
  obj: { label: 'OBJ', color: 'text-yellow-300', bg: 'bg-yellow-900/50' },
  '3mf': { label: '3MF', color: 'text-orange-300', bg: 'bg-orange-900/50' },
  iges: { label: 'IGES', color: 'text-indigo-300', bg: 'bg-indigo-900/50' },
  igs: { label: 'IGS', color: 'text-indigo-300', bg: 'bg-indigo-900/50' },
  f3d: { label: 'F3D', color: 'text-amber-300', bg: 'bg-amber-900/50' },
  skp: { label: 'SKP', color: 'text-rose-300', bg: 'bg-rose-900/50' },
  gcode: { label: 'GCODE', color: 'text-cyan-300', bg: 'bg-cyan-900/50' },
  nc: { label: 'NC', color: 'text-cyan-300', bg: 'bg-cyan-900/50' },
  // CorelDRAW
  cdr: { label: 'CDR', color: 'text-green-300', bg: 'bg-green-900/50' },
  cdrx: { label: 'CDRX', color: 'text-green-300', bg: 'bg-green-900/50' },
  cmx: { label: 'CMX', color: 'text-green-300', bg: 'bg-green-900/50' },
  // Adobe Formats
  ai: { label: 'AI', color: 'text-yellow-400', bg: 'bg-yellow-900/50' },
  eps: { label: 'EPS', color: 'text-yellow-300', bg: 'bg-yellow-900/50' },
  indd: { label: 'INDD', color: 'text-pink-400', bg: 'bg-pink-900/50' },
  psd: { label: 'PSD', color: 'text-blue-400', bg: 'bg-blue-900/50' },
  psb: { label: 'PSB', color: 'text-blue-400', bg: 'bg-blue-900/50' },
  xd: { label: 'XD', color: 'text-pink-300', bg: 'bg-pink-900/50' },
  // Figma
  fig: { label: 'FIG', color: 'text-purple-300', bg: 'bg-purple-900/50' },
  // Images
  pdf: { label: 'PDF', color: 'text-red-300', bg: 'bg-red-900/50' },
  png: { label: 'PNG', color: 'text-violet-300', bg: 'bg-violet-900/50' },
  jpg: { label: 'JPG', color: 'text-pink-300', bg: 'bg-pink-900/50' },
  jpeg: { label: 'JPEG', color: 'text-pink-300', bg: 'bg-pink-900/50' },
  svg: { label: 'SVG', color: 'text-teal-300', bg: 'bg-teal-900/50' },
  webp: { label: 'WEBP', color: 'text-teal-300', bg: 'bg-teal-900/50' },
  gif: { label: 'GIF', color: 'text-violet-300', bg: 'bg-violet-900/50' },
  // Microsoft Office
  docx: { label: 'DOCX', color: 'text-blue-300', bg: 'bg-blue-900/50' },
  doc: { label: 'DOC', color: 'text-blue-300', bg: 'bg-blue-900/50' },
  xlsx: { label: 'XLSX', color: 'text-green-300', bg: 'bg-green-900/50' },
  xls: { label: 'XLS', color: 'text-green-300', bg: 'bg-green-900/50' },
  pptx: { label: 'PPTX', color: 'text-orange-300', bg: 'bg-orange-900/50' },
  ppt: { label: 'PPT', color: 'text-orange-300', bg: 'bg-orange-900/50' },
  // Archives
  zip: { label: 'ZIP', color: 'text-gray-300', bg: 'bg-gray-700/50' },
  rar: { label: 'RAR', color: 'text-gray-300', bg: 'bg-gray-700/50' },
  '7z': { label: '7Z', color: 'text-gray-300', bg: 'bg-gray-700/50' },
  // Text / Other
  txt: { label: 'TXT', color: 'text-dark-300', bg: 'bg-dark-700' },
  csv: { label: 'CSV', color: 'text-green-300', bg: 'bg-green-900/50' },
};

export function getFileTypeInfo(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return FILE_TYPES[ext] || { label: ext.toUpperCase() || 'FILE', color: 'text-dark-300', bg: 'bg-dark-700' };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export type Profile = {
  id: string; name: string; email: string; profession: string;
  bio: string; avatar_url: string; created_at: string; updated_at: string;
};

export type DesignCategory = {
  id: string; name: string; slug: string; description: string;
  icon: string; created_at: string;
};

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type Design = {
  id: string; user_id: string; title: string; description: string;
  category_id: string | null; tags: string[]; telegram_file_id: string;
  file_name: string; file_size: number; file_type: string;
  thumbnail_url: string; download_count: number; view_count: number;
  like_count: number; is_public: boolean; approval_status: ApprovalStatus;
  created_at: string; updated_at: string;
};

export type DesignWithProfile = Design & {
  profiles: Profile | null;
  design_categories: DesignCategory | null;
};

export type Ad = {
  id: string; title: string; image_url: string; link_url: string;
  position: string; priority: number; is_active: boolean;
  start_date: string; end_date: string | null;
  view_count: number; click_count: number;
  created_at: string; updated_at: string;
};

export type Comment = {
  id: string; design_id: string; user_id: string; content: string;
  created_at: string; updated_at: string;
  profiles?: Profile | null;
};

export type Rating = {
  id: string; design_id: string; user_id: string; rating: number;
  created_at: string;
};

export type RatingSummary = {
  avg_rating: number;
  total_ratings: number;
};

export const ALLOWED_EXTENSIONS = [
  // CAD
  'dwg','dxf','stl','step','stp','obj','3mf','iges','igs','f3d','skp','gcode','nc',
  // CorelDRAW
  'cdr','cdrx','cmx',
  // Adobe
  'ai','eps','indd','psd','psb','xd',
  // Figma
  'fig',
  // Images
  'pdf','png','jpg','jpeg','svg','webp','gif',
  // Office
  'docx','doc','xlsx','xls','pptx','ppt',
  // Archives
  'zip','rar','7z',
  // Other
  'txt','csv',
];

export const FILE_FORMAT_GROUPS = [
  { label: 'CAD & Engineering', exts: ['dwg','dxf','stl','step','stp','obj','3mf','iges','igs','f3d','skp','gcode','nc'] },
  { label: 'CorelDRAW', exts: ['cdr','cdrx','cmx'] },
  { label: 'Adobe Suite', exts: ['ai','eps','psd','psb','indd','xd'] },
  { label: 'Figma', exts: ['fig'] },
  { label: 'Images & PDF', exts: ['pdf','png','jpg','jpeg','svg','webp','gif'] },
  { label: 'Microsoft Office', exts: ['docx','doc','xlsx','xls','pptx','ppt'] },
  { label: 'Archives', exts: ['zip','rar','7z'] },
];
