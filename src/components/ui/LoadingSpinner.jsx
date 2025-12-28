import React from 'react';

export default function LoadingSpinner({ size = 'sm', color = 'white' }) {
    const sizeClasses = {
        xs: 'w-3 h-3',
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    const colorClasses = {
        white: 'border-white/30 border-t-white',
        primary: 'border-brand-primary/30 border-t-brand-primary',
        secondary: 'border-brand-secondary/30 border-t-brand-secondary',
        slate: 'border-slate-200 border-t-slate-600'
    };

    return (
        <div
            className={`${sizeClasses[size]} border-2 ${colorClasses[color]} rounded-full animate-spin`}
            role="status"
            aria-label="loading"
        />
    );
}
