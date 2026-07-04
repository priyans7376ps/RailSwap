import Link from 'next/link';
import { TrainFront } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="page-shell grid min-h-screen place-items-center py-12">
      <div className="text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
          <TrainFront className="h-8 w-8" />
        </span>
        <h1 className="mt-6 text-5xl font-bold text-slate-950">404</h1>
        <p className="mt-3 text-lg text-slate-600">Page not found</p>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          The page you are looking for does not exist or has been moved to a different route.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn-primary">
            Go to homepage
          </Link>
          <Link href="/search-ticket" className="btn-secondary">
            Search tickets
          </Link>
        </div>
      </div>
    </main>
  );
}
