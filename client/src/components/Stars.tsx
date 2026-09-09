export function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-1" aria-label={`${value} stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`text-lg ${n <= value ? "text-clay-500" : "text-clay-200"}`}
          onClick={() => onChange?.(n)}
          disabled={!onChange}
        >
          {n <= value ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}
