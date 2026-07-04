'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, CheckCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import RequireAuth from '../../components/RequireAuth';
import { uploadTicketWithProgress } from '../../services/api';

const fields = [
  { name: 'train_number', label: 'Train number', placeholder: 'e.g. 12952', type: 'text' },
  { name: 'source_station', label: 'From station', placeholder: 'e.g. New Delhi', type: 'text' },
  { name: 'destination_station', label: 'Destination', placeholder: 'e.g. Mumbai Central', type: 'text' },
  { name: 'journey_date', label: 'Journey date', placeholder: '', type: 'date' },
  { name: 'class_type', label: 'Class', placeholder: 'e.g. 3A', type: 'text' },
  { name: 'passenger_gender', label: 'Passenger gender', placeholder: 'e.g. Male', type: 'text' },
  { name: 'original_price', label: 'Original price (₹)', placeholder: 'e.g. 2865', type: 'number' },
  { name: 'exchange_price', label: 'Expected exchange price (₹)', placeholder: 'e.g. 2180', type: 'number' },
];

export default function UploadTicketPage() {
  return (
    <RequireAuth>
      <UploadTicketContent />
    </RequireAuth>
  );
}

function UploadTicketContent() {
  const router = useRouter();
  const fileRef = useRef(null);
  const [form, setForm] = useState({});
  const [pnr, setPnr] = useState('');
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!pnr || pnr.length !== 10 || !/^\d{10}$/.test(pnr)) {
      setError('PNR must be a 10-digit number.');
      return;
    }

    const formData = new FormData();
    formData.append('pnr_number', pnr);
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
      setError(err?.message || 'Upload failed. Please try again.');
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
              Your ticket has been submitted for verification. You will be redirected to the dashboard shortly.
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
              Add complete ticket details and a PDF copy. RailSwap will verify the PNR and match your ticket with eligible buyers.
            </p>
          </section>

          <form className="premium-card grid gap-5 p-6 md:grid-cols-2" onSubmit={handleSubmit}>
            <label className="md:col-span-2 space-y-2">
              <span className="label">PNR Number</span>
              <input
                className="field"
                placeholder="10-digit PNR number"
                value={pnr}
                onChange={(e) => setPnr(e.target.value)}
                maxLength={10}
                required
              />
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

            <button type="submit" className="btn-primary md:col-span-2" disabled={loading}>
              {loading ? 'Uploading...' : 'Submit ticket for verification'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
