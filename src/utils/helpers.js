export const categoryColors = {
  startup: 'bg-blue-100 text-blue-700 border-blue-200',
  content: 'bg-purple-100 text-purple-700 border-purple-200',
  study: 'bg-green-100 text-green-700 border-green-200',
  personal: 'bg-amber-100 text-amber-700 border-amber-200',
  tech: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  health: 'bg-red-100 text-red-700 border-red-200',
  finance: 'bg-lime-100 text-lime-700 border-lime-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
};

export const categoryBorderColors = {
  startup: '#4A7FDB', content: '#7C3AED', study: '#059669',
  personal: '#D97706', tech: '#0891B2', health: '#DC2626',
  finance: '#65A30D', other: '#6B7280',
};

export const priorityColors = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-green-100 text-green-700',
};

export const priorityDot = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-green-500',
};

export const statusColors = {
  raw: 'bg-gray-100 text-gray-600',
  'in-progress': 'bg-blue-100 text-blue-700',
  decided: 'bg-green-100 text-green-700',
};

export const truncate = (str, n = 100) =>
  str?.length > n ? str.slice(0, n) + '...' : str;

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong';
