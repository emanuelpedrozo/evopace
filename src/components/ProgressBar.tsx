export function ProgressBar({ value, label }: { value: number; label: string }) {
  const normalizedValue = Math.max(0, Math.min(100, value))

  return (
    <div className="progress-row">
      <div>
        <span>{label}</span>
        <strong>{normalizedValue}%</strong>
      </div>
      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${normalizedValue}%` }} />
      </div>
    </div>
  )
}
