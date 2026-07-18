import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    // Lazy init: available on first render and avoids overwriting saved data
    const [wishlist, setWishlist] = useState(() => {
        try {
            const saved = localStorage.getItem('recoffee_wishlist');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load wishlist from localStorage:', error);
            localStorage.removeItem('recoffee_wishlist');
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('recoffee_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const isInWishlist = (slug) => wishlist.includes(slug);

    const toggleWishlist = (slug) => {
        setWishlist(prev =>
            prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
        );
    };

    const removeFromWishlist = (slug) => {
        setWishlist(prev => prev.filter(s => s !== slug));
    };

    const value = {
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
    };

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
