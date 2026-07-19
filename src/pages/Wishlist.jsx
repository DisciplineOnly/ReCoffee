import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useTranslation } from '../lib/translations';
import { useSEO } from '../hooks/useSEO';
import { useWishlist } from '../contexts/WishlistContext';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/shop/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Wishlist() {
    const { t } = useTranslation();
    const { wishlist } = useWishlist();
    const { products, loading } = useProducts();
    useSEO({ title: t('wishlist.title') });

    const wishlistProducts = products.filter(p => wishlist.includes(p.slug));

    return (
        <div className="min-h-screen bg-[#F8F9FA] pt-12 pb-24 animate-in fade-in duration-700">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mb-4 font-bold">
                        {t('wishlist.title')}
                    </h1>
                    {wishlistProducts.length > 0 && (
                        <p className="text-slate-500 font-medium tracking-wide">
                            {t('wishlist.items_count').replace('{{count}}', wishlistProducts.length)}
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-32">
                        <LoadingSpinner size="lg" color="primary" />
                    </div>
                ) : wishlistProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
                        {wishlistProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-2xl font-serif text-slate-400 mb-2">{t('wishlist.empty')}</p>
                        <p className="text-sm text-slate-400 mb-8">{t('wishlist.empty_message')}</p>
                        <Link
                            to="/shop"
                            className="inline-block px-8 py-4 bg-brand-primary text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-slate-900 transition-all shadow-lg hover:shadow-brand-primary/20"
                        >
                            {t('wishlist.browse_products')}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
