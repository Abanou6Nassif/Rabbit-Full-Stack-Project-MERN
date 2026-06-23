import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PayPalButton from "./PayPalButton";
import { useDispatch, useSelector } from "react-redux";
import { createCheckout } from "../../redux/slices/checkoutSlice";
import axios from "axios";

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cart, loading, error } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [checkoutId, setCheckoutId] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  useEffect(() => {
    if (!cart || !cart.products || cart.products.length === 0) {
      navigate("/");
    }
  }, [cart, navigate]);

  const handleCreateCheckout = async (e) => {
    e.preventDefault();
    console.log(cart);
    
    if (cart && cart.products.length > 0) {
          console.log(cart);

      const res = await dispatch(
        createCheckout({
          checkoutItems: cart.products,
          shippingAddress,
          paymentMethod: "Paypal",
          totalPrice: cart.totalPrice,
        }),
      );

      console.log(res);
      
      if ((res.payload, res.payload._id)) {
        //Set checkout ID if checkout was successful
        setCheckoutId(res.payload._id);
      }
    }
  };

  const handlePaymentSuccess = async (details) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/pay`,
        {
          paymentStatus: "paid",
          paymentDetails: details,
        },
      );

      // if (response.status === 200) {
      await handleFinalizeCheckout(checkoutId); // Finalize the checkout if payment is successfull
      //   } else {
      //     console.error(error);
      //   }
    } catch (error) {
      console.error(error);
    }
  };

  async function handleFinalizeCheckout(checkoutId) {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/finalize`,
      );

      // if (response.status === 200) {
        navigate("/order-confirmation");
      // } else {
      //   console.error(error);
      // }
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) return <p className="text-center">Loading cart ...</p>;
  if (error) return <p className="text-center">Error: {error}</p>;
  if (!cart || !cart.products || cart.products.length === 0)
    return <p className="text-center">Your cart is empty</p>;
  return (
    <div className=" tracking-tighter grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6">
      {/* left section */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-2xl uppercase mb-6">Checkout</h2>
        <form onSubmit={handleCreateCheckout}>
          <h3 className="text-lg mb-6">Contact Details</h3>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={user ? user.email : ""}
              disabled
              className="w-full p-2 border rounded"
            />
          </div>
          <h3 className="text-lg mb-4">Delivery</h3>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstname" className="block text-gray-700">
                First Name
              </label>
              <input
                type="text"
                name="firstname"
                id="firstname"
                value={shippingAddress.firstName}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    firstName: e.target.value,
                  })
                }
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label htmlFor="lastname" className="block text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                name="lastname"
                id="lastname"
                value={shippingAddress.lastName}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    lastName: e.target.value,
                  })
                }
                required
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="address" className="block text-gray-700">
              Address
            </label>
            <input
              type="text"
              name="address"
              id="address"
              value={shippingAddress.address}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  address: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-gray-700">
                City
              </label>
              <input
                type="text"
                name="city"
                id="city"
                value={shippingAddress.city}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    city: e.target.value,
                  })
                }
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label htmlFor="postalcode" className="block text-gray-700">
                Postal Code
              </label>
              <input
                type="text"
                name="postalcode"
                id="postalcode"
                value={shippingAddress.postalCode}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    postalCode: e.target.value,
                  })
                }
                required
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="country" className="block text-gray-700">
              Country
            </label>
            <input
              type="text"
              name="country"
              id="country"
              value={shippingAddress.country}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  country: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={shippingAddress.phone}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  phone: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mt-6">
            {!checkoutId ? (
              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded"
              >
                Continue to Payment
              </button>
            ) : (
              <div>
                <h3 className="text-lg mb-4">Pay with Paypal</h3>
                {/* Paypal Component */}
                <PayPalButton
                  amount={cart.totalPrice}
                  onSuccess={handlePaymentSuccess}
                  onError={(err) =>
                    alert("payment failed. Try again.", err.message)
                  }
                />
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Right Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg mb-4">Order Summary</h3>
        <div className="border-t py-4 mb-4">
          {cart.products.map((product, index) => (
            <div
              key={index}
              className="flex items-start justify-between py-2 border-b"
            >
              <div className="flex items-start">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-24 object-cover mr-4"
                />
                <div>
                  <h3 className="text-md">{product.name}</h3>
                  <p className="text-gray-500">{product.size}</p>
                  <p className="text-gray-500">{product.color}</p>
                </div>
              </div>

              <p className="text-xl">${product.price?.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center text-lg mb-4">
          <p>Subtotal</p>
          <p>${cart.totalPrice?.toLocaleString()}</p>
        </div>

        <div className="flex justify-between items-center text-lg">
          <p>Shipping</p>
          <p>Free</p>
        </div>

        <div className="flex justify-between items-center text-lg mb-4 border-t pt-4">
          <p>Total</p>
          <p>${cart.totalPrice?.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
