type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  accent?: 'emerald' | 'sky' | 'violet' | 'amber';
};

const accentMap = {
  emerald: 'from-emerald-500/10 to-teal-500/5 text-emerald-700',
  sky: 'from-sky-500/10 to-blue-500/5 text-sky-700',
  violet: 'from-violet-500/10 to-purple-500/5 text-violet-700',
  amber: 'from-amber-500/10 to-orange-500/5 text-amber-700',
};

export function StatCard({
  label,
  value,
  hint,
  accent = 'emerald',
}: StatCardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white bg-gradient-to-br ${accentMap[accent]} p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300/80 hover:shadow-md`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl sm:text-3xl font-bold tabular-nums text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
