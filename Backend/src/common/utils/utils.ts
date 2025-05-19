export function formatTimestamp(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000) - timestamp;
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

// Example LETV calculation (adjust as needed)
export function calculateLETV(amount: number): number {
  return parseFloat((amount / 100000).toFixed(1));
}
