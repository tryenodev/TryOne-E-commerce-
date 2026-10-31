type AlertBannerProps = {
  variant: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onDismiss?: () => void;
};

const styles = {
  success: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  error: 'bg-rose-50 text-rose-900 border-rose-200',
  warning: 'bg-amber-50 text-amber-900 border-amber-200',
  info: 'bg-sky-50 text-sky-900 border-sky-200',
};

export function AlertBanner({ variant, message, onDismiss }: AlertBannerProps) {
  if (!message) return null;
  return (
    <div
      className={`mb-6 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${styles[variant]}`}
      role="alert"
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 font-medium opacity-70 hover:opacity-100"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}
