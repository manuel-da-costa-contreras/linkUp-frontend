export function AppLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-content-center rounded-full bg-gradient-to-b from-primary-500 to-primary-400 text-white shadow-md shadow-primary-500/30">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M5.5 11.8C8.6 8.3 12.2 8.3 15.3 11.8c-3.1-1.7-6.7-1.7-9.8 0Zm-1.8 4.1c4.4-5.2 12.1-5.2 16.5 0-5.2-2.6-11.3-2.6-16.5 0Zm2.7-8.2c2.3-2.6 8.9-2.6 11.2 0-3.5-1.4-7.7-1.4-11.2 0Z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-800">LinkUP</p>
        <p className="text-xs text-neutral-500">Control panel</p>
      </div>
    </div>
  );
}
