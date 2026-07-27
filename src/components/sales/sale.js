import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SalesPage.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [stocks, setStocks] = useState([]);

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [editingId, setEditingId] = useState(null);

  const SALES_API = "http://localhost:3001/api/sales";
  const STOCK_API = "http://localhost:3001/api/stocks";
  const PRODUCT_API = "http://localhost:3001/api/products";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    fetchSales();
    fetchProducts();
    fetchStocks();
  };

  const fetchSales = async () => {
    try {
      const res = await axios.get(SALES_API);
      setSales(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(PRODUCT_API);
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchStocks = async () => {
    try {
      const res = await axios.get(STOCK_API);
      setStocks(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // Select Product
  const handleProductChange = (e) => {
    const product = products.find((p) => p.productName === e.target.value);

    if (product) {
      setProductName(product.productName);
      setPrice(product.price);
    }
  };

  const resetForm = () => {
    setProductName("");
    setPrice("");
    setQuantity("");

    setSaleDate(new Date().toISOString().split("T")[0]);

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productName || !price || !quantity) {
      toast.warning("Fill all fields");
      return;
    }

    try {
      const saleData = {
        productName,

        price: Number(price),

        quantity: Number(quantity),

        total: Number(price) * Number(quantity),

        date: saleDate,
      };

      // UPDATE SALE

      if (editingId) {
        await axios.put(`${SALES_API}/${editingId}`, saleData);

        toast.success("Sale updated");
      }

      // ADD SALE
      else {
        // find stock by product name

        const productStocks = stocks.filter(
          (s) => s.productName === productName,
        );

        let available = productStocks.reduce((sum, s) => sum + s.remainQ, 0);

        if (available < Number(quantity)) {
          toast.error("Not enough stock");
          return;
        }

        let reduceQty = Number(quantity);

        for (let stock of productStocks) {
          if (reduceQty <= 0) break;

          let deduct = Math.min(stock.remainQ, reduceQty);

          await axios.put(`${STOCK_API}/${stock._id}/decrease`, {
            quantity: deduct,
          });

          reduceQty -= deduct;
        }

        await axios.post(SALES_API, saleData);

        toast.success("Sale added");
      }

      fetchSales();
      fetchStocks();

      resetForm();
    } catch (err) {
      console.log(err.response?.data || err.message);

      toast.error("Sale processing error");
    }
  };

  const handleEdit = (sale) => {
    setProductName(sale.productName);

    setPrice(sale.price);

    setQuantity(sale.quantity);

    setSaleDate(sale.date ? sale.date.split("T")[0] : "");

    setEditingId(sale._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sale?")) return;

    try {
      await axios.delete(`${SALES_API}/${id}`);

      toast.success("Sale deleted and stock restored");

      fetchSales();
      fetchStocks();
    } catch (err) {
      console.log(err);

      toast.error("Delete failed");
    }
  };

  return (
    <div className="sales-container">
      <h1>Sales Management</h1>

      <form className="sales-form" onSubmit={handleSubmit}>
        <select value={productName} onChange={handleProductChange} required>
          <option value="">Select Product</option>

          {products.map((product) => (
            <option key={product._id} value={product.productName}>
              {product.productName}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />

        <input
          type="date"
          value={saleDate}
          onChange={(e) => setSaleDate(e.target.value)}
          required
        />

        <button type="submit">{editingId ? "Update" : "Add"}</button>

        {editingId && (
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      <table className="sale-table">
        <thead>
          <tr>
            <th>Date</th>

            <th>Product</th>

            <th>Price</th>

            <th>Quantity</th>

            <th>Total</th>

            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {sales.length === 0 && (
            <tr>
              <td colSpan="6">No sales found</td>
            </tr>
          )}

          {sales.map((s) => (
            <tr key={s._id}>
              <td>{s.date ? s.date.split("T")[0] : ""}</td>

              <td>{s.productName}</td>

              <td>{Number(s.price).toFixed(2)}</td>

              <td>{s.quantity}</td>

              <td>{Number(s.total).toFixed(2)}</td>

              <td>
                <button onClick={() => handleEdit(s)}>Edit</button>

                <button onClick={() => handleDelete(s._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default SalesPage;
