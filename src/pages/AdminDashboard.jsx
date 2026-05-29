import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBlog,
  FaProjectDiagram,
  FaComments,
  FaStar,
  FaChevronRight,
  FaSyncAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";
import AdminLayout from "../components/AdminLayout";
import { getBlogs, getProjects, getInquiries, getReviews } from "../services/api";

const readData = (result) =>
  result.status === "fulfilled" ? result.value.data.data || [] : [];

export default function AdminDashboard({ setIsAuthenticated }) {
  const [stats, setStats] = useState({
    blogs: 0,
    projects: 0,
    inquiries: 0,
    pendingInquiries: 0,
    reviews: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);

    try {
      const [blogsRes, projectsRes, inquiriesRes, reviewsRes] =
        await Promise.allSettled([
          getBlogs(),
          getProjects(),
          getInquiries(),
          getReviews(),
        ]);

      const blogs = readData(blogsRes);
      const projects = readData(projectsRes);
      const inquiries = readData(inquiriesRes);
      const reviews = readData(reviewsRes);

      setStats({
        blogs: blogs.length,
        projects: projects.length,
        inquiries: inquiries.length,
        pendingInquiries: inquiries.filter(
          (inquiry) => inquiry.status === "pending"
        ).length,
        reviews: reviews.length,
      });

      if ([blogsRes, projectsRes, inquiriesRes, reviewsRes].some(
        (result) => result.status === "rejected"
      )) {
        toast.error("Some dashboard data could not be loaded");
      }
    } catch {
      toast.error("Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchStats, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchStats]);

  const cards = [
    {
      icon: FaBlog,
      title: "Blogs",
      count: stats.blogs,
      helper: "Published posts",
      iconClass: "bg-blue-50 text-blue-600",
      path: "/dashboard/blogs",
    },
    {
      icon: FaProjectDiagram,
      title: "Projects",
      count: stats.projects,
      helper: "Portfolio items",
      iconClass: "bg-emerald-50 text-emerald-600",
      path: "/dashboard/projects",
    },
    {
      icon: FaComments,
      title: "Inquiries",
      count: stats.inquiries,
      helper: `${stats.pendingInquiries} pending`,
      iconClass: "bg-amber-50 text-amber-600",
      path: "/dashboard/inquiries",
    },
    {
      icon: FaStar,
      title: "Reviews",
      count: stats.reviews,
      helper: "Client feedback",
      iconClass: "bg-rose-50 text-rose-600",
      path: "/dashboard/reviews",
    },
  ];

  const refreshAction = (
    <button
      onClick={fetchStats}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <FaSyncAlt className={loading ? "animate-spin" : ""} />
      Refresh
    </button>
  );

  return (
    <AdminLayout
      setIsAuthenticated={setIsAuthenticated}
      title="Dashboard"
      description="A clean overview of blogs, projects, enquiries, and reviews."
      action={refreshAction}
    >
      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />
            <p className="text-sm font-medium text-slate-500">
              Loading dashboard...
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ icon: Icon, title, count, helper, iconClass, path }) => (
              <Link
                key={title}
                to={path}
                className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      {title}
                    </p>
                    <p className="mt-3 text-4xl font-bold text-slate-950">
                      {count}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">{helper}</p>
                  </div>
                  <div className={`rounded-lg p-3 ${iconClass}`}>
                    <Icon className="text-xl" />
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  Manage {title.toLowerCase()}
                  <FaChevronRight className="text-xs transition group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>

          <section className="mt-10">
            <h2 className="text-lg font-bold text-slate-950">Quick actions</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map(({ icon: Icon, title, path }) => (
                <Link
                  key={`action-${title}`}
                  to={path}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="text-slate-400" />
                    {title}
                  </span>
                  <FaChevronRight className="text-xs text-slate-400" />
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </AdminLayout>
  );
}
