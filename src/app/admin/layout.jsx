import '../../styles/globals.css';
import AdminShell from './shell';

export const metadata = {
  title: 'RailSwap | Admin',
  description: 'RailSwap admin portal',
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}

