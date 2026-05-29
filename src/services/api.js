import axios from "axios";

const API_BASE_URL = "https://pinmedia-b1.onrender.com/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Admin Auth APIs
export const adminLogin = (email, password) =>
  apiClient.post("/admin/login", { email, password });

export const adminSignup = (name, email, password) =>
  apiClient.post("/admin/signup", { name, email, password });

// Blog APIs
export const createBlog = (formData) =>
  apiClient.post("/blog/add/blog", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getBlogs = () => apiClient.get("/blog/blogs");

export const getBlogById = (id) => apiClient.get(`/blog/blog/${id}`);

export const updateBlog = (id, formData) =>
  apiClient.put(`/blog/update/blog/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteBlog = (id) => apiClient.delete(`/blog/delete/blog/${id}`);

// Project APIs
export const createProject = (formData) =>
  apiClient.post("/projects/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getProjects = () => apiClient.get("/projects/all");

export const getProjectById = (id) => apiClient.get(`/projects/${id}`);

export const updateProject = (id, formData) =>
  apiClient.put(`/projects/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteProject = (id) => apiClient.delete(`/projects/delete/${id}`);

// Inquiry APIs
export const createInquiry = (data) => apiClient.post("/inquiries/add", data);

export const getInquiries = () => apiClient.get("/inquiries/all");

export const getInquiryById = (id) => apiClient.get(`/inquiries/${id}`);

export const updateInquiry = (id, data) =>
  apiClient.put(`/inquiries/update/${id}`, data);

export const deleteInquiry = (id) => apiClient.delete(`/inquiries/delete/${id}`);

// Review APIs
export const createReview = (data) => apiClient.post("/reviews/add", data);

export const getReviews = () => apiClient.get("/reviews/all");

export const getReviewById = (id) => apiClient.get(`/reviews/${id}`);

export const updateReview = (id, data) =>
  apiClient.put(`/reviews/update/${id}`, data);

export const deleteReview = (id) => apiClient.delete(`/reviews/delete/${id}`);
