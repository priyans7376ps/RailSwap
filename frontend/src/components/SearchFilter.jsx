import { Search } from 'lucide-react';

export default function SearchFilter() {
  const fields = [
    ['From', 'New Delhi'],
    ['To', 'Mumbai Central'],
    ['Date', '2026-07-12'],
    ['Class', '3A'],
    ['Gender', 'Any'],
  ];

  return (
    <form className="premium-card grid gap-4 p-5 md:grid-cols-5">
      {fields.map(([label, placeholder]) => (
        <label key={label} className="space-y-2">
          <span className="label">{label}</span>
          <input className="field" placeholder={placeholder} type={label === 'Date' ? 'date' : 'text'} />
        </label>
      ))}
      <button className="btn-primary md:col-span-5">
        <Search className="h-4 w-4" />
        Find verified matches
      </button>
    </form>
  );
}
