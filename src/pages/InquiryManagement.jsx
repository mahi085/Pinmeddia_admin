import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaComments,
  FaEnvelope,
  FaFilter,
  FaPhoneAlt,
  FaSearch,
  FaSyncAlt,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import toast from "react-hot-toast";
import AdminLayout from "../components/AdminLayout";
import {
  getInquiries,
  updateInquiry,
  deleteInquiry,
} from "../services/api";

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-100",
  },
  contacted: {
    label: "Contacted",
    className: "bg-blue-50 text-blue-700 border-blue-100",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
};

export default function InquiryManagement({ setIsAuthenticated }) {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getInquiries();
      setInquiries(data.data || []);
    } catch {
      toast.error("Failed to fetch inquiries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchInquiries, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchInquiries]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateInquiry(id, { status });
      toast.success(`Marked as ${statusConfig[status].label.toLowerCase()}`);
      fetchInquiries();
    } catch {
      toast.error("Failed to update inquiry");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this inquiry?")) {
      return;
    }

    try {
      await deleteInquiry(id);
      toast.success("Inquiry deleted");
      setSelectedInquiry(null);
      fetchInquiries();
    } catch {
      toast.error("Failed to delete inquiry");
    }
  };

  const counts = useMemo(
    () => ({
      total: inquiries.length,
      pending: inquiries.filter((inquiry) => inquiry.status === "pending")
        .length,
      contacted: inquiries.filter((inquiry) => inquiry.status === "contacted")
        .length,
      completed: inquiries.filter((inquiry) => inquiry.status === "completed")
        .length,
    }),
    [inquiries]
  );

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visibleInquiries = inquiries.filter((inquiry) => {
    const currentStatus = inquiry.status || "pending";
    const matchesStatus =
      statusFilter === "all" || currentStatus === statusFilter;
    const matchesSearch =
      !normalizedSearch ||
      [
        inquiry.name,
        inquiry.email,
        inquiry.phone,
        inquiry.service,
        inquiry.message,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);

    return matchesStatus && matchesSearch;
  });

  const refreshAction = (
    <button
      onClick={fetchInquiries}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <FaSyncAlt className={loading ? "animate-spin" : ""} />
      Refresh
    </button>
  );

  const renderStatus = (status = "pending") => {
    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <AdminLayout
      setIsAuthenticated={setIsAuthenticated}
      title="Inquiry Management"
      description="Track website enquiries from the contact page and header form."
      action={refreshAction}
    >
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Total", counts.total, "bg-slate-50 text-slate-700"],
          ["Pending", counts.pending, "bg-amber-50 text-amber-700"],
          ["Contacted", counts.contacted, "bg-blue-50 text-blue-700"],
          ["Completed", counts.completed, "bg-emerald-50 text-emerald-700"],
        ].map(([label, value, className]) => (
          <div
            key={label}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className={`mt-2 text-3xl font-bold ${className}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_auto]">
        <label className="relative block">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, email, phone, service, or message"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
          />
        </label>

        <label className="relative block min-w-48">
          <FaFilter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
          >
            <option value="all">All inquiries</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="completed">Completed</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-100 border-t-amber-600" />
        </div>
      ) : visibleInquiries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <FaComments className="text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-slate-950">
            No inquiries found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            New website enquiries will appear here after submission.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {visibleInquiries.map((inquiry) => {
            const currentStatus = inquiry.status || "pending";

            return (
              <article
                key={inquiry._id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold text-slate-950">
                        {inquiry.name}
                      </h2>
                      {renderStatus(currentStatus)}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                      <a
                        href={`mailto:${inquiry.email}`}
                        className="inline-flex items-center gap-2 font-medium hover:text-slate-950"
                      >
                        <FaEnvelope className="text-slate-400" />
                        {inquiry.email}
                      </a>
                      {inquiry.phone && (
                        <a
                          href={`tel:${inquiry.phone}`}
                          className="inline-flex items-center gap-2 font-medium hover:text-slate-950"
                        >
                          <FaPhoneAlt className="text-slate-400" />
                          {inquiry.phone}
                        </a>
                      )}
                      {inquiry.createdAt && (
                        <span className="inline-flex items-center gap-2">
                          <FaClock className="text-slate-400" />
                          {new Date(inquiry.createdAt).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {inquiry.service && (
                      <p className="mt-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        {inquiry.service}
                      </p>
                    )}

                    {inquiry.message && (
                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                        {inquiry.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
                    <button
                      onClick={() => setSelectedInquiry(inquiry)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View Details
                    </button>
                    {currentStatus !== "contacted" && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(inquiry._id, "contacted")
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        <FaCheckCircle />
                        Contacted
                      </button>
                    )}
                    {currentStatus !== "completed" && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(inquiry._id, "completed")
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        <FaCheckCircle />
                        Completed
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(inquiry._id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                    >
                      <FaTrash />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  {selectedInquiry.name}
                </h2>
                <div className="mt-2">
                  {renderStatus(selectedInquiry.status || "pending")}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close inquiry details"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5 text-sm text-slate-700">
              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href={`mailto:${selectedInquiry.email}`}
                  className="rounded-lg border border-slate-200 p-3 font-semibold hover:bg-slate-50"
                >
                  {selectedInquiry.email}
                </a>
                {selectedInquiry.phone && (
                  <a
                    href={`tel:${selectedInquiry.phone}`}
                    className="rounded-lg border border-slate-200 p-3 font-semibold hover:bg-slate-50"
                  >
                    {selectedInquiry.phone}
                  </a>
                )}
              </div>

              {selectedInquiry.service && (
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Service
                  </p>
                  <p className="mt-1 font-semibold">{selectedInquiry.service}</p>
                </div>
              )}

              {selectedInquiry.message && (
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Message
                  </p>
                  <p className="mt-2 whitespace-pre-line leading-6">
                    {selectedInquiry.message}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleDelete(selectedInquiry._id)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <FaTrash />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
