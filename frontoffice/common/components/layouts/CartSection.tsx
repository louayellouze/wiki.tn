import React from 'react'
import Link from 'next/link'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'

const CartSection = () => {
    const { totalItems, setIsDrawerOpen } = useCart();
    const { totalItems: wishlistTotal } = useWishlist();

    return (
        <div className="flex items-center gap-2 md:gap-4">
            {/* Wishlist - Hidden on mobile, visible on lg+ */}
            <Link href="/wishlist" className="hidden lg:flex w-32 h-10 justify-center items-center gap-3 hover:bg-wiki-dark cursor-pointer rounded-lg transition-colors">
                <div className="justify-center items-center flex relative">
                    <svg width="25" height="24" viewBox="0 0 25 24" fill="none" stroke="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.4094 20.81C13.0694 20.93 12.5094 20.93 12.1694 20.81C9.26943 19.82 2.78943 15.69 2.78943 8.69001C2.78943 5.60001 5.27943 3.10001 8.34943 3.10001C10.1694 3.10001 11.7794 3.98001 12.7894 5.34001C13.7994 3.98001 15.4194 3.10001 17.2294 3.10001C20.2994 3.10001 22.7894 5.60001 22.7894 8.69001C22.7894 15.69 16.3094 19.82 13.4094 20.81Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {wishlistTotal > 0 && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-wiki rounded-full flex justify-center items-center">
                            <div className="text-white text-[10px] font-bold">{wishlistTotal}</div>
                        </div>
                    )}
                </div>
                <div className="text-white text-sm font-normal">Wishlist</div>
            </Link>

            {/* Cart - Always visible */}
            <div
                onClick={() => setIsDrawerOpen(true)}
                className="flex justify-center items-center gap-2 md:gap-3 hover:bg-wiki-dark cursor-pointer rounded-lg p-2"
            >
                <div className="justify-center items-center flex relative">
                    <svg width="20" height="20" className="md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.99995 2H3.73996C4.81996 2 5.66996 2.93 5.57996 4L4.74995 13.96C4.60995 15.59 5.89995 16.99 7.53995 16.99H18.19C19.63 16.99 20.89 15.81 21 14.38L21.5399 6.88C21.6599 5.22 20.3999 3.87 18.7299 3.87H5.81996" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16.25 22C16.9403 22 17.5 21.4404 17.5 20.75C17.5 20.0596 16.9403 19.5 16.25 19.5C15.5596 19.5 15 20.0596 15 20.75C15 21.4404 15.5596 22 16.25 22Z" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8.24995 22C8.94031 22 9.49995 21.4404 9.49995 20.75C9.49995 20.0596 8.94031 19.5 8.24995 19.5C7.5596 19.5 6.99995 20.0596 6.99995 20.75C6.99995 21.4404 7.5596 22 8.24995 22Z" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8.99995 8H21" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-wiki rounded-full flex justify-center items-center">
                        <div className="text-white text-[10px] font-bold">{totalItems}</div>
                    </div>
                </div>
                <div className="text-white text-xs md:text-sm font-normal hidden md:block">Cart</div>
            </div>
        </div>
    )
}

export default CartSection