import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";

export const NewArrivals = () => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStatrtX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(false);
  const [canScrollRight, seCanScrollRight] = useState(false);
  const [canScrollLeft, seCanScrollLeft] = useState(false);

  const [newArrivals, setNewArrivals] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;
    const fetchNewArrivals = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/new-arrivals`,
          { signal: controller.signal }, //passing abort signal
        );

        if (isMounted) {
          setNewArrivals(response.data);
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Request cancelled: ", error.message);
        } else {
          console.error(error);
        }
      }
    };

    fetchNewArrivals();

    return () => {
      isMounted = false;
      controller.abort("unmounted Component");
    };
  }, []);

  //handle mouse events
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStatrtX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };
  const handleMouseUpOrLeave = (e) => {
    setIsDragging(false);
  };

  //Scroll buttons

  const scroll = (direction) => {
    const scrollAmount = direction === "left" ? -300 : 300;

    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  //Update Scroll Buttons

  const updateScrollButton = () => {
    const container = scrollRef.current;

    if (container) {
      const leftScroll = container.scrollLeft;
      const rightScrolable =
        container.scrollWidth > leftScroll + container.clientWidth;

      seCanScrollLeft(leftScroll > 0);
      seCanScrollRight(rightScrolable);
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollButton);
      // initialize button states on mount
      updateScrollButton();

      return () => container.removeEventListener("scroll", updateScrollButton);
    }
  }, [newArrivals]);
  return (
    <section className="py-16 px-4 lg:px-0">
      <div className="container mx-auto text-center mb-10 relative">
        <h2 className="text-3xl font-bold mb-4">Explore New Arrivals</h2>
        <p className="text-lg text-gray-600 mb-15">
          Discover the latest styles straight off the runway, freshly added to
          keep your wardrobe on the cutting edge of fashion.
        </p>

        {/* Scroll Buttons */}
        <div className="absolute right-0  bottom-[-45px] flex space-x-2">
          <button
            disabled={!canScrollLeft}
            onClick={() => scroll("left")}
            className={`p-2 rounded border ${canScrollLeft ? "bg-white text-black cursor-pointer" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
          >
            <FiChevronLeft className="text-2xl" />
          </button>
          <button
            disabled={!canScrollRight}
            onClick={() => scroll("right")}
            className={`p-2 rounded border ${canScrollRight ? "bg-white text-black cursor-pointer" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
          >
            <FiChevronRight className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        ref={scrollRef}
        className={`container mx-auto overflow-x-scroll flex space-x-6 relative ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        {newArrivals.map((product) => (
          <div
            key={product._id}
            className="relative min-w-full sm:min-w-[50%] lg:min-w-[30%]"
          >
            <img
              src={product.images[0].url}
              alt={product.images[0]?.altText || product.name}
              draggable="false"
              className="w-full h-[500px] object-cover rounded-lg"
            />

            <div className="absolute bottom-0 left-0 right-0 backdrop-blur-md bg-transparent/50 text-white p-4 rounded-b-lg">
              <Link to={`/product/${product._id}`} className="block">
                <h4 className="font-medium">{product.name}</h4>
                <p className="mt-1">${product.price}</p>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
