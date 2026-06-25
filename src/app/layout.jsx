import '../styles/globals.css';

export const metadata = {
  title: 'RailSwap | Smart Train Ticket Exchange Marketplace',
  description: 'A premium frontend prototype for exchanging train tickets safely.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
