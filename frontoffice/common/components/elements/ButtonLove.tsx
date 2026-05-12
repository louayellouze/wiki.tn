import React from 'react'
import { useWishlist } from '../../context/WishlistContext'
import { ProductResponse } from '@/app/dtos/product'

interface ButtonLoveProps {
    product: ProductResponse
}

const ButtonLove = ({ product }: ButtonLoveProps) => {
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
    const isLoved = isInWishlist(product.id)

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (isLoved) {
            removeFromWishlist(product.id)
        } else {
            addToWishlist(product)
        }
    }

    return (
        <div
            onClick={handleToggle}
            className={`w-7 h-7 rounded-full justify-center items-center gap-1.5 flex cursor-pointer transition-all duration-300 shadow-sm ${isLoved ? 'bg-red-50 hover:bg-red-100' : 'bg-white/90 backdrop-blur-sm hover:bg-rose-50'
                }`}
        >
            <svg width="15" height="16" viewBox="0 0 15 16" fill={isLoved ? '#ef4444' : 'none'} xmlns="http://www.w3.org/2000/svg">
                <path d="M7.873 13.4797C7.66835 13.5519 7.33128 13.5519 7.12663 13.4797C5.38111 12.8838 1.48077 10.3979 1.48077 6.18459C1.48077 4.32471 2.97952 2.81995 4.82736 2.81995C5.92283 2.81995 6.89189 3.34962 7.49981 4.16821C8.10774 3.34962 9.08282 2.81995 10.1723 2.81995C12.0201 2.81995 13.5189 4.32471 13.5189 6.18459C13.5189 10.3979 9.61852 12.8838 7.873 13.4797Z" stroke={isLoved ? '#ef4444' : '#292D32'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    )
}

export default ButtonLove