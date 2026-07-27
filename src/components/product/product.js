  import React, { useEffect, useState } from "react";
  import axios from "axios";
  import "./ProductPage.css";

  const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [categoriesData, setCategoriesData] = useState([]);

    const [category, setCategory] = useState("");
    const [productName, setProductName] = useState("");
    const [price, setPrice] = useState("");

    const [editId, setEditId] = useState(null);

    const PRODUCT_API = "http://localhost:3001/api/products";
    const CATEGORY_API = "http://localhost:3001/api/categories";

    // ===============================
    // Fetch Products
    // ===============================
    const getProducts = async () => {
      try {
        const res = await axios.get(PRODUCT_API);
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    // ===============================
    // Fetch Categories
    // ===============================
    const getCategories = async () => {
      try {
        const res = await axios.get(CATEGORY_API);
        setCategoriesData(res.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    useEffect(() => {
      getProducts();
      getCategories();
    }, []);

    // ===============================
    // Add / Update Product
    // ===============================
    const handleAddOrUpdate = async (e) => {
      e.preventDefault();

      const newProduct = {
        category: category.trim(),
        productName: productName.trim(),
        price: Number(price),
      };

      try {
        if (editId) {
          await axios.put(`${PRODUCT_API}/${editId}`, newProduct);
        } else {
          await axios.post(PRODUCT_API, newProduct);
        }

        getProducts();
        clearForm();
      } catch (err) {
        console.error("Error saving product:", err);
      }
    };

    // ===============================
    // Edit Product
    // ===============================
    const handleEdit = (id) => {
      const product = products.find((item) => item._id === id);

      if (!product) return;

      setCategory(product.category);

      setProductName(product.productName);

      setPrice(product.price.toString());

      setEditId(product._id);
    };

    // ===============================
    // Delete Product
    // ===============================
    const handleDelete = async (id) => {
      try {
        await axios.delete(`${PRODUCT_API}/${id}`);

        getProducts();
      } catch (err) {
        console.error("Error deleting product:", err);
      }
    };

    // ===============================
    // Clear Form
    // ===============================
    const clearForm = () => {
      setCategory("");

      setProductName("");

      setPrice("");

      setEditId(null);
    };

    return (
      <div className="product-page">
        <h1>Product Management</h1>

        <form className="product-form" onSubmit={handleAddOrUpdate}>
          {/* Category */}

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select Category</option>

            {[...new Set(categoriesData.map((item) => item.category))].map(
              (cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ),
            )}
          </select>

          {/* Product Name */}

          <input
            type="text"
            placeholder="Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />

          {/* Price */}

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <button type="submit">{editId ? "Update" : "Add"}</button>

          {editId && (
            <button type="button" onClick={clearForm}>
              Cancel
            </button>
          )}
        </form>

        <table className="product-table">
          <thead>
            <tr>
              <th>Category</th>

              <th>Product Name</th>

              <th>Price</th>

              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    textAlign: "center",
                  }}
                >
                  No products available.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id}>
                  <td>{product.category}</td>

                  <td>{product.productName}</td>

                  <td>Rs. {product.price}</td>

                  <td>
                    <button onClick={() => handleEdit(product._id)}>Edit</button>

                    <button onClick={() => handleDelete(product._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  export default ProductPage;
