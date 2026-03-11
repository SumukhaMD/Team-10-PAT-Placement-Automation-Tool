import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ title, headerRight, children, noPadding = false }) {
  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header title={title}>{headerRight}</Header>
        <div className={`flex-1 overflow-y-auto scrollbar-hide ${noPadding ? '' : 'p-8'}`}>
          <div className={noPadding ? 'h-full flex flex-col' : 'max-w-[1400px] mx-auto flex flex-col gap-8'}>
            {children}
          </div>
        </div>
      </main>
    </>
  );
}
