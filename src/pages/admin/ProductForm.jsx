import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Save, ArrowLeft, X } from 'lucide-react';
import ImageUpload from '../../components/admin/ImageUpload';
import { useTranslation } from '../../lib/translations';

export default function ProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
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
        sale_price: '',
        in_stock: true,
        featured: false,
        is_new: false,
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
                    alert(t('admin.productForm.load_error'));
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
    }, [id, isEdit, navigate, t]);

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
            // Empty sale price input means "no sale"
            productData.sale_price = productData.sale_price === '' || productData.sale_price === null
                ? null
                : Number(productData.sale_price);
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
            alert(t('admin.productForm.save_error') + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-12 text-center">{t('admin.loading')}</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-serif text-slate-900">
                        {isEdit ? t('admin.productForm.title_edit') : t('admin.productForm.title_new')}
                    </h1>
                    <p className="text-slate-500">
                        {isEdit
                            ? t('admin.productForm.subtitle_edit').replace('{{name}}', form.name_bg)
                            : t('admin.productForm.subtitle_new')}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/admin/products')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition px-4 py-2"
                >
                    <ArrowLeft size={18} />
                    <span>{t('admin.cancel')}</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Main Info */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">{t('admin.productForm.section_basic')}</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('admin.productForm.name_bg')}</label>
                            <input
                                name="name_bg"
                                value={form.name_bg}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('admin.productForm.name_en')}</label>
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
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('admin.productForm.slug')}</label>
                            <input
                                name="slug"
                                value={form.slug}
                                onChange={handleChange}
                                placeholder={t('admin.productForm.slug_placeholder')}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('admin.productForm.category')}</label>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white"
                            >
                                <optgroup label={t('shop.group_coffee')}>
                                    <option value="capsules">{t('shop.badge_capsules')}</option>
                                    <option value="grains">{t('shop.badge_grains')}</option>
                                </optgroup>
                                <optgroup label={t('shop.group_machines')}>
                                    <option value="machines-personal">{t('shop.badge_machines_personal')}</option>
                                    <option value="machines-professional">{t('shop.badge_machines_professional')}</option>
                                </optgroup>
                                <optgroup label={t('admin.productForm.legacy_group')}>
                                    <option value="single-origin">{t('shop.badge_single_origin')}</option>
                                    <option value="blend">{t('shop.badge_blend')}</option>
                                    <option value="limited">{t('shop.badge_limited')}</option>
                                    <option value="decaf">{t('shop.badge_decaf')}</option>
                                </optgroup>
                            </select>
                        </div>
                    </div>

                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('admin.productForm.description_bg')}</label>
                            <textarea
                                name="description_bg"
                                value={form.description_bg || ''}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('admin.productForm.description_en')}</label>
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
                        <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">{t('admin.productForm.section_details')}</h3>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('admin.productForm.price')}</label>
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
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('admin.productForm.sale_price')}</label>
                                <input
                                    type="number"
                                    name="sale_price"
                                    value={form.sale_price ?? ''}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    placeholder={t('admin.productForm.sale_price_placeholder')}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('admin.productForm.weight')}</label>
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
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('admin.productForm.origin')}</label>
                                <input
                                    name="origin"
                                    value={form.origin || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('admin.productForm.process')}</label>
                                <input
                                    name="process"
                                    value={form.process || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">{t('admin.productForm.roast_level')}</label>
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
                                <span>{t('admin.productForm.roast_light')}</span>
                                <span>{t('admin.productForm.roast_medium')}</span>
                                <span>{t('admin.productForm.roast_dark')}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('admin.productForm.flavors')}</label>
                            <input
                                value={flavorInput}
                                onChange={(e) => setFlavorInput(e.target.value)}
                                onKeyDown={handleFlavorAdd}
                                placeholder={t('admin.productForm.flavors_placeholder')}
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
                            <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">{t('admin.productForm.section_media')}</h3>
                            <label className="block text-sm font-medium text-slate-700 mb-2">{t('admin.productForm.image')}</label>
                            <ImageUpload
                                value={form.image_url}
                                onChange={(url) => setForm(prev => ({ ...prev, image_url: url }))}
                            />
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">{t('admin.productForm.section_status')}</h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="in_stock"
                                        checked={form.in_stock}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-brand-primary rounded focus:ring-brand-primary"
                                    />
                                    <span className="text-slate-700">{t('admin.productForm.in_stock')}</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="featured"
                                        checked={form.featured}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-brand-primary rounded focus:ring-brand-primary"
                                    />
                                    <span className="text-slate-700">{t('admin.productForm.featured')}</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_new"
                                        checked={form.is_new || false}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-brand-primary rounded focus:ring-brand-primary"
                                    />
                                    <span className="text-slate-700">{t('admin.productForm.is_new')}</span>
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
                        <span>{loading ? t('admin.saving') : t('admin.productForm.save')}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
