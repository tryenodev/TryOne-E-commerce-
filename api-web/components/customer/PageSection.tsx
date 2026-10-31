type PageSectionProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
};

/** Consistent marketplace page header */
export function PageSection({ title, description, action, children }: PageSectionProps) {
  return (
    <>
      <div className="bg-white shadow-sm rounded-sm px-4 sm:px-5 py-4 mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </>
  );
}
