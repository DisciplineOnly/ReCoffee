import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Search, ShoppingBag, Heart, User, Phone, X } from 'lucide-react';
import { useTranslation } from '../../lib/translations';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import SearchOverlay from '../ui/SearchOverlay';
import { siteConfig } from '../../lib/siteConfig';
import { formatEur } from '../../lib/price';
import logo from '../../assets/logo.jpg';

const topLinkClass = 'text-xs font-medium tracking-wide text-slate-500 hover:text-brand-primary transition-colors';
const categoryLinkClass = 'text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-brand-primary transition-colors whitespace-nowrap flex-shrink-0';

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
        { to: '/learn', label: t('header.nav.learn') },
        { to: '/account', label: t('header.nav.account') },
    ];

    const categoryNav = [
        { to: '/shop?category=coffee', label: t('shop.group_coffee') },
        { to: '/shop?category=capsules', label: t('shop.badge_capsules') },
        { to: '/shop?category=grains', label: t('shop.badge_grains') },
        { to: '/shop?category=machines-personal', label: t('shop.badge_machines_personal') },
        { to: '/shop?category=machines-professional', label: t('shop.badge_machines_professional') },
    ];

    return (
        <>
            <header className="sticky top-0 left-0 right-0 z-50 w-full bg-[#F0F2F4]/95 backdrop-blur-md border-b border-slate-200/60 transition-shadow duration-300">

                {/* Top utility bar */}
                <div
                    className={`hidden md:block overflow-hidden border-b border-slate-200/60 transition-[max-height,opacity] duration-300 ${scrolled ? 'max-h-0 opacity-0 border-transparent' : 'max-h-12 opacity-100'
                        }`}
                >
                    <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 md:gap-12">
                        <div className="md:col-start-2 md:col-span-11 py-2 flex items-center justify-between gap-6">
                            <a href={siteConfig.phoneHref} className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-brand-primary transition-colors flex-shrink-0">
                                <Phone className="w-3.5 h-3.5" />
                                {siteConfig.phone}
                            </a>
                            <p className="text-xs font-medium tracking-wide text-slate-500 text-center flex-1">
                                {/* Derived, never typed: this once read "над 50€" while the
                                    threshold charged at 100 лв — 51.13 €. */}
                                {t('header.topbar.free_shipping')
                                    .replace('{{amount}}', formatEur(siteConfig.delivery.freeOverEur))}
                            </p>
                            <nav className="flex items-center gap-6 flex-shrink-0">
                                <Link to="/faq" className={topLinkClass}>{t('header.topbar.faq')}</Link>
                                <Link to="/delivery" className={topLinkClass}>{t('header.topbar.delivery')}</Link>
                                <Link to="/contact" className={topLinkClass}>{t('header.topbar.contacts')}</Link>
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Main row: logo, search, icons */}
                <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 md:gap-12">
                    <div className="md:col-start-2 md:col-span-11 py-4 flex items-center justify-between gap-4 md:gap-8">
                        <div className="flex items-center gap-4 flex-shrink-0">
                            {/* Mobile Menu Icon */}
                            <button
                                onClick={() => setShowMobileMenu(true)}
                                aria-label={t('header.nav.menu')}
                                className="md:hidden text-slate-800 hover:text-brand-primary transition-colors"
                            >
                                <Menu className="w-6 h-6" />
                            </button>

                            <Link to="/" className="group flex-shrink-0">
                                <img src={logo} alt="ReCaffe Logo" className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" />
                            </Link>
                        </div>

                        {/* Search bar */}
                        <button
                            onClick={() => setShowSearch(true)}
                            className="hidden md:flex flex-1 max-w-2xl items-center gap-3 bg-white border border-slate-200 rounded-full px-5 py-3 text-left hover:border-brand-primary/40 transition-colors"
                        >
                            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span className="text-sm text-slate-400 truncate">{t('search.placeholder')}</span>
                        </button>

                        {/* Icons */}
                        <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
                            <button
                                onClick={() => setShowSearch(true)}
                                aria-label={t('search.title')}
                                className="md:hidden text-slate-800 hover:text-brand-primary transition-colors"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                            <Link
                                to="/account"
                                aria-label={t('header.nav.account')}
                                className="text-slate-800 hover:text-brand-primary transition-colors group hidden sm:block"
                            >
                                <User className="w-5 h-5 transition-transform group-hover:scale-110" />
                            </Link>
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
                            <Link to="/cart" aria-label={t('header.nav.cart')} className="relative text-slate-800 hover:text-brand-primary transition-colors group">
                                <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
                                {cartCount > 0 && (
                                    <span className={`absolute -top-1 -right-2 bg-brand-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold transition-transform ${animateBadge ? 'scale-125' : 'scale-100'}`}>
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Category bar */}
                <div className="border-t border-slate-200/60">
                    <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 md:gap-12">
                        <div className="md:col-start-2 md:col-span-11 py-3 flex items-center gap-6 md:gap-10 overflow-x-auto no-scrollbar">
                            {categoryNav.map(item => (
                                <Link key={item.label} to={item.to} className={categoryLinkClass}>
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
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

                        {/* Category quick links */}
                        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-2">
                            {categoryNav.map(item => (
                                <Link
                                    key={item.label}
                                    to={item.to}
                                    className="px-3 py-2 rounded-lg bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-brand-primary/10 hover:text-brand-primary transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3 text-sm text-slate-500">
                            <a href={siteConfig.phoneHref} className="flex items-center gap-2 hover:text-brand-primary transition-colors">
                                <Phone className="w-4 h-4" />
                                {siteConfig.phone}
                            </a>
                            <Link to="/faq" className="hover:text-brand-primary transition-colors">{t('header.topbar.faq')}</Link>
                            <Link to="/delivery" className="hover:text-brand-primary transition-colors">{t('header.topbar.delivery')}</Link>
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
