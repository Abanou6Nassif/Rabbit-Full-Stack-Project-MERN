// import { useState } from "react"
import { IoMdClose } from "react-icons/io"
import { CartContents } from "../Cart/CartContents"

export const CartDrawer = ({drawerOpen, toggleCartDrawer}) => {

  return (
    <div className={`fixed top-0 right-0 xs:w-full  sm:w-1/2 md:w-120 h-full bg-white shadow-lg transform transition-transform duration-300 flex flex-col z-50 ${drawerOpen? "translate-x-0": "translate-x-full"}`}>
        {/* close buton */}
        <div className="flex justify-end p-4">
            <button onClick={toggleCartDrawer}>
                <IoMdClose className="h-6 w-6 text-gray-600"/>
            </button>
        </div>

        {/* Cart content with scrollable area */}
        <div className="grow p-4 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Your Cart</h2>

            {/* Component for cart content */}
            <CartContents/>
        </div>

        {/* Checkout button */}
        <div className="p-4 bg-white sticky buttom-0">
            <button className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition">Checkout</button>
            <p className="text-sm tracking-tighter text-gray-500 mt-2 text-center">
                Shipping, taxes, and discount codes calculated at checkout
            </p>
        </div>

    </div>
  )
}
