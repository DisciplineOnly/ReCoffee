import React, { useState, useEffect } from 'react';
import { Menu, Search, ShoppingBag } from 'lucide-react';
import { useTranslation } from '../../lib/translations';
import logo from '../../assets/logo.jpg';

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`w-full px-6 md:px-12 fixed top-0 left-0 right-0 z-50 bg-[#F0F2F4]/90 backdrop-blur-md border-b border-transparent transition-all duration-300 ${scrolled ? 'py-4 shadow-sm' : 'pt-6 pb-4'
                }`}
        >
            <div className="max-w-[1600px] mx-auto grid grid-cols-3 items-center">

                {/* Left Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <a href="#" className="text-xs font-medium tracking-widest uppercase text-slate-600 hover:text-brand-primary transition-colors">{t('header.nav.shop')}</a>
                    <a href="#" className="text-xs font-medium tracking-widest uppercase text-slate-600 hover:text-brand-primary transition-colors">{t('header.nav.subscription')}</a>
                    <a href="#" className="text-xs font-medium tracking-widest uppercase text-slate-600 hover:text-brand-primary transition-colors">{t('header.nav.wholesale')}</a>
                </nav>

                {/* Mobile Menu Icon */}
                <div className="md:hidden">
                    <Menu className="w-6 h-6 text-slate-800" />
                </div>

                {/* Logo Center */}
                <div className="flex flex-col items-center text-center justify-center">
                    <a href="#" className="group">
                        <img src={logo} alt="ReCaffe Logo" className="h-12 md:h-16 w-auto object-contain transition-transform group-hover:scale-105" />
                    </a>
                </div>

                {/* Right Nav */}
                <nav className="flex items-center justify-end gap-6 md:gap-8">
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#" className="text-xs font-medium tracking-widest uppercase text-slate-600 hover:text-brand-primary transition-colors">{t('header.nav.locations')}</a>
                        <a href="#" className="text-xs font-medium tracking-widest uppercase text-slate-600 hover:text-brand-primary transition-colors">{t('header.nav.learn')}</a>
                        <a href="#" className="text-xs font-medium tracking-widest uppercase text-slate-600 hover:text-brand-primary transition-colors">{t('header.nav.account')}</a>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        <button className="text-slate-800 hover:text-brand-primary transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                        <a href="#" className="relative text-slate-800 hover:text-brand-primary transition-colors group">
                            <ShoppingBag className="w-5 h-5" />
                            <span className="absolute -top-1 -right-2 bg-brand-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">0</span>
                        </a>
                    </div>
                </nav>
            </div>
        </header>
    );
}
