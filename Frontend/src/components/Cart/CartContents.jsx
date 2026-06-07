import { RiDeleteBin3Line } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import {
  removeFromCart,
  updateCartItemQuantity,
} from "../../redux/slices/cartSlice";

export const CartContents = ({ userId, guestId }) => {
  const { cart } = useSelector((state) => state.cart);

  const dispatch = useDispatch();

  // Handle adding or substracting to cart
  const handleAddToCart = (productId, delta, quantity, size, color) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1) {
      dispatch(
        updateCartItemQuantity({
          productId,
          quantity: newQuantity,
          userId,
          guestId,
          size,
          color,
        }),
      );
    }
  };

  const handleRemoveFromCart = (productId, size, color, quantity) => {
    dispatch(
      removeFromCart({
        productId,
        size,
        color,
        quantity,
        userId,
        guestId,
      }),
    );
  };

  return (
    <div>
      {cart.products &&
        cart.products.map((product, index) => (
          <div
            key={index}
            className="flex items-start justify-between py-4 border-b"
          >
            <div className="flex items-start">
              <img
                src={product.image}
                alt={product.name}
                className="w-20 h-24 object-center mr-4 rounded"
              />

              <div>
                <h3>{product.name}</h3>
                <p className="text-sm text-gray-500">
                  size: {product.size} | color: {product.color}
                </p>

                <div className="flex items-center mt-2">
                  <button
                    onClick={() =>
                      handleAddToCart(
                        product.productId,
                        -1,
                        product.quantity,
                        product.size,
                        product.color,
                      )
                    }
                    className="rounded border px-2 py-1 text-xl font-medium min-w-7.75"
                  >
                    -
                  </button>
                  <span className="mx-4">{product.quantity}</span>
                  <button
                    onClick={() =>
                      handleAddToCart(
                        product.productId,
                        1,
                        product.quantity,
                        product.size,
                        product.color,
                      )
                    }
                    className="rounded border px-2 py-1 text-xl font-medium min-w-7.75"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div>
              <p>$ {product.price.toLocaleString()}</p>
              <button
                onClick={() => {
                  handleRemoveFromCart(
                    product.productId,
                    product.size,
                    product.color,
                    product.quantity,
                  );
                }}
              >
                <RiDeleteBin3Line className="h-6 w-6 mt-2 text-red-600" />
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};
