import { Star } from 'lucide-react';

export default function RatingCard({ rating = 4.9, label = 'Trusted exchange rating' }) {
  return (
    <div className="premium-card p-5">
      <div className="flex items-center gap-2 text-amber-500">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className="h-5 w-5 fill-current" />
        ))}
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-950">{rating}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}
