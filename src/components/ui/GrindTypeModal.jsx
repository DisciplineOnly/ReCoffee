import React, { useState } from 'react';
import { X, Coffee } from 'lucide-react';
import { useTranslation } from '../../lib/translations';

export default function GrindTypeModal({ product, onSelect, onClose }) {
    const { t } = useTranslation();
    const [selectedGrind, setSelectedGrind] = useState('whole-bean');

    const grindTypes = [
        { value: 'whole-bean', label: t('product.whole_bean'), icon: '🫘' },
        { value: 'espresso', label: t('product.espresso'), icon: '☕' },
        { value: 'filter', label: t('product.filter'), icon: '🫖' },
        { value: 'french-press', label: t('product.french_press'), icon: '🫗' }
    ];

    const handleConfirm = () => {
        onSelect(selectedGrind);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative animate-fade-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Coffee className="w-6 h-6 text-brand-primary" />
                        <h3 className="text-2xl font-serif text-slate-900">{t('product.select_grind')}</h3>
                    </div>
                    <p className="text-sm text-slate-500">{product.name}</p>
                </div>

                {/* Grind Type Options */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {grindTypes.map((grind) => (
                        <button
                            key={grind.value}
                            onClick={() => setSelectedGrind(grind.value)}
                            className={`p-4 border-2 rounded-lg transition-all ${selectedGrind === grind.value
                                    ? 'border-brand-primary bg-brand-primary/5'
                                    : 'border-slate-200 hover:border-brand-primary/50'
                                }`}
                        >
                            <div className="text-3xl mb-2">{grind.icon}</div>
                            <div className="text-sm font-medium text-slate-900">{grind.label}</div>
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 border-2 border-slate-200 text-slate-900 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors"
                    >
                        {t('checkout.back')}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 py-3 px-4 bg-brand-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-900 transition-colors"
                    >
                        {t('product.add_to_cart')}
                    </button>
                </div>
            </div>
        </div>
    );
}
