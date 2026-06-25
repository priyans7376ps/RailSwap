import { BadgeCheck, UserRound } from 'lucide-react';
import Navbar from '../../components/Navbar';
import RatingCard from '../../components/RatingCard';
import { dashboardData, profileHistory } from '../../utils/dummyData';

export default function ProfilePage() {
  return (
    <>
      <Navbar />
      <main className="page-shell py-10">
        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="premium-card p-6">
            <span className="grid h-20 w-20 place-items-center rounded-[1.5rem] bg-cyan-100 text-cyan-800">
              <UserRound className="h-9 w-9" />
            </span>
            <h1 className="mt-5 text-3xl font-bold text-slate-950">{dashboardData.user.name}</h1>
            <p className="mt-2 flex items-center gap-2 font-semibold text-emerald-700">
              <BadgeCheck className="h-5 w-5" />
              Verification badge active
            </p>
            <p className="mt-4 leading-7 text-slate-600">Trusted RailSwap member with a strong exchange record and completed ticket handovers.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <RatingCard rating={dashboardData.user.rating} />
            <div className="premium-card p-5">
              <h2 className="font-bold text-slate-950">Previous exchanges</h2>
              <div className="mt-4 space-y-3">
                {profileHistory.map((item) => (
                  <div key={item.route} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{item.route}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.status} · {item.rating} rating</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
