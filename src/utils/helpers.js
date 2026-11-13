// Helper utilities for Space Club Flight Operations

export const getUrgencyInfo = (deadlineStr, status) => {
  if (status === 'Completed') {
    return {
      level: 'completed',
      label: 'COMPLETED',
      badgeClass: 'bg-[#3A6B5C] text-white border-[#1E1F22]',
      isUrgent: false,
      diffText: 'ACCOMPLISHED'
    };
  }

  const diffHours = (new Date(deadlineStr).getTime() - Date.now()) / (1000 * 60 * 60);

  if (diffHours < 0) {
    return {
      level: 'overdue',
      label: 'OVERDUE',
      badgeClass: 'bg-[#D95D24] text-white border-[#1E1F22] animate-pulse',
      isUrgent: true,
      diffText: `${Math.abs(Math.round(diffHours))}H EXPIRED`
    };
  }
  if (diffHours <= 24) {
    return {
      level: 'critical',
      label: 'DUE < 24H',
      badgeClass: 'bg-[#D95D24] text-white border-[#1E1F22]',
      isUrgent: true,
      diffText: `${Math.round(diffHours)}H REMAINING`
    };
  }

  const isNear = diffHours <= 72;
  return {
    level: isNear ? 'upcoming' : 'normal',
    label: isNear ? 'DUE < 72H' : 'ON SCHEDULE',
    badgeClass: isNear ? 'bg-[#E29526] text-[#1E1F22] border-[#1E1F22]' : 'bg-[#E6E1D6] text-[#1E1F22] border-[#1E1F22]',
    isUrgent: false,
    diffText: `${Math.round(diffHours / 24)}D REMAINING`
  };
};

export const formatDateTime = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).toUpperCase()
    : 'NO DEADLINE';

export const formatDateOnly = (dateStr) =>
  dateStr
    ? new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).toUpperCase()
    : '';
