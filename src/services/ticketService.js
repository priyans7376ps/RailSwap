import { dashboardData, tickets } from '../utils/dummyData';

export function getTickets() {
  return tickets;
}

export function getVerifiedTickets() {
  return tickets.filter((ticket) => ticket.verified);
}

export function getDashboardData() {
  return dashboardData;
}
