import Navbar from '../../components/Navbar';
import ChatBox from '../../components/ChatBox';

export default function ChatPage() {
  return (
    <>
      <Navbar />
      <main className="page-shell py-10">
        <p className="eyebrow">Exchange chat</p>
        <h1 className="mt-3 text-4xl font-bold text-slate-950">Buyer and seller conversation</h1>
        <div className="mt-8"><ChatBox /></div>
      </main>
    </>
  );
}
