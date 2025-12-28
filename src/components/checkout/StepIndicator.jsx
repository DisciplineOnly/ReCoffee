import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from '../../lib/translations';

export default function StepIndicator({ currentStep, steps }) {
    const { t } = useTranslation();

    return (
        <div className="mb-12">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted = stepNumber < currentStep;

                    return (
                        <React.Fragment key={stepNumber}>
                            {/* Step Circle */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${isCompleted
                                            ? 'bg-green-600 text-white'
                                            : isActive
                                                ? 'bg-brand-primary text-white'
                                                : 'bg-slate-200 text-slate-400'
                                        }`}
                                >
                                    {isCompleted ? <Check className="w-6 h-6" /> : stepNumber}
                                </div>
                                <span
                                    className={`mt-2 text-xs font-medium hidden md:block ${isActive ? 'text-brand-primary' : 'text-slate-500'
                                        }`}
                                >
                                    {step.title}
                                </span>
                            </div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="flex-1 h-1 mx-2">
                                    <div
                                        className={`h-full transition-all ${stepNumber < currentStep ? 'bg-green-600' : 'bg-slate-200'
                                            }`}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Mobile Step Text */}
            <div className="mt-4 text-center md:hidden">
                <p className="text-sm text-slate-600">
                    {t('checkout.step')
                        .replace('{{current}}', currentStep)
                        .replace('{{total}}', steps.length)}
                </p>
                <p className="text-sm font-medium text-brand-primary">
                    {steps[currentStep - 1].title}
                </p>
            </div>
        </div>
    );
}
