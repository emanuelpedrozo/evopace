import { Timer } from 'lucide-react'

export function RestTimer({
  seconds,
  total,
}: {
  seconds: number
  total: number
}) {
  if (seconds <= 0) return null

  const progress = total > 0 ? (seconds / total) * 100 : 0
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  const display = minutes > 0 ? `${minutes}:${String(secs).padStart(2, '0')}` : `${secs}s`
  const isLow = seconds <= 5

  const circumference = 2 * Math.PI * 36
  const offset = circumference * (1 - progress / 100)

  return (
    <div className={`rest-timer ${isLow ? 'rest-timer-low' : ''}`} role="timer" aria-label={`Descanso: ${display}`}>
      <svg className="rest-timer-ring" viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="40" r="36" className="rest-timer-track" />
        <circle
          cx="40" cy="40" r="36"
          className="rest-timer-progress"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="rest-timer-label">
        <Timer aria-hidden="true" />
        <span>{display}</span>
      </div>
    </div>
  )
}
