export function LoadingScreen({ message = 'Loading your portal...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="h-10 w-10 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
      <p className="mt-4 text-sm text-slate-600">{message}</p>
    </div>
  );
}
