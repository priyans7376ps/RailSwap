import { CheckCircle2 } from 'lucide-react'
import heroImg from '../assets/hero.png'

function RouteCard() {
  return (
    <div className="rounded-[2rem] border border-white/15 bg-white/5 p-6 shadow-[0_40px_100px_-60px_rgba(0,0,0,0.9)] backdrop-blur-xl transition hover:bg-white/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white/90">Travel route</p>
          <p className="mt-1 text-xs text-white/60">Verified travel card</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70">
          Status: Verified
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/12 via-cyan-500/10 to-emerald-500/5">
        <div className="grid gap-0 p-0 sm:grid-cols-2">
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="text-lg font-semibold text-white">Delhi</div>
              <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/60 via-white/20 to-emerald-400/60" />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="text-emerald-200/0" />
              <div className="text-white/80">↓</div>
              <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/40 via-white/10 to-cyan-400/40" />
            </div>
            <div className="mt-3 text-lg font-semibold text-white">Mumbai</div>
          </div>

          <div className="relative p-5">
            <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.25),transparent_55%)]" />
            <div className="relative">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="text-xs font-semibold text-white/60">Date</div>
                <div className="text-sm font-semibold text-white">25 June</div>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="text-xs font-semibold text-white/60">Class</div>
                <div className="text-sm font-semibold text-white">3A</div>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="text-xs font-semibold text-white/60">Verified</div>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/15 ring-1 ring-emerald-300/20">
                    ✓
                  </span>
                  Yes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="aspect-[16/9] w-full">
          <img src={heroImg} alt="Train travel" className="h-full w-full object-cover opacity-85" />
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="top">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 shadow-sm backdrop-blur">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 ring-1 ring-white/10">
              ✦
            </span>
            <span className="font-medium">Verified exchange — built for trust & speed</span>
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Exchange Train Tickets <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-200">Smarter</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            RailSwap helps passengers exchange unused train tickets with verified users through intelligent matching and secure transactions.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#find"
              className="group inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_60px_-30px_rgba(56,189,248,0.8)] transition hover:-translate-y-0.5 hover:shadow-[0_25px_80px_-45px_rgba(56,189,248,1)] focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
            >
              Find Tickets
              <span className="ml-2 transition group-hover:translate-x-1">→</span>
            </a>

            <a
              href="#upload"
              className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/10 hover:border-white/25 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              Upload Ticket
            </a>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span className="text-sm font-semibold text-white/90">Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-cyan-400" />
                <span className="text-sm font-semibold text-white/90">Smart</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-indigo-400" />
                <span className="text-sm font-semibold text-white/90">Secure</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-10 -z-10 rounded-[2.5rem] bg-gradient-to-b from-indigo-500/15 via-cyan-500/10 to-emerald-500/10 blur-2xl" />

          <div className="animate-float">
            <RouteCard />
          </div>

          <div className="pointer-events-none absolute -bottom-10 -right-10 h-28 w-28 rounded-3xl bg-gradient-to-r from-indigo-500/30 via-cyan-500/20 to-emerald-500/25 blur-xl" />
        </div>
      </div>
    </section>
  )
}

