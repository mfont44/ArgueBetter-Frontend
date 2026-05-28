export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-accent ${className ?? ""}`}
      aria-hidden
    >
      <circle cx="160" cy="100" r="72" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <circle cx="160" cy="100" r="48" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <path
        d="M 60 120 Q 120 60 160 90 Q 200 120 260 80"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M 80 140 Q 140 100 160 110 Q 180 120 240 100"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <circle cx="100" cy="75" r="4" fill="currentColor" opacity="0.35" />
      <circle cx="220" cy="65" r="3" fill="currentColor" opacity="0.25" />
      <circle cx="180" cy="130" r="5" fill="currentColor" opacity="0.2" />
    </svg>
  );
}
