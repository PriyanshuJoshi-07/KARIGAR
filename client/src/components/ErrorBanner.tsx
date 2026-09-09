export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-xl border border-madder/30 bg-madder/10 px-4 py-3 text-sm text-madder" role="alert">
      {message}
    </div>
  );
}
