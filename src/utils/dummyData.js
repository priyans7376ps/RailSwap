export const tickets = [
  {
    id: 'RS-2041',
    route: 'New Delhi to Mumbai Central',
    from: 'New Delhi',
    to: 'Mumbai Central',
    date: '2026-07-12',
    train: '12952 Rajdhani Express',
    classType: '3A',
    gender: 'Male',
    price: 2180,
    originalPrice: 2865,
    verified: true,
    seller: 'Aarav Mehta',
    rating: 4.8,
  },
  {
    id: 'RS-2042',
    route: 'Bengaluru to Chennai Central',
    from: 'Bengaluru',
    to: 'Chennai Central',
    date: '2026-07-16',
    train: '12028 Shatabdi Express',
    classType: 'CC',
    gender: 'Female',
    price: 840,
    originalPrice: 1050,
    verified: true,
    seller: 'Diya Raman',
    rating: 4.9,
  },
  {
    id: 'RS-2043',
    route: 'Pune to Hyderabad',
    from: 'Pune',
    to: 'Hyderabad',
    date: '2026-07-22',
    train: '12701 Hussain Sagar Express',
    classType: '2A',
    gender: 'Any',
    price: 1540,
    originalPrice: 1965,
    verified: false,
    seller: 'Kabir Shah',
    rating: 4.6,
  },
];

export const dashboardData = {
  user: {
    name: 'Priya Sharma',
    verification: 'Verified traveller',
    rating: 4.9,
  },
  stats: [
    { label: 'Active listings', value: '04', trend: '+2 this week' },
    { label: 'Open requests', value: '07', trend: '3 new matches' },
    { label: 'Completed swaps', value: '18', trend: '98% success' },
    { label: 'Saved losses', value: '₹14.8k', trend: 'lifetime' },
  ],
  uploadedTickets: tickets.slice(0, 2),
  requests: [
    'Delhi to Jaipur, 2A, 19 Jul',
    'Mumbai to Pune, CC, 21 Jul',
    'Chennai to Coimbatore, SL, 25 Jul',
  ],
  transactions: [
    { id: 'TXN-8841', route: 'Ahmedabad to Surat', amount: 760, status: 'Escrow released' },
    { id: 'TXN-8842', route: 'Kolkata to Patna', amount: 1210, status: 'Buyer confirmed' },
  ],
  notifications: [
    'New verified match found for Delhi to Jaipur.',
    'Ticket RS-2041 passed PNR consistency checks.',
    'A buyer requested seller chat access.',
  ],
};

export const conversations = [
  {
    name: 'Nikhil Verma',
    preview: 'Can you confirm the boarding station?',
    active: true,
  },
  {
    name: 'RailSwap Trust Desk',
    preview: 'Your verification report is ready.',
    active: false,
  },
  {
    name: 'Ananya Sen',
    preview: 'I am interested in the 3A ticket.',
    active: false,
  },
];

export const profileHistory = [
  { route: 'Delhi to Chandigarh', rating: 5, status: 'Completed' },
  { route: 'Mumbai to Vadodara', rating: 4.8, status: 'Completed' },
  { route: 'Bengaluru to Mysuru', rating: 5, status: 'Completed' },
];
