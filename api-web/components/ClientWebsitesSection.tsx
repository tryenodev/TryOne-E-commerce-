const chessClientUrl =
  process.env.NEXT_PUBLIC_CHESS_CLIENT_URL || 'http://localhost:3002';

const clients = [
  {
    name: 'Chess with Karthik',
    tagline: 'Think. Calculate. Win.',
    description:
      'Professional chess coaching website with student portal, admin panel, homework, puzzles, and coach feedback.',
    href: chessClientUrl,
    icon: '♔',
    accent: 'from-emerald-600 to-green-900',
    badge: 'Live Client',
    features: ['Student Portal', 'Admin Panel', 'PDF Resources'],
  },
];

export default function ClientWebsitesSection() {
  return (
    <section id="client-sites" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-20">
      <div className="text-center mb-10">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Client Projects</span>
        <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900">Built on Tryeno One</h2>
        <p className="mt-2 text-slate-600 max-w-xl mx-auto">
          Click a client site below to open the live website
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {clients.map((client) => (
          <a
            key={client.name}
            href={client.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block"
          >
            <div className={`h-2 bg-gradient-to-r ${client.accent}`} />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${client.accent} flex items-center justify-center text-xl text-white shadow-md group-hover:scale-105 transition-transform`}>
                  {client.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  {client.badge}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                {client.name}
              </h3>
              <p className="text-sm text-emerald-700 font-medium italic mt-0.5">{client.tagline}</p>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">{client.description}</p>

              <ul className="flex flex-wrap gap-2 mt-4">
                {client.features.map((f) => (
                  <li key={f} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 group-hover:gap-3 transition-all">
                Open Website
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
