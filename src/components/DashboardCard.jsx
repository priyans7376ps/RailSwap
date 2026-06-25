export default function DashboardCard({ label, value, trend, icon: Icon }) {
  return (
    <div className="premium-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        {Icon && (
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-950">{value}</p>
      <p className="mt-2 text-sm font-medium text-emerald-700">{trend}</p>
    </div>
  );
}
