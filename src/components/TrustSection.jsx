export default function TrustSection() {
  const cards = [
    { title: 'Verified Users', desc: 'Verified ticket exchanges with strong identity signals.' },
    { title: 'Secure Payments', desc: 'Protected exchange experience designed for trust.' },
    { title: 'Transparent Process', desc: 'Clear steps at every stage—no surprises.' },
    { title: 'Fast Matching', desc: 'Quick discovery based on route, date and preferences.' },
  ]

  const stats = [
    { value: '10K+', label: 'Verified Tickets' },
    { value: '5K+', label: 'Successful Matches' },
    { value: '99%', label: 'Secure Exchange' },
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="trust">
      <div className="mx-auto max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-white/5 px-4 py-2 text-sm text-white/80 shadow-sm backdrop-blur">
          <span className="text-cyan-300">⟡</span>
          <span className="font-medium">Why users trust RailSwap</span>
        </div>

        <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Why users trust RailSwap</h2>
        <p className="mt-4 text-base leading-relaxed text-white/70">
          Built for responsible trading—verification first, clear flow, and secure exchanges.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10"
          >
            <h3 className="text-base font-semibold text-white">{c.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
          >
            <div className="text-3xl font-semibold text-white">{s.value}</div>
            <div className="mt-1 text-sm font-medium text-white/70">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

