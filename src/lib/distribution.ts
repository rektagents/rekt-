// Monthly reward distribution schedule
// Claims open on the 28th and close on the 3rd of next month
// This gives a 5-day window each month to claim

export function getNextDistributionDate(): { openDate: Date; closeDate: Date; isOpen: boolean } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Current month distribution window: 28th to 3rd of next month
  const currentOpen = new Date(year, month, 28, 0, 0, 0);
  const currentClose = new Date(year, month + 1, 3, 23, 59, 59);

  if (now <= currentClose) {
    return {
      openDate: currentOpen,
      closeDate: currentClose,
      isOpen: now >= currentOpen,
    };
  }

  // Next month's window
  const nextOpen = new Date(year, month + 1, 28, 0, 0, 0);
  const nextClose = new Date(year, month + 2, 3, 23, 59, 59);

  return {
    openDate: nextOpen,
    closeDate: nextClose,
    isOpen: false,
  };
}

export function isClaimWindowOpen(): boolean {
  const { isOpen } = getNextDistributionDate();
  return isOpen;
}

export function formatDistributionDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function daysUntilDistribution(): number {
  const { openDate } = getNextDistributionDate();
  const now = new Date();
  const diff = openDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
