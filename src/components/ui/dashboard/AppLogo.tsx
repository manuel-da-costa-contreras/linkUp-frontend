export function AppLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-content-center rounded-xl bg-cyan-500/15 text-cyan-700">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3v18" />
          <path d="M5 12h14" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-800">LinkUP</p>
        <p className="text-xs text-zinc-500">Control panel</p>
      </div>
    </div>
  );
}
