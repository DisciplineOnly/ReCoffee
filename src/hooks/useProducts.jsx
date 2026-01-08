import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
// Import local JSON just for the image mapping fallback
import localProducts from '../data/products.json';

/**
 * Hook to fetch products from Supabase
 * @returns {Object} { products, loading, error }
 */
export function useProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchProducts() {
            try {
                setLoading(true);

                // Fetch products
                const { data: productsData, error: productsError } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (productsError) throw productsError;

                // Fetch flavors for all products
                const { data: flavorsData, error: flavorsError } = await supabase
                    .from('product_flavors')
                    .select('product_id, flavor_name_bg');

                if (flavorsError) throw flavorsError;

                // Merge into frontend format
                const mergedProducts = productsData.map(product => {
                    const productFlavors = flavorsData
                        .filter(f => f.product_id === product.id)
                        .map(f => f.flavor_name_bg);

                    // Find local product to get the image URL as fallback
                    // We match by slug since that is unique and stable
                    const localMatch = localProducts.find(lp => lp.slug === product.slug);
                    const localImages = localMatch ? localMatch.images : [];

                    // Prioritize DB image, fallback to local
                    const validImages = product.image_url ? [product.image_url] : localImages;

                    return {
                        id: product.id,
                        slug: product.slug,
                        name: product.name_bg,
                        nameEn: product.name_en,
                        description: product.description_bg,
                        descriptionEn: product.description_en,
                        price: product.price,
                        currency: 'BGN', // Hardcoded for now
                        images: validImages,
                        category: product.category,
                        origin: product.origin,
                        process: product.process,
                        roastLevel: product.roast_level,
                        flavorNotes: productFlavors,
                        weight: product.weight_grams,
                        inStock: product.in_stock,
                        featured: product.featured
                    };
                });

                setProducts(mergedProducts);
            } catch (err) {
                console.error('Error fetching products from Supabase:', err);
                // Fallback to local data if DB fails completely, to avoid broken site during dev transition
                console.warn('Falling back to local JSON data.');
                setProducts(localProducts);
                setError(err);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    return { products, loading, error };
}
