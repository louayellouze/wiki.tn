'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { CartDrawer } from './layouts/CartDrawer';

export default function Providers({ children }: { children: React.ReactNode }) {
    // Use environment variable or a placeholder
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <WishlistProvider>
                <CartProvider>
                    {children}
                    <CartDrawer />
                </CartProvider>
            </WishlistProvider>
        </GoogleOAuthProvider>
    );
}
