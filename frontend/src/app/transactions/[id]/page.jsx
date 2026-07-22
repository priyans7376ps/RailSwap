'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ShieldCheck, CreditCard, CheckCircle, Clock, Train, Star, MessageSquare, AlertCircle, RotateCcw } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import RequireAuth from '../../../components/RequireAuth';
import {
  confirmTransactionCompletion,
  createPaymentOrder,
  getTransactionDetails,
  retryPayment,
  submitUserRating,
  verifyPayment,
} from '../../../services/api';

export default function TransactionPage({ params }) {
  const resolvedParams = use(params);
  const transactionId = resolvedParams.id;

  return (
    <RequireAuth>
      <TransactionContent transactionId={transactionId} />
    </RequireAuth>
  );
}

function TransactionContent({ transactionId }) {
  const [txn, setTxn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [processing, setProcessing] = useState(false);

  // Rating modal state
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const fetchTxn = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTransactionDetails(transactionId);
      const data = res?.data?.transaction || res?.transaction;
      setTxn(data);
      if (data?.user_rating) {
        setRatingSubmitted(true);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load transaction details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (transactionId) fetchTxn();
  }, [transactionId]);

  // Razorpay Test Mode Payment Handler
  const handlePayNow = async () => {
    setProcessing(true);
    setError('');
    setActionMsg('');

    try {
      const res = await createPaymentOrder({ request_id: txn.exchange_request_id, ticket_id: txn.ticket_id });
      const order = res?.data?.order || res?.order;
      const orderId = order?.order_id;

      // Simulate Razorpay Test Mode payment completion
      const testPaymentId = `pay_test_${Math.random().toString(36).substring(2, 10)}`;
      const testSignature = `sig_test_${Math.random().toString(36).substring(2, 14)}`;

      // Send verification to backend
      await verifyPayment({
        transaction_id: txn.id,
        razorpay_order_id: orderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: testSignature
      });

      setActionMsg('Payment completed successfully! ₹' + txn.amount + ' is held in platform escrow.');
      fetchTxn();
    } catch (err) {
      setError(err?.message || 'Payment processing failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmCompletion = async () => {
    setProcessing(true);
    setError('');
    try {
      await confirmTransactionCompletion(txn.id);
      setActionMsg('Exchange confirmed complete! Escrow funds released to seller.');
      fetchTxn();
    } catch (err) {
      setError(err?.message || 'Completion confirmation failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');
    try {
      await submitUserRating({
        transaction_id: txn.id,
        rating: ratingStars,
        review: ratingComment
      });
      setRatingSubmitted(true);
      setActionMsg('Rating submitted successfully! Thank you for your feedback.');
      fetchTxn();
    } catch (err) {
      setError(err?.message || 'Rating submission failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page-shell py-10">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/requests" className="text-sm font-semibold text-cyan-700 hover:underline">
            ← Back to Requests
          </Link>
          {txn?.conversation_id && (
            <Link
              href={`/chat/${txn.conversation_id}`}
              className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
            >
              <MessageSquare className="h-4 w-4" /> Open Chat
            </Link>
          )}
        </div>

        {actionMsg && (
          <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-semibold text-emerald-800">
            {actionMsg}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm font-semibold text-rose-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-slate-500 font-medium">Loading transaction...</div>
        ) : !txn ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-800">
            Transaction not found.
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-6">
              {/* Overview Card */}
              <div className="premium-card p-6 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="eyebrow">Transaction #{txn.id}</span>
                    <h1 className="mt-1 text-2xl font-bold text-slate-950">
                      {txn.ticket?.source_station} → {txn.ticket?.destination_station}
                    </h1>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                      txn.payment_status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : txn.payment_status === 'payment_held'
                        ? 'bg-amber-100 text-amber-800'
                        : txn.payment_status === 'failed'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-cyan-100 text-cyan-800'
                    }`}
                  >
                    Status: {txn.payment_status === 'payment_held' ? 'Held in Escrow' : txn.payment_status}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 text-xs">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="font-semibold text-slate-400">Total Price</span>
                    <p className="mt-1 font-extrabold text-slate-900 text-base">₹{txn.amount}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="font-semibold text-slate-400">Platform Fee (5%)</span>
                    <p className="mt-1 font-bold text-slate-900 text-base">₹{txn.platform_fee}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="font-semibold text-slate-400">Seller Receives</span>
                    <p className="mt-1 font-bold text-emerald-700 text-base">₹{txn.seller_amount}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="font-semibold text-slate-400">Train Number</span>
                    <p className="mt-1 font-bold text-slate-900 text-base">{txn.ticket?.train_number}</p>
                  </div>
                </div>

                {/* Escrow Status Banner */}
                {txn.payment_status === 'payment_held' && (
                  <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900">
                    <p className="font-bold text-sm">Escrow Protection Active</p>
                    <p className="mt-1">
                      Funds are held securely by RailSwap. Once the journey ticket transfer is verified, click "Confirm Completion" to release funds to the seller.
                    </p>
                  </div>
                )}
              </div>

              {/* Transaction Timeline */}
              <div className="premium-card p-6">
                <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-slate-400" /> Transaction Audit Timeline
                </h3>

                <div className="mt-4 space-y-4 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {txn.timeline?.map((ev, idx) => (
                    <div key={ev.id || idx} className="flex items-start gap-4 relative pl-7">
                      <span className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full bg-cyan-600 ring-4 ring-white" />
                      <div className="space-y-0.5 text-xs">
                        <p className="font-bold text-slate-900">{ev.title}</p>
                        <p className="text-slate-600">{ev.notes}</p>
                        <p className="text-[10px] text-slate-400">{new Date(ev.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions Sidebar */}
            <div className="space-y-6">
              <div className="premium-card p-6">
                <h3 className="text-xl font-bold text-slate-950">Payment & Actions</h3>
                
                <div className="mt-4 space-y-3">
                  {txn.payment_status === 'pending' && (
                    <button
                      onClick={handlePayNow}
                      disabled={processing}
                      className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <CreditCard className="h-4 w-4" /> Pay ₹{txn.amount} (Razorpay Test Mode)
                    </button>
                  )}

                  {txn.payment_status === 'payment_held' && (
                    <button
                      onClick={handleConfirmCompletion}
                      disabled={processing}
                      className="btn-primary bg-emerald-600 hover:bg-emerald-700 w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" /> Confirm Completion & Release Funds
                    </button>
                  )}

                  {txn.payment_status === 'failed' && (
                    <button
                      onClick={handlePayNow}
                      disabled={processing}
                      className="btn-primary bg-rose-600 hover:bg-rose-700 w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" /> Retry Payment
                    </button>
                  )}
                </div>
              </div>

              {/* Rating Component (Shows when completed) */}
              {txn.payment_status === 'completed' && (
                <div className="premium-card p-6">
                  <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500 fill-current" /> Rate Swap Partner
                  </h3>

                  {ratingSubmitted ? (
                    <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-center text-xs font-semibold text-emerald-800">
                      You have submitted a review for this transaction. Thank you!
                    </div>
                  ) : (
                    <form className="mt-4 space-y-3" onSubmit={handleSubmitRating}>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setRatingStars(s)}
                            className="p-1"
                          >
                            <Star className={`h-6 w-6 ${s <= ratingStars ? 'text-amber-500 fill-current' : 'text-slate-300'}`} />
                          </button>
                        ))}
                      </div>

                      <textarea
                        className="field text-xs min-h-20"
                        placeholder="Write a quick review for your exchange partner..."
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                      />

                      <button
                        type="submit"
                        disabled={processing}
                        className="btn-primary w-full text-xs py-2"
                      >
                        Submit Rating
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
