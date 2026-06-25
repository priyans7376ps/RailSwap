import { ShieldCheck, Upload, SearchCheck, Lock } from 'lucide-react'
import FeatureCard from './FeatureCard'

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="how">
      <div className="mx-auto max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 shadow-sm backdrop-blur">
          <span className="text-cyan-300">⟡</span>
          <span className="font-medium">Built to be verified end-to-end</span>
        </div>

        <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">How RailSwap Works</h2>
        <p className="mt-4 text-base leading-relaxed text-white/70">
          A simple timeline that keeps every exchange verified and secure.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-5xl">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:translate-y-0">
            <FeatureCard
              variant="step"
              stepNumber={1}
              icon={ShieldCheck}
              title="Verify Ticket"
              description="Enter PNR and verify your ticket."
            />
          </div>

          <div className="md:translate-y-0">
            <FeatureCard
              variant="step"
              stepNumber={2}
              icon={Upload}
              title="List Ticket"
              description="Upload verified ticket details."
            />
          </div>

          <div className="md:translate-y-0">
            <FeatureCard
              variant="step"
              stepNumber={3}
              icon={SearchCheck}
              title="Find Match"
              description="AI based matching finds users."
            />
          </div>

          <div className="md:translate-y-0">
            <FeatureCard
              variant="step"
              stepNumber={4}
              icon={Lock}
              title="Complete Exchange"
              description="Secure transaction completed."
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur">
            No dashboard needed — just a verified, secure flow.
          </div>
        </div>
      </div>
    </section>
  )
}

