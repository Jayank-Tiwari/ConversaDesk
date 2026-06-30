export const API_BASE = 'http://127.0.0.1:8000';

export function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getStatusColor(status) {
  const s = (status || '').toLowerCase();
  if (s === 'open' || s === 'new') return 'info';
  if (s === 'in progress' || s === 'in_progress') return 'warning';
  if (s === 'resolved' || s === 'closed') return 'success';
  if (s === 'critical' || s === 'escalated') return 'danger';
  return 'neutral';
}

export function getPriorityColor(priority) {
  const p = (priority || '').toLowerCase();
  if (p === 'critical') return 'danger';
  if (p === 'high') return 'warning';
  if (p === 'medium') return 'info';
  if (p === 'low') return 'success';
  return 'neutral';
}

export function getSentimentEmoji(sentiment) {
  const s = (sentiment || '').toLowerCase();
  if (s === 'positive' || s === 'satisfied') return '😊';
  if (s === 'negative' || s === 'frustrated' || s === 'angry') return '😠';
  if (s === 'neutral') return '😐';
  if (s === 'urgent') return '🚨';
  return '💬';
}

export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getDepartmentColor(department) {
  const d = (department || '').toLowerCase();
  if (d === 'finance' || d === 'billing') return '#F59E0B';
  if (d === 'it' || d === 'technical') return '#3B82F6';
  if (d === 'hr' || d === 'human resources') return '#EC4899';
  if (d === 'sales') return '#10B981';
  if (d === 'marketing') return '#8B5CF6';
  if (d === 'support') return '#06B6D4';
  return '#6B7280';
}

export function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function exportToCSV(filename, data) {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => 
    Object.values(obj).map(val => {
      const stringVal = String(val === null || val === undefined ? '' : val);
      return `"${stringVal.replace(/"/g, '""')}"`;
    }).join(',')
  ).join('\n');
  const csv = `${headers}\n${rows}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}