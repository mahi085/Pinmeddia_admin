import { useCallback, useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaEdit,
  FaFilter,
  FaImage,
  FaPlus,
  FaProjectDiagram,
  FaSearch,
  FaSpinner,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import toast from "react-hot-toast";
import AdminLayout from "../components/AdminLayout";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../services/api";

const emptyForm = {
  title: "",
  client: "",
  description: "",
  services: "",
  completed: true,
  image: null,
};

const toServicesArray = (value) =>
  value
    .split(",")
    .map((service) => service.trim())
    .filter(Boolean);

export default function ProjectManagement({ setIsAuthenticated }) {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getProjects();
      setProjects(data.data || []);
    } catch {
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchProjects, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchProjects]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setImagePreview("");
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleChange = (event) => {
    const { name, value, files, type, checked } = event.target;

    if (name === "image") {
      const file = files?.[0] || null;
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(file ? URL.createObjectURL(file) : "");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const buildPayload = () => {
    const payload = new FormData();
    payload.append("title", formData.title.trim());
    payload.append("client", formData.client.trim());
    payload.append("description", formData.description.trim());
    payload.append("services", JSON.stringify(toServicesArray(formData.services)));
    payload.append("completed", formData.completed ? "true" : "false");

    if (formData.image) {
      payload.append("image", formData.image);
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Project title and description are required");
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload();

      if (editingId) {
        await updateProject(editingId, payload);
        toast.success("Project updated successfully");
      } else {
        await createProject(payload);
        toast.success("Project created successfully");
      }

      handleCloseModal();
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) {
      return;
    }

    try {
      await deleteProject(id);
      toast.success("Project deleted successfully");
      fetchProjects();
    } catch {
      toast.error("Failed to delete project");
    }
  };

  const handleEdit = (project) => {
    setEditingId(project._id);
    setFormData({
      title: project.title || "",
      client: project.client || "",
      description: project.description || "",
      services: Array.isArray(project.services)
        ? project.services.join(", ")
        : project.services || "",
      completed: project.completed !== false,
      image: null,
    });
    setImagePreview(project.image || "");
    setShowModal(true);
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visibleProjects = projects.filter((project) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" && project.completed) ||
      (statusFilter === "progress" && !project.completed);

    const services = Array.isArray(project.services)
      ? project.services.join(" ")
      : "";

    const matchesSearch =
      !normalizedSearch ||
      [project.title, project.client, project.description, services]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);

    return matchesStatus && matchesSearch;
  });

  const headerAction = (
    <button
      onClick={handleOpenCreate}
      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
    >
      <FaPlus />
      Add Project
    </button>
  );

  return (
    <AdminLayout
      setIsAuthenticated={setIsAuthenticated}
      title="Project Management"
      description="Create polished portfolio projects with images, services, clients, and status."
      action={headerAction}
    >
      <div className="mb-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_auto]">
        <label className="relative block">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by project, client, service, or description"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <label className="relative block min-w-48">
          <FaFilter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="progress">In progress</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
        </div>
      ) : visibleProjects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <FaProjectDiagram className="text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-slate-950">No projects found</h2>
          <p className="mt-2 text-sm text-slate-500">
            Add a new project or adjust the search and status filters.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <FaPlus />
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {visibleProjects.map((project) => (
            <article
              key={project._id}
              className="rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="grid gap-5 p-4 sm:grid-cols-[11rem_1fr]">
                <div className="aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                      <FaImage className="text-3xl" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-bold text-slate-950">
                        {project.title}
                      </h2>
                      {project.client && (
                        <p className="mt-1 text-sm font-medium text-slate-500">
                          {project.client}
                        </p>
                      )}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                        project.completed
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      <FaCheckCircle />
                      {project.completed ? "Completed" : "In progress"}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                    {project.description}
                  </p>

                  {Array.isArray(project.services) && project.services.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.services.map((service) => (
                        <span
                          key={`${project._id}-${service}`}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleEdit(project)}
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      <FaEdit />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                    >
                      <FaTrash />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

    {showModal && (
  <div className="fixed inset-0 z-250 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">

    <div className="flex h-screen items-center justify-center p-5">

      <div className="
      w-full
      max-w-6xl
      h-[88vh]
      overflow-hidden
      rounded-[28px]
      bg-[#f8fafc]
      border border-white
      shadow-2xl
      ">

        {/* Header */}

        <div className="
        px-8
        py-6
        bg-gradient-to-r
        from-emerald-50
        via-teal-50
        to-cyan-50
        border-b
        border-slate-200
        ">

          <div className="flex items-center justify-between">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 mb-3">
                Project Manager
              </div>

              <h2 className="text-3xl font-bold text-slate-800">

                {editingId
                  ? "Edit Project"
                  : "Create Project"}

              </h2>

              <p className="mt-2 text-slate-500">
                Create and manage portfolio projects
              </p>

            </div>

            <button
              type="button"
              onClick={handleCloseModal}
              className="
              h-11
              w-11
              rounded-full
              bg-white
              border
              border-slate-200
              text-slate-500
              hover:bg-slate-100
              transition
              flex
              items-center
              justify-center
              "
            >
              <FaTimes />
            </button>

          </div>

        </div>

        <form
          onSubmit={handleSubmit}
          className="
          h-[calc(88vh-110px)]
          overflow-y-auto
          px-8
          py-7
          "
        >

          <div className="grid gap-6 xl:grid-cols-[1fr_350px]">

            {/* LEFT */}

            <div className="space-y-6">

              <div className="
              rounded-[24px]
              bg-white
              p-7
              border
              border-slate-100
              shadow-md
              ">

                <h3 className="font-bold text-xl text-slate-800 mb-7">
                  Project Information
                </h3>

                <div className="space-y-6">

                  <div className="grid sm:grid-cols-2 gap-5">

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Project title
                      </label>

                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Campaign Launch"
                        className="
                        w-full
                        rounded-xl
                        bg-slate-50
                        border
                        border-slate-200
                        px-5
                        py-4
                        text-slate-700
                        placeholder:text-slate-400
                        focus:bg-white
                        focus:border-emerald-400
                        focus:ring-4
                        focus:ring-emerald-100
                        outline-none
                        transition
                        "
                      />

                    </div>

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Client
                      </label>

                      <input
                        type="text"
                        name="client"
                        value={formData.client}
                        onChange={handleChange}
                        placeholder="Business Name"
                        className="
                        w-full
                        rounded-xl
                        bg-slate-50
                        border
                        border-slate-200
                        px-5
                        py-4
                        focus:bg-white
                        focus:border-emerald-400
                        focus:ring-4
                        focus:ring-emerald-100
                        outline-none
                        "
                      />

                    </div>

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Description
                    </label>

                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={6}
                      required
                      placeholder="Describe project..."
                      className="
                      w-full
                      resize-none
                      rounded-xl
                      bg-slate-50
                      border
                      border-slate-200
                      px-5
                      py-4
                      leading-7
                      focus:bg-white
                      focus:border-emerald-400
                      focus:ring-4
                      focus:ring-emerald-100
                      outline-none
                      "
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Services
                    </label>

                    <input
                      type="text"
                      name="services"
                      value={formData.services}
                      onChange={handleChange}
                      placeholder="Branding, Marketing..."
                      className="
                      w-full
                      rounded-xl
                      bg-slate-50
                      border
                      border-slate-200
                      px-5
                      py-4
                      focus:bg-white
                      focus:border-emerald-400
                      focus:ring-4
                      focus:ring-emerald-100
                      outline-none
                      "
                    />

                    <p className="mt-2 text-xs text-slate-400">
                      Separate multiple services with commas
                    </p>

                  </div>

                  <div className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  p-5
                  flex
                  justify-between
                  items-center
                  ">

                    <div>

                      <h4 className="font-semibold text-slate-700">
                        Project Completed
                      </h4>

                      <p className="text-sm text-slate-500 mt-1">
                        Disable for in-progress work
                      </p>

                    </div>

                    <input
                      type="checkbox"
                      name="completed"
                      checked={formData.completed}
                      onChange={handleChange}
                      className="
                      h-5
                      w-5
                      rounded
                      text-emerald-600
                      focus:ring-emerald-500
                      "
                    />

                  </div>

                </div>

              </div>

            </div>


            {/* RIGHT */}

            <aside className="space-y-6">

              <div className="
              rounded-[24px]
              overflow-hidden
              bg-white
              border
              border-slate-100
              shadow-md
              ">

                <div className="
                h-[230px]
                bg-gradient-to-br
                from-emerald-50
                to-cyan-50
                flex
                items-center
                justify-center
                ">

                  {imagePreview ? (

                    <img
                      src={imagePreview}
                      alt=""
                      className="w-full h-full object-cover"
                    />

                  ) : (

                    <div className="text-center">

                      <div className="
                      h-20
                      w-20
                      rounded-full
                      bg-white
                      shadow-md
                      flex
                      items-center
                      justify-center
                      mx-auto
                      mb-4
                      ">

                        <FaImage className="text-3xl text-emerald-600"/>

                      </div>

                      <h4 className="font-semibold text-slate-700">
                        Upload Image
                      </h4>

                      <p className="text-sm text-slate-400">
                        JPG / PNG
                      </p>

                    </div>

                  )}

                </div>

                <div className="p-5">

                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Project Image
                  </label>

                  <input
                    type="file"
                    name="image"
                    onChange={handleChange}
                    accept="image/*"
                    className="
                    block
                    w-full
                    text-sm
                    file:border-0
                    file:rounded-xl
                    file:px-4
                    file:py-3
                    file:mr-4
                    file:bg-gradient-to-r
                    file:from-emerald-500
                    file:to-teal-500
                    file:text-white
                    file:font-medium
                    "
                  />

                </div>

              </div>

              <div className="
              rounded-[24px]
              bg-white
              p-6
              border
              border-slate-100
              shadow-md
              ">

                <p className="uppercase text-xs font-bold tracking-widest text-slate-400">
                  LIVE PREVIEW
                </p>

                <h3 className="mt-4 text-xl font-bold text-slate-800">
                  {formData.title || "Project Title"}
                </h3>

                <p className="mt-4 text-slate-600 leading-7 line-clamp-6">
                  {formData.description ||
                  "Project description preview"}
                </p>

              </div>

            </aside>

          </div>

          <div className="
          sticky
          bottom-0
          mt-8
          bg-white/90
          backdrop-blur-md
          border-t
          border-slate-200
          py-5
          px-2
          flex
          justify-end
          gap-4
          ">

            <button
              type="button"
              onClick={handleCloseModal}
              disabled={saving}
              className="
              px-7
              py-3
              rounded-xl
              bg-white
              border
              border-slate-200
              hover:bg-slate-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="
              px-8
              py-3
              rounded-xl
              bg-gradient-to-r
              from-emerald-500
              to-teal-500
              text-white
              font-semibold
              shadow-lg
              hover:shadow-xl
              transition-all
              "
            >
              {saving && (
                <FaSpinner className="animate-spin inline mr-2"/>
              )}

              {editingId
                ? "Update Project"
                : "Create Project"}

            </button>

          </div>

        </form>

      </div>

    </div>
  </div>
)} 
    </AdminLayout>
  );
}
