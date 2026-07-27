import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StockPage.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StockPage = () => {
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);

  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const [editingId, setEditingId] = useState(null);

  const STOCK_API = "http://localhost:3001/api/stocks";
  const PRODUCT_API = "http://localhost:3001/api/products";

  useEffect(() => {
    fetchStocks();
    fetchProducts();
  }, []);

  // Get stock data
  const fetchStocks = async () => {
    try {
      const res = await axios.get(STOCK_API);
      setStocks(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load stocks!");
    }
  };

  // Get products
  const fetchProducts = async () => {
    try {
      const res = await axios.get(PRODUCT_API);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products!");
    }
  };

  const resetForm = () => {
    setProductName("");
    setQuantity("");
    setPrice("");
    setEditingId(null);
  };

  // Add / Update Stock
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productName || !quantity || !price) {
      alert("Fill all fields!");
      return;
    }

    const stockData = {
      productName,
      quantity: Number(quantity),
      price: Number(price),
    };

    try {
      if (editingId) {
        await axios.put(`${STOCK_API}/${editingId}`, stockData);

        toast.success("Stock updated successfully!");
      } else {
        await axios.post(STOCK_API, stockData);

        toast.success("Stock added successfully!");
      }

      fetchStocks();
      resetForm();
    } catch (err) {
      console.error(err.response?.data || err.message);

      toast.error("Error saving stock!");
    }
  };

  // Edit stock
  const handleEdit = (stock) => {
    setProductName(stock.productName);
    setQuantity(stock.quantity);
    setPrice(stock.price);

    setEditingId(stock._id);
  };

  // Delete stock
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Do you want to delete this item?");

    if (!confirmDelete) return;

    try {
      await axios.delete(`${STOCK_API}/${id}`);

      fetchStocks();

      toast.success("Stock deleted!");
    } catch (err) {
      console.error(err);

      toast.error("Failed to delete stock!");
    }
  };

  const getStatusColor = (q) => {
    if (q > 6) return "green";
    else if (q > 0) return "orange";
    else return "red";
  };

  const grandTotal = stocks.reduce(
    (total, s) => total + s.price * s.quantity,

    0,
  );

  return (
    <div className="stock-container">
      <h1>Stock Management</h1>

      <form className="stock-form" onSubmit={handleSubmit}>
        {/* Product Dropdown */}

        <select
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
        >
          <option value="">Select Product</option>

          {products.map((product) => (
            <option key={product._id} value={product.productName}>
              {product.productName}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <button type="submit">{editingId ? "Update" : "Add"}</button>

        {editingId && (
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      <table className="stock-table">
        <thead>
          <tr>
            <th>Status</th>

            <th>Product</th>

            <th>Price ($)</th>

            <th>Quantity</th>

            <th>Remain Q</th>

            <th>Total ($)</th>

            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {stocks.length === 0 && (
            <tr>
              <td colSpan="7">No stock found</td>
            </tr>
          )}

          {stocks.map((s) => (
            <tr key={s._id}>
              <td
                style={{
                  color: getStatusColor(s.remainQ),

                  fontWeight: "bold",
                }}
              >
                {s.remainQ > 6
                  ? "In Stock"
                  : s.remainQ > 0
                    ? "Low Stock"
                    : "Out of Stock"}
              </td>

              <td>{s.productName}</td>

              <td>{Number(s.price).toFixed(2)}</td>

              <td>{s.quantity}</td>

              <td>{s.remainQ}</td>

              <td>{(s.price * s.quantity).toFixed(2)}</td>

              <td>
                <button onClick={() => handleEdit(s)}>Edit</button>

                <button onClick={() => handleDelete(s._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>

        {stocks.length > 0 && (
          <tfoot>
            <tr>
              <td
                colSpan="5"
                style={{
                  textAlign: "right",

                  fontWeight: "bold",
                }}
              >
                Grand Total:
              </td>

              <td
                style={{
                  fontWeight: "bold",
                }}
              >
                {grandTotal.toFixed(2)}
              </td>

              <td></td>
            </tr>
          </tfoot>
        )}
      </table>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default StockPage;
