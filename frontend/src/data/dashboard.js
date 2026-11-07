/** Mock analytics series. Clearly demo data: a real backend will replace adminService.revenue(). */
export const REVENUE_SERIES = {
  daily: {
    labels: ['10a', '12p', '2p', '4p', '6p', '8p', '10p'],
    box: [820, 1480, 1960, 2630, 4120, 4880, 2940],
    food: [210, 520, 610, 780, 1290, 1480, 760],
    peakLabel: '8 PM', caption: 'Today, hourly',
  },
  weekly: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    box: [4300, 4800, 5100, 5500, 7200, 8450, 7400],
    food: [1100, 1250, 1400, 1650, 2300, 2650, 2200],
    peakLabel: 'Saturday', caption: 'This week',
  },
  monthly: {
    labels: ['W1', 'W2', 'W3', 'W4', 'W5'],
    box: [28400, 31200, 29800, 36400, 38400],
    food: [7900, 8700, 8100, 9900, 8220],
    peakLabel: 'Week 5', caption: 'Last 30 days',
  },
};

export const NOTIFICATIONS = {
  customer: [
    { id: 'n1', title: 'Your seat hold is 10 minutes', body: 'Seats are held for 10 minutes while you check out.', time: '2m ago' },
    { id: 'n2', title: 'Gladiator II pre-sales open', body: 'CineClub members get a 48-hour head start.', time: '1h ago' },
    { id: 'n3', title: 'Dune: Part Two is selling fast', body: 'Evening IMAX 70mm shows are almost full.', time: 'Yesterday' },
  ],
  admin: [
    { id: 'a1', title: 'Peak load: 4 halls at full capacity', body: 'Auditorium 1 and 2 are sold out tonight.', time: '5m ago' },
    { id: 'a2', title: 'Refund request pending', body: 'A customer requested a refund inside the 2-hour window.', time: '32m ago' },
    { id: 'a3', title: 'TMS sync latency nominal', body: 'Projection rig latency is 0.012 ms (demo telemetry).', time: '2h ago' },
  ],
};
