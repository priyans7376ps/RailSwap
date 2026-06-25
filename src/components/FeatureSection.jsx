import { ShieldCheck, Search, Lock, Zap } from 'lucide-react'
import FeatureCard from './FeatureCard'

export default function FeatureSection() {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Verified Tickets',
      description: 'Every ticket is verified before listing.',
    },
    {
      icon: Search,
      title: 'Smart Matching',
      description: 'Find tickets based on route, date and preferences.',
    },
    {
      icon: Lock,
      title: 'Secure Exchange',
      description: 'Protected exchange experience.',
    },
    {
      icon: Zap,
      title: 'Fast Process',
      description: 'Simple and quick ticket matching.',
    },
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="features">
      <div className="mx-auto max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 shadow-sm backdrop-blur">
          <span className="text-indigo-200">⟡</span>
          <span className="font-medium">Everything you need for smarter ticket exchange</span>
        </div>
        <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Everything you need for smarter ticket exchange
        </h2>
        <p className="mt-4 text-base leading-relaxed text-white/70">
          Designed like modern fintech: verified, secure, and fast—without unnecessary friction.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <FeatureCard
            key={f.title}
            variant="feature"
            icon={f.icon}
            title={f.title}
            description={f.description}
          />
        ))}
      </div>
    </section>
  )
}

