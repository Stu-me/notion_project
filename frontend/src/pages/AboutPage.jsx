import { Link } from 'react-router-dom'

const agendaItems = [
  {
    title: 'Free service',
    description: 'Capture the ideas that matter without a paywall getting in the way.',
    icon: '✦',
  },
  {
    title: 'No ads',
    description: 'Stay focused on your work with a calm, distraction-free workspace.',
    icon: '◌',
  },
  {
    title: 'Public / private',
    description: 'Share your best work publicly or keep personal notes safely private.',
    icon: '◈',
  },
]

function AboutPage() {
  return (
    <main className="about-page min-h-screen overflow-hidden bg-[var(--about-ink)] text-[var(--about-paper)]">
      <section className="about-hero relative isolate min-h-[680px] px-6 py-6 sm:px-10 lg:px-16">
        <div className="relative z-10 mx-auto flex min-h-[628px] max-w-7xl flex-col">
          <header className="flex items-center justify-between border-b border-white/10 pb-5">
            <Link to="/about" className="flex items-center gap-3 text-lg font-bold tracking-tight">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--about-gold)]/50 bg-[var(--about-jade)] text-xl text-[var(--about-gold)] shadow-lg shadow-black/30">☯</span>
              <span>Pandawrite</span>
            </Link>
            <Link to="/login" className="rounded-full border border-[var(--about-gold)]/60 px-4 py-2 text-sm font-semibold text-[var(--about-gold-light)] transition hover:bg-[var(--about-gold)] hover:text-[var(--about-ink)]">Log in</Link>
          </header>

          <div className="flex flex-1 items-center py-20">
            <div className="max-w-3xl">
              <p className="mb-7 inline-flex -rotate-2 rounded-full border border-[var(--about-gold)]/50 bg-black/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-[var(--about-gold-light)]">Begin your journey</p>
              <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.04em] text-white sm:text-7xl lg:text-8xl">One place for <span className="text-[var(--about-gold-light)]">every idea.</span></h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/70 sm:text-lg">Pandawrite brings your songs, links, videos, notes, and wild ideas together in one peaceful productivity space.</p>
              <Link to="/login" className="mt-9 inline-flex items-center gap-3 rounded-xl bg-[var(--about-gold)] px-6 py-3.5 font-bold text-[var(--about-ink)] shadow-xl shadow-black/30 transition hover:-translate-y-0.5 hover:bg-[var(--about-gold-light)]">Get started <span aria-hidden="true">↗</span></Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-5 text-xs uppercase tracking-[0.18em] text-white/50">
            <span>Collect</span><span className="text-[var(--about-gold)]">•</span><span>Organize</span><span className="text-[var(--about-gold)]">•</span><span>Create</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--about-gold)]">Our agenda</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">Simple tools. Clear mind.</h2>
          <p className="mt-5 text-base leading-7 text-white/55">A thoughtful home for everything you want to remember, revisit, and bring to life.</p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {agendaItems.map((item) => (
            <article key={item.title} className="about-agenda-card rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition hover:-translate-y-1 hover:border-[var(--about-gold)]/50 hover:bg-white/[0.06]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--about-jade)] text-2xl text-[var(--about-gold-light)] shadow-lg shadow-black/20">{item.icon}</div>
              <h3 className="mt-7 text-xl font-bold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/55">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-white/40 sm:px-10">
        <p>Make space for the ideas that move you.</p>
      </footer>
    </main>
  )
}

export default AboutPage
