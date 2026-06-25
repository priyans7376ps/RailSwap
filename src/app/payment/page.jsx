import Navbar from '../../components/Navbar';
import PaymentCard from '../../components/PaymentCard';

export default function PaymentPage() {
  return (
    <>
      <Navbar />
      <main className="page-shell grid min-h-[calc(100vh-80px)] place-items-center py-12">
        <PaymentCard />
      </main>
    </>
  );
}
