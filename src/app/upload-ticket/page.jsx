import { UploadCloud } from 'lucide-react';
import Navbar from '../../components/Navbar';

const fields = [
  ['Train number', '12952'],
  ['From station', 'New Delhi'],
  ['Destination', 'Mumbai Central'],
  ['Journey date', '2026-07-12'],
  ['Class', '3A'],
  ['Passenger gender', 'Male'],
  ['Original price', '2865'],
  ['Expected exchange price', '2180'],
];

export default function UploadTicketPage() {
  return (
    <>
      <Navbar />
      <main className="page-shell py-10">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <section>
            <p className="eyebrow">Seller workflow</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-950">Upload ticket for exchange</h1>
            <p className="mt-4 leading-7 text-slate-600">Add complete ticket details so RailSwap can match the exact buyer criteria in Phase 1 UI.</p>
          </section>
          <form className="premium-card grid gap-5 p-6 md:grid-cols-2">
            {fields.map(([label, placeholder]) => (
              <label key={label} className="space-y-2">
                <span className="label">{label}</span>
                <input className="field" placeholder={placeholder} type={label.includes('date') ? 'date' : 'text'} />
              </label>
            ))}
            <label className="md:col-span-2">
              <span className="label">Upload PDF</span>
              <div className="mt-2 grid min-h-40 place-items-center rounded-2xl border border-dashed border-cyan-300 bg-cyan-50/60 p-6 text-center">
                <UploadCloud className="mx-auto h-8 w-8 text-cyan-700" />
                <p className="mt-3 font-semibold text-slate-900">Drop ticket PDF or browse</p>
                <p className="mt-1 text-sm text-slate-500">PDF upload UI only. Backend storage comes later.</p>
              </div>
            </label>
            <button className="btn-primary md:col-span-2">Submit ticket for verification</button>
          </form>
        </div>
      </main>
    </>
  );
}
