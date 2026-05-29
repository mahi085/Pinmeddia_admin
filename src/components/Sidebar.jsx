import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaBlog,
  FaProjectDiagram,
  FaComments,
  FaStar,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaHome,
  FaChevronRight,
} from "react-icons/fa";
import toast from "react-hot-toast";

export default function Sidebar({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: "home", icon: FaHome, label: "Dashboard", path: "/dashboard" },
    { id: "blogs", icon: FaBlog, label: "Blogs", path: "/dashboard/blogs" },
    {
      id: "projects",
      icon: FaProjectDiagram,
      label: "Projects",
      path: "/dashboard/projects",
    },
    {
      id: "inquiries",
      icon: FaComments,
      label: "Inquiries",
      path: "/dashboard/inquiries",
    },
    { id: "reviews", icon: FaStar, label: "Reviews", path: "/dashboard/reviews" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    setIsAuthenticated?.(false);
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const isActive = (path) =>
    path === "/dashboard"
      ? location.pathname === path
      : location.pathname.startsWith(path);

  return (
    <aside
      className={`${
        sidebarOpen ? "w-64" : "w-20"
      } sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white text-slate-800 shadow-sm transition-all duration-300 md:flex`}
    >
      <div className="flex min-h-20 items-center justify-between border-b border-slate-200 px-4">
        {sidebarOpen && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-lg font-bold text-white shadow-sm">
              P
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-950">Pin Admin</h1>
              <p className="text-xs font-medium text-slate-500">
                Control panel
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-2 text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900"
          title={sidebarOpen ? "Collapse" : "Expand"}
        >
          {sidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-6">
        {menuItems.map(({ id, icon: Icon, label, path }) => (
          <Link
            key={id}
            to={path}
            title={sidebarOpen ? undefined : label}
            className={`group flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 ${
              isActive(path)
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            <Icon
              className={`flex-shrink-0 text-lg ${
                isActive(path) ? "text-white" : "text-slate-500"
              }`}
            />
            {sidebarOpen && <span>{label}</span>}
            {sidebarOpen && isActive(path) && (
              <FaChevronRight className="ml-auto text-xs" />
            )}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition-all duration-200 hover:bg-red-100 ${
            !sidebarOpen && "justify-center"
          }`}
        >
          <FaSignOutAlt size={18} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
