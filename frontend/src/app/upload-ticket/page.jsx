'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UploadCloud, CheckCircle, ShieldCheck, ShieldAlert, Search } from 'lucide-react';
import Navbar from '../../components/Navbar';
import RequireAuth from '../../components/RequireAuth';
import { uploadTicketWithProgress, verifyTicket } from '../../services/api';

const fields = [
  { name: 'train_number', label: 'Train number', placeholder: 'e.g. 12951', type: 'text' },
  { name: 'source_station', label: 'From station', placeholder: 'e.g. NDLS', type: 'text' },
  { name: 'destination_station', label: 'Destination', placeholder: 'e.g. MMCT', type: 'text' },
  { name: 'journey_date', label: 'Journey date', placeholder: '', type: 'date' },
  { name: 'class_type', label: 'Class', placeholder: 'e.g. 3A', type: 'text' },
  { name: 'passenger_gender', label: 'Passenger gender', placeholder: 'e.g. Male', type: 'text' },
  { name: 'original_price', label: 'Original price (₹)', placeholder: 'e.g. 2865', type: 'number' },
  { name: 'exchange_price', label: 'Expected exchange price (₹)', placeholder: 'e.g. 2180', type: 'number' },
];

export default function UploadTicketPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
        <UploadTicketContent />
      </Suspense>
    </RequireAuth>
  );
}

function UploadTicketContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileRef = useRef(null);

  const initialPnr = searchParams?.get('pnr') || '';
  const initialVerified = searchParams?.get('verified') === 'true';

  const [form, setForm] = useState({});
  const [pnr, setPnr] = useState(initialPnr);
  const [verified, setVerified] = useState(initialVerified);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Auto-verify if pre-filled with valid PNR
  useEffect(() => {
    if (initialPnr && /^\d{10}$/.test(initialPnr)) {
      handlePnrVerification(initialPnr);
    }
  }, [initialPnr]);

  const handlePnrVerification = async (pnrToVerify) => {
    const targetPnr = (pnrToVerify || pnr).trim();
    if (!targetPnr || !/^\d{10}$/.test(targetPnr)) {
      setVerifyError('Invalid PNR number. Must be exactly 10 digits.');
      setVerified(false);
      return;
    }

    setVerifying(true);
    setVerifyError('');

    try {
      const res = await verifyTicket({ pnr: targetPnr });
      if (res && res.verified) {
        setVerified(true);
        // Auto-populate form fields from PNR verification data
        setForm((prev) => ({
          ...prev,
          train_number: prev.train_number || res.train_number || '',
          source_station: prev.source_station || res.source || '',
          destination_station: prev.destination_station || res.destination || '',
          journey_date: prev.journey_date || res.journey_date || '',
        }));
      } else {
        setVerified(false);
        setVerifyError(res?.message || 'Invalid PNR number.');
      }
    } catch (err) {
      setVerified(false);
      setVerifyError(err?.message || 'Invalid PNR number.');
    } finally {
      setVerifying(false);
    }
  };

  const handlePnrChange = (e) => {
    const val = e.target.value;
    setPnr(val);
    setVerified(false);
    setVerifyError('');
  };

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // CRITICAL: Reject upload if verified is not true
    if (!verified) {
      setError('PNR verification failed. Ticket upload requires verified == true.');
      return;
    }

    if (!pnr || !/^\d{10}$/.test(pnr.trim())) {
      setError('Invalid PNR number. Must contain exactly 10 digits.');
      return;
    }

    const formData = new FormData();
    formData.append('pnr_number', pnr.trim());
    for (const f of fields) {
      if (!form[f.name]) {
        setError(`Please fill in "${f.label}".`);
        return;
      }
      formData.append(f.name, form[f.name]);
    }
    if (file) {
      formData.append('ticket_pdf', file);
    }

    setLoading(true);
    setProgress(0);
    try {
      await uploadTicketWithProgress({
        formData,
        onProgress: setProgress,
      });
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err) {
      setError(err?.message || 'Upload failed. PNR verification required.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Navbar />
        <main className="page-shell grid min-h-[calc(100vh-80px)] place-items-center py-12">
          <div className="premium-card max-w-md p-8 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-emerald-600" />
            <h1 className="mt-4 text-2xl font-bold text-slate-950">Ticket submitted</h1>
            <p className="mt-2 text-sm text-slate-600">
              Your verified ticket has been successfully listed for exchange. Redirecting to dashboard...
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="page-shell py-10">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <section>
            <p className="eyebrow">Seller workflow</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-950">Upload ticket for exchange</h1>
            <p className="mt-4 leading-7 text-slate-600">
              Add complete ticket details and a PDF copy. RailSwap verifies the 10-digit PNR with RapidAPI before allowing ticket listing.
            </p>
          </section>

          <form className="premium-card grid gap-5 p-6 md:grid-cols-2" onSubmit={handleSubmit}>
            <label className="md:col-span-2 space-y-2">
              <span className="label">PNR Number</span>
              <div className="flex gap-2">
                <input
                  className="field flex-1"
                  placeholder="10-digit PNR number"
                  value={pnr}
                  onChange={handlePnrChange}
                  maxLength={10}
                  required
                />
                <button
                  type="button"
                  onClick={() => handlePnrVerification(pnr)}
                  disabled={verifying || !pnr || pnr.length !== 10}
                  className="btn-primary shrink-0 text-sm px-4"
                >
                  {verifying ? 'Checking...' : <><Search className="h-4 w-4 inline mr-1" /> Verify PNR</>}
                </button>
              </div>

              {verified && (
                <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>PNR Verified (verified == true)</span>
                </div>
              )}

              {verifyError && (
                <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">
                  <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{verifyError}</span>
                </div>
              )}
            </label>

            {fields.map((f) => (
              <label key={f.name} className="space-y-2">
                <span className="label">{f.label}</span>
                <input
                  className="field"
                  placeholder={f.placeholder}
                  type={f.type}
                  value={form[f.name] || ''}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                  required
                />
              </label>
            ))}

            <label className="md:col-span-2">
              <span className="label">Upload ticket PDF</span>
              <div
                className="mt-2 grid min-h-40 cursor-pointer place-items-center rounded-2xl border border-dashed border-cyan-300 bg-cyan-50/60 p-6 text-center transition hover:bg-cyan-50"
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <UploadCloud className="mx-auto h-8 w-8 text-cyan-700" />
                <p className="mt-3 font-semibold text-slate-900">
                  {file ? file.name : 'Drop ticket PDF or click to browse'}
                </p>
                <p className="mt-1 text-sm text-slate-500">Only PDF files up to 5 MB</p>
              </div>
            </label>

            {loading && progress > 0 && (
              <div className="md:col-span-2">
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-cyan-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">{progress}% uploaded</p>
              </div>
            )}

            {error && (
              <div className="md:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary md:col-span-2 disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={loading || !verified}
            >
              {loading ? 'Uploading...' : verified ? 'Submit ticket for exchange' : 'Verify PNR to Enable Upload'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
