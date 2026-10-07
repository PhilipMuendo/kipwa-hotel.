/** The Kipwa mark: a pointed Swahili arch with a horizon line through it. */
export default function ArchMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 26" className={className} aria-hidden="true" fill="none">
      <path d="M1,25 L1,9.4 C1,5.2 5,1.8 10,1 C15,1.8 19,5.2 19,9.4 L19,25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1,16.5 H19" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4,20 H16" stroke="currentColor" strokeWidth="1" opacity="0.55" />
    </svg>
  );
}
