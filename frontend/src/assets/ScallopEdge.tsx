/**
 * A repeating scalloped arch edge — evokes mandap/temple valance trims — used to
 * break up the flat rectangular hero card instead of a plain straight bottom edge.
 * Rendered in the page's background color so it reads as a cut-out silhouette.
 */
export function ScallopEdge({ className, fill = "#faf7f2" }: { className?: string; fill?: string }) {
  const scallops = 14;
  const width = 100 / scallops;

  return (
    <svg
      viewBox={`0 0 ${scallops * 20} 20`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      {Array.from({ length: scallops }).map((_, i) => (
        <circle key={i} cx={i * 20 + 10} cy="0" r="10" fill={fill} />
      ))}
      <rect x="0" y="10" width={scallops * 20} height="10" fill={fill} />
    </svg>
  );
}
