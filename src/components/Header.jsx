import { FaRegClock, FaUserCircle } from "react-icons/fa";

export default function Header({ title, description, action }) {
  const adminEmail = localStorage.getItem("adminEmail") || "Admin";
  const today = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="flex min-h-20 flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              {description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 md:flex">
            <FaRegClock className="text-slate-400" />
            {today}
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
            <FaUserCircle className="text-slate-400" />
            <span className="max-w-36 truncate">{adminEmail}</span>
          </div>

          {action}
        </div>
      </div>
    </header>
  );
}
