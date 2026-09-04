export function ArcPayLogo({
  size = 32,
  withWordmark = false,
  className = "",
}: {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Cove"
      >
        <rect width="32" height="32" rx="9" fill="#0f766e" />
        {/* soft cove / harbor arc */}
        <path
          d="M8 14C8 14 11 22 16 22C21 22 24 14 24 14"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M11 12.5C12.5 11 14.2 10.2 16 10.2C17.8 10.2 19.5 11 21 12.5"
          stroke="white"
          strokeOpacity="0.45"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="16" cy="16.5" r="1.6" fill="white" />
      </svg>
      {withWordmark && (
        <span className="text-[15px] font-semibold tracking-tight text-slate-900">
          Cove
        </span>
      )}
    </div>
  );
}