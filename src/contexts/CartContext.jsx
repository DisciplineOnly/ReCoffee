import React, { createContext, useContext, useState, useEffect } from 'react';
import { siteConfig } from '../lib/siteConfig';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    // Lazy init so the cart is available on the very first render —
    // otherwise a hard refresh on /checkout redirects to /cart before load.
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('recoffee_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Failed to load cart from localStorage:', error);
            localStorage.removeItem('recoffee_cart');
            return [];
        }
    });

    // Save cart to localStorage on change
    useEffect(() => {
        localStorage.setItem('recoffee_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, quantity, grindType) => {
        setCart(prevCart => {
            const existingIndex = prevCart.findIndex(
                item => item.product.id === product.id && item.grindType === grindType
            );

            if (existingIndex > -1) {
                // Replace the entry rather than mutating it: [...prevCart] is a
                // shallow copy, so `prevCart[existingIndex].quantity += …` would
                // write straight into current state.
                return prevCart.map((item, index) =>
                    index === existingIndex
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            return [...prevCart, { product, quantity, grindType }];
        });
    };

    const removeFromCart = (productId, grindType) => {
        setCart(prevCart =>
            prevCart.filter(item =>
                !(item.product.id === productId && item.grindType === grindType)
            )
        );
    };

    const updateQuantity = (productId, grindType, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId, grindType);
            return;
        }

        setCart(prevCart =>
            prevCart.map(item =>
                item.product.id === productId && item.grindType === grindType
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    };

    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    // Single source of truth for the fee: siteConfig.delivery holds both numbers,
    // so anything showing a threshold must read them from here rather than
    // repeating the literals.
    const getDeliveryFee = () => {
        const { freeOverBgn, standardFeeBgn } = siteConfig.delivery;
        return getCartTotal() >= freeOverBgn ? 0 : standardFeeBgn;
    };

    const getGrandTotal = () => {
        return getCartTotal() + getDeliveryFee();
    };

    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        getDeliveryFee,
        getGrandTotal
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
