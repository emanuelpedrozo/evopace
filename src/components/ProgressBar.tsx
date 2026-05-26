export function ProgressBar({ value, label }: { value: number; label: string }) {
  const normalizedValue = Math.max(0, Math.min(100, value))

  return (
    <div className="progress-row">
      <div>
        <span id={`progress-${label}`}>{label}</span>
        <strong>{normalizedValue}%</strong>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={normalizedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-labelledby={`progress-${label}`}
      >
        <span style={{ width: `${normalizedValue}%` }} />
      </div>
    </div>
  )
}
