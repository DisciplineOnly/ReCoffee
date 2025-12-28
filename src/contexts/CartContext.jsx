import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('recoffee_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (error) {
                console.error('Failed to load cart from localStorage:', error);
                localStorage.removeItem('recoffee_cart');
            }
        }
    }, []);

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
                const newCart = [...prevCart];
                newCart[existingIndex].quantity += quantity;
                return newCart;
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

    const getDeliveryFee = () => {
        const total = getCartTotal();
        return total >= 100 ? 0 : 5;
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
