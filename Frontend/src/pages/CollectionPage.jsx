import { useEffect, useRef, useState } from "react";
import { FaFilter } from "react-icons/fa";
import FilterSidebar from "../components/Products/FilterSidebar";
import SortOptions from "../components/Products/SortOptions";
import ProductGrid from "../components/Products/ProductGrid";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import { fetchProductsByFilters } from "../redux/slices/productsSlice";
function CollectionPage() {
  const { collection } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);

  // const [products, setProducts] = useState([]);
  const sidebarRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const queryParams = Object.fromEntries(searchParams);
    dispatch(fetchProductsByFilters({ collection, ...queryParams }));
  }, [dispatch, collection, searchParams]);

  console.log(searchParams);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClickOutside = (e) => {
    //Close the sidebar if clicked outside
    if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    //Add Event Listener for clicks
    document.addEventListener("mousedown", handleClickOutside);
    //clean event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // useEffect(() => {
  //   setTimeout(() => {
  //     const fetchProducts = [
  //       {
  //         _id: 4,
  //         name: "Product 4",
  //         price: 100,
  //         images: [{ url: "https://picsum.photos/500/500?random=4" }],
  //       },
  //       {
  //         _id: 5,
  //         name: "Product 5",
  //         price: 100,
  //         images: [{ url: "https://picsum.photos/500/500?random=5" }],
  //       },
  //       {
  //         _id: 6,
  //         name: "Product 6",
  //         price: 100,
  //         images: [{ url: "https://picsum.photos/500/500?random=6" }],
  //       },
  //       {
  //         _id: 7,
  //         name: "Product 7",
  //         price: 100,
  //         images: [{ url: "https://picsum.photos/500/500?random=7" }],
  //       },
  //       {
  //         _id: 8,
  //         name: "Product 8",
  //         price: 100,
  //         images: [{ url: "https://picsum.photos/500/500?random=8" }],
  //       },
  //       {
  //         _id: 9,
  //         name: "Product 9",
  //         price: 100,
  //         images: [{ url: "https://picsum.photos/500/500?random=9" }],
  //       },
  //       {
  //         _id: 10,
  //         name: "Product 10",
  //         price: 100,
  //         images: [{ url: "https://picsum.photos/500/500?random=10" }],
  //       },
  //       {
  //         _id: 11,
  //         name: "Product 11",
  //         price: 100,
  //         images: [{ url: "https://picsum.photos/500/500?random=11" }],
  //       },
  //     ];

  //     setProducts(fetchProducts);
  //   }, 1000);
  // }, []);
  return (
    <div className="flex flex-col lg:flex-row">
      {/* Mobile Filter button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden border p-2 flex justify-center items-center"
      >
        <FaFilter className="mr-2" />
      </button>

      {/* Filter Sidebar */}
      <div
        ref={sidebarRef}
        className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 z-50 left-0 w-64 bg-white overflow-y-auto transition-transform duration-300 lg:static lg:translate-x-0`}
      >
        <FilterSidebar />
      </div>

      <div className="grow p-4">
        <h2 className="text-2xl uppercase mb-4">All Collection</h2>
        {/* Sort Options */}
        <SortOptions />

        {/* Product Grid */}
        <ProductGrid products={products} loading={loading} error={error} />
      </div>
    </div>
  );
}

export default CollectionPage;
