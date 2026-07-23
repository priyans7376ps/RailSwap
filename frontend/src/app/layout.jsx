import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'RailSwap | Smart Train Ticket Exchange Marketplace',
  description:
    'Exchange unused train tickets with verified passengers through intelligent matching, secure payments, and real-time chat on RailSwap.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
