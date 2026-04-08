export const formatDate = (date, format = 'full') => {
  const d = new Date(date);
  
  const formats = {
    short: d.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short' 
    }),
    medium: d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }),
    full: d.toLocaleString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }),
    dateOnly: d.toLocaleDateString('en-IN'),
    timeOnly: d.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit'
    })
  };

  return formats[format] || formats.medium;
};

export const formatRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(date, 'medium');
};

export const isRecent = (date, days = 7) => {
  const diffMs = new Date() - new Date(date);
  return diffMs < (days * 24 * 60 * 60 * 1000);
};
