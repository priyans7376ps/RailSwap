import Navbar from '../../components/Navbar';
import VerificationCard from '../../components/VerificationCard';

export default function VerifyTicketPage() {
  return (
    <>
      <Navbar />
      <main className="page-shell grid min-h-[calc(100vh-80px)] place-items-center py-12">
        <VerificationCard />
      </main>
    </>
  );
}
