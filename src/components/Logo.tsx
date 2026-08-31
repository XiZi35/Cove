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
        aria-label="ArcPay"
      >
        <rect width="32" height="32" rx="9" fill="#0f766e" />
        <path
          d="M9.5 22.5L16 8.5L22.5 22.5"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.2 17.2H19.8"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M8 24.5C10.5 26 13.2 26.8 16 26.8C18.8 26.8 21.5 26 24 24.5"
          stroke="white"
          strokeOpacity="0.35"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      {withWordmark && (
        <span className="text-[15px] font-semibold tracking-tight text-slate-900">
          ArcPay
        </span>
      )}
    </div>
  );
}