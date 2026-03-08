'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WishlistItem {
    id: number;
    title: string;
    price: number;
    regularPrice?: number;
    discountPrice?: number;
    imageUrl?: string;
    stockStatus?: string;
}

interface WishlistContextType {
    wishlist: WishlistItem[];
    addToWishlist: (product: any) => void;
    removeFromWishlist: (productId: number) => void;
    isInWishlist: (productId: number) => boolean;
    clearWishlist: () => void;
    totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const savedWishlist = localStorage.getItem('wiki_wishlist');
        if (savedWishlist) {
            try {
                setWishlist(JSON.parse(savedWishlist));
            } catch (e) {
                console.error("Failed to parse wishlist from localStorage", e);
            }
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('wiki_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const addToWishlist = (product: any) => {
        setWishlist(prev => {
            if (prev.some(item => item.id === product.id)) {
                return prev; // Already in wishlist
            }
            return [...prev, {
                id: product.id,
                title: product.title,
                price: product.discountPrice || product.regularPrice,
                regularPrice: product.regularPrice,
                discountPrice: product.discountPrice,
                imageUrl: product.imageUrl || (product.images && product.images[0]?.imageUrl),
                stockStatus: product.stockStatus
            }];
        });
    };

    const removeFromWishlist = (productId: number) => {
        setWishlist(prev => prev.filter(item => item.id !== productId));
    };

    const isInWishlist = (productId: number) => {
        return wishlist.some(item => item.id === productId);
    };

    const clearWishlist = () => setWishlist([]);

    const totalItems = wishlist.length;

    return (
        <WishlistContext.Provider value={{
            wishlist,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            clearWishlist,
            totalItems
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
