'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import PaymentCard from '../../components/PaymentCard';
import RequireAuth from '../../components/RequireAuth';
import { searchTickets, startPayment } from '../../services/api';

export default function PaymentPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<div className="grid min-h-screen place-items-center"><Loader2 className="h-8 w-8 animate-spin text-cyan-700" /></div>}>
        <PaymentContent />
      </Suspense>
    </RequireAuth>
  );
}

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketId = searchParams.get('ticket_id');
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!ticketId) {
      setError('No ticket selected for payment.');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        // Fetch tickets and find the specific one. 
        // In a real app we'd have a GET /tickets/:id endpoint.
        const res = await searchTickets({});
        const list = res?.data?.tickets || res?.tickets || [];
        const found = list.find((t) => String(t.id) === String(ticketId));
        
        if (found) {
          setTicket(found);
        } else {
          setError('Ticket not found or no longer available.');
        }
      } catch (err) {
        setError('Failed to load ticket details.');
      } finally {
        setLoading(false);
      }
    })();
  }, [ticketId]);

  const handlePaymentSubmit = async () => {
    if (!ticket) return;
    setError('');
    
    try {
      await startPayment({ ticket_id: ticket.id });
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 3000);
    } catch (err) {
      setError(err?.message || 'Payment processing failed.');
      throw err; // Re-throw for PaymentCard to handle loading state
    }
  };

  if (success) {
    return (
      <>
        <Navbar />
        <main className="page-shell grid min-h-[calc(100vh-80px)] place-items-center py-12">
          <div className="premium-card max-w-md p-8 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-emerald-500" />
            <h1 className="mt-6 text-2xl font-bold text-slate-950">Payment secured</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Your payment is held securely in escrow. The seller has been notified. 
              Funds will be released once the ticket is successfully transferred.
            </p>
            <p className="mt-4 text-xs font-semibold text-slate-400">Redirecting to dashboard...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="page-shell py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <p className="eyebrow">Checkout</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-950">Complete your payment</h1>
            
            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                <h3 className="font-bold text-emerald-900">Escrow Protection Active</h3>
              </div>
              <p className="mt-2 text-sm text-emerald-700">
                Your payment is held safely until the ticket transfer is verified. 
                If the exchange fails, you get a full refund instantly.
              </p>
            </div>

            {loading ? (
              <div className="mt-8 p-4 text-sm text-slate-500">Loading order details...</div>
            ) : error ? (
              <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                {error}
              </div>
            ) : ticket ? (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-slate-900">Order Summary</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Train</span>
                    <span className="font-medium text-slate-900">{ticket.train_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Route</span>
                    <span className="font-medium text-slate-900">{ticket.source_station} to {ticket.destination_station}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date</span>
                    <span className="font-medium text-slate-900">{new Date(ticket.journey_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Class</span>
                    <span className="font-medium text-slate-900">{ticket.class_type}</span>
                  </div>
                  
                  <div className="my-4 border-t border-dashed border-slate-200" />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-slate-900">Total payable</span>
                    <span className="text-cyan-700">₹{ticket.exchange_price}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <section className="lg:pl-8">
            <PaymentCard 
              amount={ticket ? ticket.exchange_price : 0} 
              onSubmit={handlePaymentSubmit}
              disabled={loading || !!error || !ticket}
            />
          </section>
        </div>
      </main>
    </>
  );
}
