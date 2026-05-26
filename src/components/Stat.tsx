import type { StatIcon } from '../types'

export function Stat({
  icon: Icon,
  label,
  value,
  detail,
  tone = 'neutral',
}: {
  icon: StatIcon
  label: string
  value: string
  detail: string
  tone?: 'neutral' | 'good' | 'warning' | 'danger'
}) {
  return (
    <article className={`stat ${tone}`}>
      <Icon aria-hidden="true" />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  )
}
