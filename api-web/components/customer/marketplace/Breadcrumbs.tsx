import Link from 'next/link';

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="text-xs text-slate-500 mb-3 px-0.5" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-slate-300">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-[#2563eb] font-medium">
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-700 font-semibold">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
