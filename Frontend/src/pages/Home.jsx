import { useDispatch, useSelector } from "react-redux";
import { Hero } from "../components/Layout/Hero";
import FeaturedCollection from "../components/Products/FeaturedCollection";
import FeaturesSection from "../components/Products/FeaturesSection";
import GenderCollectionSection from "../components/Products/GenderCollectionSection";
import { NewArrivals } from "../components/Products/NewArrivals";
import ProductDetails from "../components/Products/ProductDetails";
import ProductGrid from "../components/Products/ProductGrid";
import { useEffect, useState } from "react";
import { fetchProductsByFilters } from "../redux/slices/productsSlice";
import axios from "axios";

// const placeholdeProducts = [
//   {
//     _id: 4,
//     name: "Product 4",
//     price: 100,
//     images: [{ url: "https://picsum.photos/500/500?random=4" }],
//   },
//   {
//     _id: 5,
//     name: "Product 5",
//     price: 100,
//     images: [{ url: "https://picsum.photos/500/500?random=5" }],
//   },
//   {
//     _id: 6,
//     name: "Product 6",
//     price: 100,
//     images: [{ url: "https://picsum.photos/500/500?random=6" }],
//   },
//   {
//     _id: 7,
//     name: "Product 7",
//     price: 100,
//     images: [{ url: "https://picsum.photos/500/500?random=7" }],
//   },
//   {
//     _id: 8,
//     name: "Product 8",
//     price: 100,
//     images: [{ url: "https://picsum.photos/500/500?random=8" }],
//   },
//   {
//     _id: 9,
//     name: "Product 9",
//     price: 100,
//     images: [{ url: "https://picsum.photos/500/500?random=9" }],
//   },
//   {
//     _id: 10,
//     name: "Product 10",
//     price: 100,
//     images: [{ url: "https://picsum.photos/500/500?random=10" }],
//   },
//   {
//     _id: 11,
//     name: "Product 11",
//     price: 100,
//     images: [{ url: "https://picsum.photos/500/500?random=11" }],
//   },
// ];
export const Home = () => {
  const dispatch = useDispatch();
  const { products, loadingList, errorList } = useSelector(
    (state) => state.products,
  );
  const [bestSellerProduct, setBestSellerProduct] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    //Fetch products for specific colection
    dispatch(
      fetchProductsByFilters({
        gender: "Women",
        category: "Bottom Wear",
        limit: 8,
      }),
    );

    // Fetch best seller product
    const fetchBestSeller = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/best-seller`,
          { signal: controller.signal },
        );
        if (isMounted) {
          setBestSellerProduct(response.data);
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Request cancelled: ", error.message);
        } else {
          console.error(error);
        }
      }
    };

    fetchBestSeller();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [dispatch]);
  return (
    <div>
      <Hero />
      <GenderCollectionSection />
      <NewArrivals />
      {/* Best Seller Section */}
      <h2 className="text-3xl text-center font-bold mb-4">Best Seller</h2>
      {bestSellerProduct ? (
        <ProductDetails productId={bestSellerProduct._id} />
      ) : (
        <p className="text-center">Loading best seller product</p>
      )}

      <div className="container mx-auto">
        <h2 className="text-3xl text-center font-bold mb-4">
          Top wears for Women
        </h2>

        <ProductGrid
          products={products}
          loading={loadingList}
          error={errorList}
        />
      </div>

      <FeaturedCollection />

      <FeaturesSection />
    </div>
  );
};
