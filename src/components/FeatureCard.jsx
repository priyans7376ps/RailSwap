import { cn } from '../utils/cn'

export default function FeatureCard({
  variant = 'feature',
  icon: Icon,
  title,
  description,
  stepNumber,
  className,
}) {
  if (variant === 'step') {
    return (
      <div className={cn('relative', className)}>
        <div className="absolute left-0 top-6 hidden h-[calc(100%_-_24px)] w-px bg-gradient-to-b from-indigo-500/40 via-cyan-500/20 to-emerald-500/10 md:block" />

        <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/10">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-indigo-500/20 via-cyan-500/15 to-emerald-500/10 ring-1 ring-white/10">
              <span className="text-xs font-bold tracking-wide text-white/70">
                {String(stepNumber).padStart(2, '0')}
              </span>
              {Icon ? (
                <span className="mt-1 inline-flex">
                  <Icon size={18} className="text-white/90" />
                </span>
              ) : null}
            </div>

            <div>
              <h3 className="text-base font-semibold text-white">{title}</h3>
              {description ? (
                <p className="mt-2 text-sm leading-relaxed text-white/70">{description}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group relative rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.8)] backdrop-blur transition hover:-translate-y-1 hover:bg-white/10',
        className
      )}
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-indigo-500/15 via-cyan-500/8 to-emerald-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-indigo-500/20 via-cyan-500/15 to-emerald-500/10 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110">
          {Icon ? <Icon size={22} className="text-white/90" /> : null}
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {description ? (
            <p className="mt-2 text-sm leading-relaxed text-white/70">{description}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

