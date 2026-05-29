import { useCallback, useEffect, useState } from "react";
import {
  FaEdit,
  FaPlus,
  FaSpinner,
  FaStar,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import toast from "react-hot-toast";
import AdminLayout from "../components/AdminLayout";
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../services/api";

const emptyForm = {
  clientName: "",
  company: "",
  review: "",
  rating: 5,
};

export default function ReviewManagement({ setIsAuthenticated }) {
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getReviews();
      setReviews(data.data || []);
    } catch {
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchReviews, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchReviews]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
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
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      if (editingId) {
        await updateReview(editingId, formData);
        toast.success("Review updated successfully");
      } else {
        await createReview(formData);
        toast.success("Review created successfully");
      }

      handleCloseModal();
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save review");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) {
      return;
    }

    try {
      await deleteReview(id);
      toast.success("Review deleted successfully");
      fetchReviews();
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const handleEdit = (review) => {
    setEditingId(review._id);
    setFormData({
      clientName: review.clientName || "",
      company: review.company || "",
      review: review.review || "",
      rating: review.rating || 5,
    });
    setShowModal(true);
  };

  const renderStars = (rating) => (
    <div className="flex gap-1">
      {[...Array(5)].map((_, index) => (
        <FaStar
          key={index}
          className={index < rating ? "text-amber-400" : "text-slate-200"}
        />
      ))}
    </div>
  );

  const headerAction = (
    <button
      onClick={handleOpenCreate}
      className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
    >
      <FaPlus />
      Add Review
    </button>
  );

  return (
    <AdminLayout
      setIsAuthenticated={setIsAuthenticated}
      title="Review Management"
      description="Create and maintain client testimonials for the website."
      action={headerAction}
    >
      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-rose-100 border-t-rose-600" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <FaStar className="text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-slate-950">No reviews yet</h2>
          <p className="mt-2 text-sm text-slate-500">
            Add the first review to show client feedback on the website.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
          >
            <FaPlus />
            Create Review
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {reviews.map((review) => (
            <article
              key={review._id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-slate-950">
                    {review.clientName}
                  </h2>
                  {review.company && (
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {review.company}
                    </p>
                  )}
                  <div className="mt-3">{renderStars(review.rating)}</div>
                  <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-600">
                    {review.review}
                  </p>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    onClick={() => handleEdit(review)}
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    <FaEdit />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    <FaTrash />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

 {showModal && (
<div className="
fixed
inset-0
z-[9999]
bg-black/40
backdrop-blur-sm
p-4
overflow-hidden
">

<div className="
h-full
flex
items-center
justify-center
">

<div className="
w-full
max-w-3xl
h-[90vh]
bg-[#f8fafc]
rounded-[28px]
shadow-2xl
border
border-white
overflow-hidden
flex
flex-col
">

{/* HEADER */}

<div className="
shrink-0
px-8
py-6
bg-gradient-to-r
from-rose-50
via-pink-50
to-orange-50
border-b
border-slate-200
">

<div className="flex items-center justify-between">

<div>

<div className="
inline-flex
rounded-full
bg-rose-100
px-3
py-1
text-sm
font-medium
text-rose-700
mb-3
">

Client Reviews

</div>

<h2 className="text-3xl font-bold text-slate-800">

{editingId
? "Edit Review"
: "Add Review"}

</h2>

<p className="mt-2 text-slate-500">
Manage testimonials and feedback
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
flex
items-center
justify-center
text-slate-500
hover:bg-slate-100
"
>
<FaTimes/>
</button>

</div>

</div>


{/* BODY */}

<form
onSubmit={handleSubmit}
className="
flex-1
overflow-y-auto
px-8
py-7
min-h-0
"
>

<div className="
rounded-[24px]
bg-white
border
border-slate-100
shadow-sm
p-6
space-y-6
">

<div className="grid sm:grid-cols-2 gap-5">

<div>

<label className="block mb-2 text-sm font-semibold text-slate-700">
Client Name
</label>

<input
type="text"
name="clientName"
value={formData.clientName}
onChange={handleChange}
required
className="
w-full
rounded-xl
bg-slate-50
border
border-slate-200
px-4
py-3
outline-none
transition
focus:bg-white
focus:border-rose-400
focus:ring-4
focus:ring-rose-100
"
/>

</div>


<div>

<label className="block mb-2 text-sm font-semibold text-slate-700">
Company
</label>

<input
type="text"
name="company"
value={formData.company}
onChange={handleChange}
className="
w-full
rounded-xl
bg-slate-50
border
border-slate-200
px-4
py-3
outline-none
focus:bg-white
focus:border-rose-400
focus:ring-4
focus:ring-rose-100
"
/>

</div>

</div>


<div>

<label className="block mb-2 text-sm font-semibold text-slate-700">
Review
</label>

<textarea
name="review"
rows={6}
value={formData.review}
onChange={handleChange}
required
className="
w-full
resize-none
rounded-xl
bg-slate-50
border
border-slate-200
px-4
py-4
leading-7
outline-none
focus:bg-white
focus:border-rose-400
focus:ring-4
focus:ring-rose-100
"
/>

</div>


<div>

<label className="block mb-2 text-sm font-semibold text-slate-700">
Rating
</label>

<select
name="rating"
value={formData.rating}
onChange={handleChange}
className="
w-full
rounded-xl
bg-slate-50
border
border-slate-200
px-4
py-3
outline-none
focus:bg-white
focus:border-rose-400
focus:ring-4
focus:ring-rose-100
"
>

<option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
<option value="4">⭐⭐⭐⭐ 4 Stars</option>
<option value="3">⭐⭐⭐ 3 Stars</option>
<option value="2">⭐⭐ 2 Stars</option>
<option value="1">⭐ 1 Star</option>

</select>

</div>

</div>

</form>


{/* FOOTER */}

<div className="
shrink-0
px-8
py-5
bg-white
border-t
border-slate-200
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
border
border-slate-200
bg-white
hover:bg-slate-50
"
>
Cancel
</button>

<button
type="submit"
onClick={handleSubmit}
disabled={saving}
className="
px-8
py-3
rounded-xl
bg-gradient-to-r
from-rose-500
to-pink-500
text-white
font-semibold
shadow-lg
hover:shadow-xl
"
>

{saving &&
<FaSpinner className="animate-spin inline mr-2"/>
}

{editingId
? "Update Review"
: "Create Review"}

</button>

</div>

</div>
</div>
</div>
)}
    </AdminLayout>
  );
}
