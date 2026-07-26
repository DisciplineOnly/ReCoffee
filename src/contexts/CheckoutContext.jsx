import React, { createContext, useContext, useState } from 'react';

const CheckoutContext = createContext();

export const useCheckout = () => {
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error('useCheckout must be used within CheckoutProvider');
    }
    return context;
};

export const CheckoutProvider = ({ children }) => {
    const [currentStep, setCurrentStep] = useState(1);
    // One-way latch, deliberately *not* cleared by resetCheckout(): placing an
    // order empties the cart, and Checkout's "empty cart -> /cart" guard has to
    // stand down from that moment on or it hijacks the trip to the confirmation
    // page. This provider is scoped to the /checkout route, so it unmounts on
    // the way out and a later checkout starts from false again.
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [checkoutData, setCheckoutData] = useState({
        client: {
            firstName: '',
            lastName: '',
            email: '',
            phone: ''
        },
        delivery: {
            type: 'home',
            address: {
                street: '',
                city: '',
                postalCode: '',
                notes: ''
            }
        },
        payment: {
            method: 'card',
            cardType: 'visa'
        }
    });

    const updateClientInfo = (data) => {
        setCheckoutData(prev => ({
            ...prev,
            client: { ...prev.client, ...data }
        }));
    };

    const updateDeliveryInfo = (data) => {
        setCheckoutData(prev => ({
            ...prev,
            delivery: { ...prev.delivery, ...data }
        }));
    };

    const updatePaymentInfo = (data) => {
        setCheckoutData(prev => ({
            ...prev,
            payment: { ...prev.payment, ...data }
        }));
    };

    const nextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const goToStep = (step) => {
        if (step >= 1 && step <= 4) {
            setCurrentStep(step);
        }
    };

    const markOrderPlaced = () => {
        setOrderPlaced(true);
    };

    const resetCheckout = () => {
        setCurrentStep(1);
        setCheckoutData({
            client: { firstName: '', lastName: '', email: '', phone: '' },
            delivery: {
                type: 'home',
                address: { street: '', city: '', postalCode: '', notes: '' }
            },
            payment: { method: 'card', cardType: 'visa' }
        });
    };

    const value = {
        currentStep,
        checkoutData,
        orderPlaced,
        updateClientInfo,
        updateDeliveryInfo,
        updatePaymentInfo,
        nextStep,
        prevStep,
        goToStep,
        markOrderPlaced,
        resetCheckout
    };

    return (
        <CheckoutContext.Provider value={value}>
            {children}
        </CheckoutContext.Provider>
    );
};
