export function Skeleton({ width, height, radius }: {
  width?: string
  height?: string
  radius?: string
}) {
  return (
    <div
      className="skeleton"
      style={{ width: width ?? '100%', height: height ?? '20px', borderRadius: radius ?? '8px' }}
    />
  )
}

export function StatSkeleton() {
  return (
    <div className="stat skeleton-stat">
      <Skeleton width="24px" height="24px" radius="6px" />
      <div>
        <Skeleton width="80px" height="14px" />
        <Skeleton width="100px" height="28px" />
        <Skeleton width="120px" height="12px" />
      </div>
    </div>
  )
}

export function PanelSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <section className="panel skeleton-panel">
      <div className="panel-header">
        <Skeleton width="160px" height="18px" />
        <Skeleton width="80px" height="14px" />
      </div>
      <div style={{ display: 'grid', gap: '12px' }}>
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} height="16px" width={`${85 - i * 10}%`} />
        ))}
      </div>
    </section>
  )
}
