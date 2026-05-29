import { useCallback, useEffect, useState } from "react";
import {
  FaBlog,
  FaEdit,
  FaImage,
  FaPlus,
  FaSearch,
  FaSpinner,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import toast from "react-hot-toast";
import AdminLayout from "../components/AdminLayout";
import {
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../services/api";

const emptyForm = {
  title: "",
  summary: "",
  content: "",
  image: null,
};

export default function BlogManagement({ setIsAuthenticated }) {
  const [blogs, setBlogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getBlogs();
      setBlogs(data.data || []);
    } catch {
      toast.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchBlogs, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchBlogs]);

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
    const { name, value, files } = event.target;

    if (name === "image") {
      const file = files?.[0] || null;
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(file ? URL.createObjectURL(file) : "");
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const buildPayload = () => {
    const payload = new FormData();
    payload.append("title", formData.title.trim());
    payload.append("summary", formData.summary.trim());
    payload.append("content", formData.content.trim());

    if (formData.image) {
      payload.append("image", formData.image);
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.summary.trim() ||
      !formData.content.trim()
    ) {
      toast.error("Title, summary and content are required");
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload();

      if (editingId) {
        await updateBlog(editingId, payload);
        toast.success("Blog updated successfully");
      } else {
        await createBlog(payload);
        toast.success("Blog created successfully");
      }

      handleCloseModal();
      fetchBlogs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save blog");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blog?")) {
      return;
    }

    try {
      await deleteBlog(id);
      toast.success("Blog deleted successfully");
      fetchBlogs();
    } catch {
      toast.error("Failed to delete blog");
    }
  };

  const handleEdit = (blog) => {
    setEditingId(blog._id);
    setFormData({
      title: blog.title || "",
      summary: blog.summary || "",
      content: blog.content || "",
      image: null,
    });
    setImagePreview(blog.image_url || "");
    setShowModal(true);
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visibleBlogs = blogs.filter((blog) =>
    !normalizedSearch
      ? true
      : [blog.title, blog.summary, blog.content]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch)
  );

  const headerAction = (
    <button
      onClick={handleOpenCreate}
      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
    >
      <FaPlus />
      Add Blog
    </button>
  );

  return (
    <AdminLayout
      setIsAuthenticated={setIsAuthenticated}
      title="Blog Management"
      description="Create and maintain useful articles for the public website."
      action={headerAction}
    >
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <label className="relative block">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search blogs by title, summary, or content"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </label>
      </div>

      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        </div>
      ) : visibleBlogs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <FaBlog className="text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-slate-950">No blogs found</h2>
          <p className="mt-2 text-sm text-slate-500">
            Add a new blog or adjust the search term.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <FaPlus />
            Create Blog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {visibleBlogs.map((blog) => (
            <article
              key={blog._id}
              className="rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="grid gap-5 p-4 sm:grid-cols-[10rem_1fr]">
                <div className="aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
                  {blog.image_url ? (
                    <img
                      src={blog.image_url}
                      alt={blog.title}
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
                      <h2 className="line-clamp-2 text-xl font-bold text-slate-950">
                        {blog.title}
                      </h2>
                      {blog.createdAt && (
                        <p className="mt-1 text-sm font-medium text-slate-500">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                    {blog.summary}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                    {blog.content}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleEdit(blog)}
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      <FaEdit />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id)}
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
  <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">

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
        from-sky-50
        via-blue-50
        to-indigo-50
        border-b
        border-slate-200
        ">

          <div className="flex items-center justify-between">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 mb-3">

                <FaBlog />
                Blog Manager

              </div>

              <h2 className="text-3xl font-bold text-slate-800">

                {editingId
                  ? "Edit Blog"
                  : "Create New Blog"}

              </h2>

              <p className="mt-2 text-slate-500">

                Create and publish beautiful blog content

              </p>

            </div>

            <button
              onClick={handleCloseModal}
              type="button"
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

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="
          h-[calc(88vh-110px)]
          overflow-y-auto
          px-8
          py-7
          "
        >

          <div className="grid xl:grid-cols-[1fr_350px] gap-6">

            {/* LEFT SIDE */}

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

                  Blog Information

                </h3>

                <div className="space-y-6">

                  {/* title */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Blog Title
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="How Strong Brands Grow Online"
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
                      focus:border-blue-400
                      focus:ring-4
                      focus:ring-blue-100
                      outline-none
                      transition-all
                      "
                    />

                  </div>

                  {/* summary */}

                  <div>

                    <div className="flex justify-between mb-2">

                      <label className="text-sm font-semibold text-slate-700">
                        Summary
                      </label>

                      <span className="text-xs text-slate-400">

                        {formData.summary.length}/250

                      </span>

                    </div>

                    <textarea
                      rows={4}
                      name="summary"
                      value={formData.summary}
                      onChange={handleChange}
                      placeholder="Short description about blog..."
                      className="
                      w-full
                      resize-none
                      rounded-xl
                      bg-slate-50
                      border
                      border-slate-200
                      px-5
                      py-4
                      text-slate-700
                      focus:bg-white
                      focus:border-blue-400
                      focus:ring-4
                      focus:ring-blue-100
                      outline-none
                      transition
                      "
                    />

                  </div>

                  {/* content */}

                  <div>

                    <div className="flex justify-between mb-2">

                      <label className="text-sm font-semibold text-slate-700">
                        Blog Content
                      </label>

                      <span className="text-xs text-slate-400">

                        {formData.content.length}

                      </span>

                    </div>

                    <textarea
                      rows={12}
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      placeholder="Write your article..."
                      className="
                      w-full
                      resize-none
                      rounded-xl
                      bg-slate-50
                      border
                      border-slate-200
                      px-5
                      py-4
                      leading-8
                      text-slate-700
                      focus:bg-white
                      focus:border-blue-400
                      focus:ring-4
                      focus:ring-blue-100
                      outline-none
                      transition
                      "
                    />

                  </div>

                </div>

              </div>

            </div>


            {/* RIGHT SIDEBAR */}

            <aside className="space-y-6">

              {/* image upload */}

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
                from-blue-50
                to-indigo-50
                flex
                justify-center
                items-center
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

                        <FaImage className="text-3xl text-blue-600"/>

                      </div>

                      <h4 className="font-semibold text-slate-700">

                        Upload Cover

                      </h4>

                      <p className="text-sm text-slate-400 mt-1">

                        JPG / PNG

                      </p>

                    </div>

                  )}

                </div>

                <div className="p-5">

                  <label className="block text-sm font-semibold text-slate-700 mb-3">

                    Cover Image

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
                    text-slate-500
                    file:border-0
                    file:rounded-xl
                    file:px-4
                    file:py-3
                    file:mr-4
                    file:bg-gradient-to-r
                    file:from-blue-500
                    file:to-indigo-500
                    file:text-white
                    file:font-medium
                    cursor-pointer
                    "
                  />

                </div>

              </div>


              {/* preview */}

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

                <h3 className="mt-4 text-2xl font-bold text-slate-800 line-clamp-2">

                  {formData.title || "Blog title"}

                </h3>

                <p className="mt-4 text-slate-600 leading-7 line-clamp-6">

                  {formData.summary ||
                    "Your summary preview appears here..."}

                </p>

              </div>

            </aside>

          </div>

          {/* footer */}

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
              className="
              px-7
              py-3
              rounded-xl
              bg-white
              border
              border-slate-200
              font-medium
              hover:bg-slate-50
              hover:shadow-sm
              transition
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
              from-blue-500
              to-indigo-500
              text-white
              font-semibold
              shadow-lg
              hover:shadow-xl
              hover:-translate-y-[1px]
              transition-all
              "
            >
              {saving && (
                <FaSpinner className="inline mr-2 animate-spin" />
              )}

              {editingId
                ? "Update Blog"
                : "Publish Blog"}

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
