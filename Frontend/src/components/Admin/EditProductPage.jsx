import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchProductDetails,
  updateProduct,
} from "../../redux/slices/productsSlice";
import axios, { formToJSON } from "axios";

export default function EditProductPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedProduct, loading, error } = useSelector(
    (state) => state.products,
  );

  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: 0,
    countInStock: 0,
    sku: "",
    category: "",
    brand: "",
    sizes: [],
    colors: [],
    collections: "",
    material: "",
    gender: "",
    images: [],
  });

  const [uploading, setUplaoding] = useState(false); // image uploading state

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedProduct) {
      setProductData(selectedProduct);
    }
  }, [selectedProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "sizes") {
      setProductData((prevData) => ({
        ...prevData,
        sizes: value.split(",").map((size) => size.trim()),
      }));
    } else if (name === "colors") {
      setProductData((prevData) => ({
        ...prevData,
        colors: value.split(",").map((color) => color.trim()),
      }));
    } else {
      setProductData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    //Using FormData web API

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUplaoding(true);
      const { data } = await axios.post(`/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProductData((prevData) => ({
        ...prevData,
        images: [...prevData.images, { url: data.imageURL, altText: "" }],
      }));
      setUplaoding(false);
      
    } catch (error) {
      setUplaoding(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProduct({ id, productData }));
    navigate("/admin/products");
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center">Error: {error}</p>;
  return (
    <div className="max-w-5xl mx-auto p-6 shadow-md rounded-md">
      <h2 className="text-3xl font-bold mb-6">Edit Product</h2>
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="mb-6">
          <label htmlFor="name" className="block font-semibold mb-2">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={productData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label htmlFor="description" className="block font-semibold mb-2">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            value={productData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            rows={4}
            required
          />
        </div>

        {/* Price */}
        <div className="mb-6">
          <label htmlFor="price" className="block font-semibold mb-2">
            Price
          </label>
          <input
            type="number"
            name="price"
            id="price"
            value={productData.price}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Count in stock */}
        <div className="mb-6">
          <label htmlFor="countInStock" className="block font-semibold mb-2">
            Count in Stock
          </label>
          <input
            type="number"
            name="countInStock"
            id="countInStock"
            value={productData.countInStock}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* SKU */}
        <div className="mb-6">
          <label htmlFor="sku" className="block font-semibold mb-2">
            SKU
          </label>
          <input
            type="text"
            name="sku"
            id="sku"
            value={productData.sku}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Sizes */}
        <div className="mb-6">
          <label htmlFor="sizes" className="block font-semibold mb-2">
            Sizes (coma-separated)
          </label>
          <input
            type="text"
            name="sizes"
            id="sizes"
            value={productData.sizes.join(", ")}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Colors */}
        <div className="mb-6">
          <label htmlFor="colors" className="block font-semibold mb-2">
            Colors
          </label>
          <input
            type="text"
            name="colors"
            id="colors"
            value={productData.colors.join(", ")}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label htmlFor="image" className="block font-semibold mb-2">
            Upload Image
          </label>
          <input
            type="file"
            name="image"
            id="image"
            onChange={handleImageUpload}
          />
          {uploading && <p className="text-center">Uploading image</p>}
          <div className="flex gap-4 mt-4">
            {productData.images.length > 0 &&
              productData.images.map((image, index) => (
                <div key={index}>
                  <img
                    src={image.url}
                    alt={image.altText || "Product Imge"}
                    className="w-20 h-20 object-cover rounded-md shadow-md"
                  />
                </div>
              ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors"
        >
          Update Product
        </button>
      </form>
    </div>
  );
}
