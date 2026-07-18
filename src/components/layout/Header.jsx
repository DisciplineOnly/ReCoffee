import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Search, ShoppingBag, Heart, X } from 'lucide-react';
import { useTranslation } from '../../lib/translations';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import SearchOverlay from '../ui/SearchOverlay';
import logo from '../../assets/logo.jpg';

const navLinkClass = 'text-xs font-medium tracking-widest uppercase text-slate-600 hover:text-brand-primary transition-colors';

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [animateBadge, setAnimateBadge] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const { t } = useTranslation();
    const { getCartCount } = useCart();
    const { wishlistCount } = useWishlist();
    const location = useLocation();
    const cartCount = getCartCount();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (cartCount > 0) {
            setAnimateBadge(true);
            const timer = setTimeout(() => setAnimateBadge(false), 300);
            return () => clearTimeout(timer);
        }
    }, [cartCount]);

    // Close the mobile menu when navigating
    useEffect(() => {
        setShowMobileMenu(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.style.overflow = showMobileMenu ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [showMobileMenu]);

    const mainNav = [
        { to: '/shop', label: t('header.nav.shop') },
        { to: '/subscription', label: t('header.nav.subscription') },
        { to: '/wholesale', label: t('header.nav.wholesale') },
        { to: '/locations', label: t('header.nav.locations') },
        { to: '/learn', label: t('header.nav.learn') },
        { to: '/account', label: t('header.nav.account') },
    ];

    return (
        <>
            <header
                className={`w-full px-6 md:px-12 fixed top-0 left-0 right-0 z-50 bg-[#F0F2F4]/90 backdrop-blur-md border-b border-transparent transition-all duration-300 ${scrolled ? 'py-4 shadow-sm' : 'pt-6 pb-4'
                    }`}
            >
                <div className="max-w-[1600px] mx-auto grid grid-cols-3 items-center">

                    {/* Left Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/shop" className={navLinkClass}>{t('header.nav.shop')}</Link>
                        <Link to="/subscription" className={navLinkClass}>{t('header.nav.subscription')}</Link>
                        <Link to="/wholesale" className={navLinkClass}>{t('header.nav.wholesale')}</Link>
                    </nav>

                    {/* Mobile Menu Icon */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setShowMobileMenu(true)}
                            aria-label={t('header.nav.menu')}
                            className="text-slate-800 hover:text-brand-primary transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Logo Center */}
                    <div className="flex flex-col items-center text-center justify-center">
                        <Link to="/" className="group">
                            <img src={logo} alt="ReCaffe Logo" className="h-12 md:h-16 w-auto object-contain transition-transform group-hover:scale-105" />
                        </Link>
                    </div>

                    {/* Right Nav */}
                    <nav className="flex items-center justify-end gap-6 md:gap-8">
                        <div className="hidden md:flex items-center gap-8">
                            <Link to="/locations" className={navLinkClass}>{t('header.nav.locations')}</Link>
                            <Link to="/learn" className={navLinkClass}>{t('header.nav.learn')}</Link>
                            <Link to="/account" className={navLinkClass}>{t('header.nav.account')}</Link>
                        </div>

                        <div className="flex items-center gap-4 md:gap-6">
                            <button
                                onClick={() => setShowSearch(true)}
                                aria-label={t('search.title')}
                                className="text-slate-800 hover:text-brand-primary transition-colors"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                            <Link
                                to="/wishlist"
                                aria-label={t('header.nav.wishlist')}
                                className="relative text-slate-800 hover:text-brand-primary transition-colors group hidden sm:block"
                            >
                                <Heart className="w-5 h-5 transition-transform group-hover:scale-110" />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-1 -right-2 bg-brand-secondary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>
                            <Link to="/cart" className="relative text-slate-800 hover:text-brand-primary transition-colors group">
                                <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
                                {cartCount > 0 && (
                                    <span className={`absolute -top-1 -right-2 bg-brand-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold transition-transform ${animateBadge ? 'scale-125' : 'scale-100'}`}>
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </nav>
                </div>
            </header>

            {/* Mobile Menu Drawer */}
            {showMobileMenu && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] md:hidden animate-in fade-in duration-200" onClick={() => setShowMobileMenu(false)}>
                    <div
                        className="absolute left-0 top-0 bottom-0 w-full max-w-xs bg-white p-8 overflow-y-auto animate-in slide-in-from-left duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-10">
                            <img src={logo} alt="ReCaffe Logo" className="h-10 w-auto object-contain" />
                            <button
                                onClick={() => setShowMobileMenu(false)}
                                aria-label={t('header.nav.close')}
                                className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <nav className="flex flex-col gap-1">
                            {mainNav.map(item => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `py-3 px-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors ${isActive ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-700 hover:bg-slate-50'}`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                            <NavLink
                                to="/wishlist"
                                className={({ isActive }) =>
                                    `py-3 px-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-3 ${isActive ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-700 hover:bg-slate-50'}`
                                }
                            >
                                <Heart className="w-4 h-4" />
                                {t('header.nav.wishlist')}
                                {wishlistCount > 0 && <span className="text-xs text-slate-400">({wishlistCount})</span>}
                            </NavLink>
                        </nav>
                        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col gap-3 text-sm text-slate-500">
                            <Link to="/about" className="hover:text-brand-primary transition-colors">{t('footer.links.our_story')}</Link>
                            <Link to="/contact" className="hover:text-brand-primary transition-colors">{t('footer.links.contact')}</Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Overlay */}
            {showSearch && <SearchOverlay onClose={() => setShowSearch(false)} />}
        </>
    );
}
