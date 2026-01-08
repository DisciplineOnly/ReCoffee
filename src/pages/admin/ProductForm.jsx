import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Save, ArrowLeft, X } from 'lucide-react';
import ImageUpload from '../../components/admin/ImageUpload';

export default function ProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);

    const [form, setForm] = useState({
        slug: '',
        name_bg: '',
        name_en: '',
        description_bg: '',
        description_en: '',
        price: 0,
        in_stock: true,
        featured: false,
        category: 'single-origin',
        roast_level: 3,
        origin: '',
        process: '',
        weight_grams: 250,
        image_url: '',
    });

    const [flavors, setFlavors] = useState([]); // Array of strings
    const [flavorInput, setFlavorInput] = useState('');

    useEffect(() => {
        if (isEdit) {
            async function fetchProduct() {
                // Fetch product
                const { data: prod, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    alert('Error loading product');
                    navigate('/admin/products');
                    return;
                }

                setForm(prod);

                // Fetch flavors
                const { data: flavs, error: flavError } = await supabase
                    .from('product_flavors')
                    .select('flavor_name_bg')
                    .eq('product_id', id);

                if (!flavError && flavs) {
                    setFlavors(flavs.map(f => f.flavor_name_bg));
                }

                setFetching(false);
            }
            fetchProduct();
        }
    }, [id, isEdit, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFlavorAdd = (e) => {
        if (e.key === 'Enter' && flavorInput.trim()) {
            e.preventDefault();
            if (!flavors.includes(flavorInput.trim())) {
                setFlavors([...flavors, flavorInput.trim()]);
            }
            setFlavorInput('');
        }
    };

    const removeFlavor = (idx) => {
        setFlavors(flavors.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Upsert Product
            const productData = { ...form };
            // Auto-generate slug if empty (simple logic)
            if (!productData.slug) {
                productData.slug = productData.name_en.toLowerCase().replace(/\s+/g, '-') || productData.name_bg.toLowerCase().replace(/\s+/g, '-');
            }

            let productId = id;

            if (isEdit) {
                const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', id);
                if (error) throw error;
            } else {
                const { data, error } = await supabase
                    .from('products')
                    .insert(productData)
                    .select()
                    .single();
                if (error) throw error;
                productId = data.id;
            }

            // 2. Sync Flavors (Delete all, re-insert)
            if (productId) {
                // Delete existing
                await supabase.from('product_flavors').delete().eq('product_id', productId);

                // Insert new
                if (flavors.length > 0) {
                    const flavorInserts = flavors.map(f => ({
                        product_id: productId,
                        flavor_name_bg: f,
                        flavor_name_en: f // Defaulting EN to BG for simplicity if not provided separate input
                    }));
                    const { error: flavError } = await supabase.from('product_flavors').insert(flavorInserts);
                    if (flavError) throw flavError;
                }
            }

            navigate('/admin/products');
        } catch (error) {
            console.error(error);
            alert('Error saving product: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-12 text-center">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-serif text-slate-900">
                        {isEdit ? 'Edit Product' : 'New Product'}
                    </h1>
                    <p className="text-slate-500">
                        {isEdit ? `Updating ${form.name_bg}` : 'Add a new coffee to your inventory'}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/admin/products')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition px-4 py-2"
                >
                    <ArrowLeft size={18} />
                    <span>Cancel</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Main Info */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">Basic Information</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name (BG)</label>
                            <input
                                name="name_bg"
                                value={form.name_bg}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name (EN)</label>
                            <input
                                name="name_en"
                                value={form.name_en}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL)</label>
                            <input
                                name="slug"
                                value={form.slug}
                                onChange={handleChange}
                                placeholder="Auto-generated if empty"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white"
                            >
                                <option value="single-origin">Single Origin</option>
                                <option value="blend">Blend</option>
                                <option value="decaf">Decaf</option>
                                <option value="equipment">Equipment</option>
                            </select>
                        </div>
                    </div>

                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description (BG)</label>
                            <textarea
                                name="description_bg"
                                value={form.description_bg || ''}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description (EN)</label>
                            <textarea
                                name="description_en"
                                value={form.description_en || ''}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Details & Media */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Specifics */}
                    <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">Coffee Details</h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Price (BGN)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    step="0.01"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Weight (g)</label>
                                <input
                                    type="number"
                                    name="weight_grams"
                                    value={form.weight_grams}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Origin</label>
                                <input
                                    name="origin"
                                    value={form.origin || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Process</label>
                                <input
                                    name="process"
                                    value={form.process || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Roast Level (1-5)</label>
                            <input
                                type="range"
                                name="roast_level"
                                min="1"
                                max="5"
                                value={form.roast_level}
                                onChange={handleChange}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>Light</span>
                                <span>Medium</span>
                                <span>Dark</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Flavor Notes (Press Enter to add)</label>
                            <input
                                value={flavorInput}
                                onChange={(e) => setFlavorInput(e.target.value)}
                                onKeyDown={handleFlavorAdd}
                                placeholder="Chocolate, Berries..."
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none mb-2"
                            />
                            <div className="flex flex-wrap gap-2">
                                {flavors.map((tag, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-sm">
                                        {tag}
                                        <button type="button" onClick={() => removeFlavor(idx)} className="hover:text-brand-accent"><X size={14} /></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Media & Status */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">Media</h3>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Product Image</label>
                            <ImageUpload
                                value={form.image_url}
                                onChange={(url) => setForm(prev => ({ ...prev, image_url: url }))}
                            />
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">Status</h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="in_stock"
                                        checked={form.in_stock}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-brand-primary rounded focus:ring-brand-primary"
                                    />
                                    <span className="text-slate-700">In Stock</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="featured"
                                        checked={form.featured}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-brand-primary rounded focus:ring-brand-primary"
                                    />
                                    <span className="text-slate-700">Featured</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-brand-primary text-white px-8 py-3 rounded-lg font-bold tracking-wide hover:bg-brand-primary/90 transition shadow-lg flex items-center gap-2 disabled:opacity-70"
                    >
                        <Save size={20} />
                        <span>{loading ? 'Saving...' : 'Save Product'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
