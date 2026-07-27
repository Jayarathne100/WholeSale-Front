import React, { useState, useEffect } from "react";
import axios from "axios";
import "./category.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:3001/api/categories";

function CategoryPage() {
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(API_URL);
      setCategories(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    }
  };

  const handleSubmit = async () => {
    if (category.trim() === "") {
      toast.warning("Please enter a category");
      return;
    }

    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, { category });
        toast.success("Category updated successfully");
      } else {
        await axios.post(API_URL, { category });
        toast.success("Category added successfully");
      }

      setCategory("");
      setEditId(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const handleEdit = (item) => {
    setCategory(item.category);
    setEditId(item._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      toast.success("Category deleted");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="category-container">
      <h2>Category Management</h2>

      <div className="category-form">
        <input
          type="text"
          placeholder="Enter Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <button onClick={handleSubmit}>
          {editId ? "Update" : "Add"}
        </button>
      </div>

      <table className="category-table">
        <thead>
          <tr>
            <th>Category</th>
            <th width="180">Actions</th>
          </tr>
        </thead>

        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan="2" className="no-data">
                No Categories Found
              </td>
            </tr>
          ) : (
            categories.map((item) => (
              <tr key={item._id}>
                <td>{item.category}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default CategoryPage;