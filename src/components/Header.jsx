import React, { useState, useEffect } from 'react';
import { Menu, Search, ShoppingBag } from 'lucide-react';

export default function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`w-full px-6 md:px-12 fixed top-0 left-0 right-0 z-50 bg-[#F0F2F4]/90 backdrop-blur-md border-b border-transparent transition-all duration-300 ${scrolled ? 'py-4 shadow-sm' : 'pt-8 pb-4'
                }`}
        >
            <div className="max-w-[1600px] mx-auto grid grid-cols-3 items-start">

                {/* Left Nav */}
                <nav className="hidden md:flex items-center gap-8 pt-2">
                    <a href="#" className="text-xs font-medium tracking-widest uppercase text-slate-600 hover:text-black transition-colors">Shop</a>
                    <a href="#" className="text-xs font-medium tracking-widest uppercase text-slate-600 hover:text-black transition-colors">Subscription</a>
                    <a href="#" className="text-xs font-medium tracking-widest uppercase text-slate-600 hover:text-black transition-colors">Wholesale</a>
                </nav>

                {/* Mobile Menu Icon */}
                <div className="md:hidden pt-2">
                    <Menu className="w-6 h-6 text-slate-800" />
                </div>

                {/* Logo Center */}
                <div className="flex flex-col items-center text-center justify-center">
                    <a href="#" className="group">
                        <h1 className="font-serif text-2xl md:text-3xl tracking-[0.2em] text-slate-900 font-medium group-hover:opacity-80 transition-opacity">
                            CEREMONY
                        </h1>
                        <span className="block text-[0.65rem] tracking-[0.25em] text-slate-500 mt-1 uppercase font-medium">
                            Coffee Roasters
                        </span>
                    </a>
                </div>

                {/* Right Nav */}
                <nav className="flex items-center justify-end gap-6 md:gap-8 pt-2">
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#" className="text-xs font-medium tracking-widest uppercase text-slate-600 hover:text-black transition-colors">Locations</a>
                        <a href="#" className="text-xs font-medium tracking-widest uppercase text-slate-600 hover:text-black transition-colors">Learn</a>
                        <a href="#" className="text-xs font-medium tracking-widest uppercase text-slate-600 hover:text-black transition-colors">Account</a>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        <button className="text-slate-800 hover:text-black transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                        <a href="#" className="relative text-slate-800 hover:text-black transition-colors group">
                            <ShoppingBag className="w-5 h-5" />
                            <span className="absolute -top-1 -right-2 bg-orange-900 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">0</span>
                        </a>
                    </div>
                </nav>
            </div>
        </header>
    );
}
