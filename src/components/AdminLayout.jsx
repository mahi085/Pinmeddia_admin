import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AdminLayout({
  setIsAuthenticated,
  title,
  description,
  action,
  children,
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar setIsAuthenticated={setIsAuthenticated} />

      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        <Header title={title} description={description} action={action} />

        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
