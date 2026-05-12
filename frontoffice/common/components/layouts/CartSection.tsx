import React from 'react'
import Link from 'next/link'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { ShoppingBag, Heart } from 'lucide-react'

const CartSection = () => {
    const { totalItems, setIsDrawerOpen } = useCart();
    const { totalItems: wishlistTotal } = useWishlist();

    return (
        <div className="flex items-center gap-3 md:gap-4 lg:gap-5">
            {/* Wishlist - Hidden on mobile, visible on lg+ */}
            <Link 
                href="/wishlist" 
                className="hidden lg:flex items-center gap-3 hover:bg-white/5 cursor-pointer rounded-2xl px-4 py-2 transition-all duration-300 group hover:scale-105 active:scale-95"
            >
                <div className="relative">
                    <Heart size={22} className="text-white group-hover:text-rose-500 group-hover:fill-rose-500 transition-all duration-300" />
                    {wishlistTotal > 0 && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 rounded-full flex justify-center items-center border-2 border-wiki-btn animate-in zoom-in duration-300">
                            <div className="text-white text-[10px] font-black">{wishlistTotal}</div>
                        </div>
                    )}
                </div>
                <div className="text-white text-xs font-black uppercase tracking-widest hidden xl:block">Wishlist</div>
            </Link>

            {/* Cart - Always visible */}
            <div
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-3 bg-wiki/10 hover:bg-wiki cursor-pointer rounded-2xl px-4 py-2 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 border border-wiki/20"
            >
                <div className="relative">
                    <ShoppingBag size={22} className="text-wiki group-hover:text-white transition-colors" />
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-white text-wiki rounded-full flex justify-center items-center border-2 border-wiki-btn shadow-sm animate-bounce-slow">
                        <div className="text-[10px] font-black">{totalItems}</div>
                    </div>
                </div>
                <div className="text-white text-xs font-black uppercase tracking-widest hidden md:block">Panier</div>
            </div>
        </div>
    )
}

export default CartSection