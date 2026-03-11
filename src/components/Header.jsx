export default function Header({ title, children }) {
  return (
    <header className="h-[64px] flex-shrink-0 border-b border-border-color bg-background-dark flex items-center justify-between px-8 relative z-10">
      <h2 className="text-xl font-display font-bold text-text-main">{title}</h2>
      {children || (
        <div className="flex items-center gap-4">
          <div className="relative">
            <select className="appearance-none bg-surface border border-border-color text-text-main text-sm font-medium py-2 pl-4 pr-10 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer transition-colors hover:border-muted">
              <option value="2024-2025">2024-2025 Drive</option>
              <option value="2023-2024">2023-2024 Drive</option>
              <option value="2022-2023">2022-2023 Drive</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>
          <button className="w-9 h-9 flex items-center justify-center rounded border border-border-color bg-surface text-muted hover:text-text-main hover:border-muted transition-colors" title="Export Data">
            <span className="material-symbols-outlined text-[18px]">download</span>
          </button>
        </div>
      )}
    </header>
  );
}
