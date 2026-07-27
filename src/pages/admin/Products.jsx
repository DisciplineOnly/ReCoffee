import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminTable from '../../components/admin/AdminTable';
import { useTranslation } from '../../lib/translations';
import { categoryBadgeKey } from '../../lib/categories';

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching products:', error);
        else setProducts(data || []);
        setLoading(false);
    };

    const handleDelete = async (row) => {
        if (!window.confirm(t('admin.products.confirm_delete').replace('{{name}}', row.name_bg))) return;

        const { error } = await supabase.from('products').delete().eq('id', row.id);
        if (error) {
            alert(t('admin.products.delete_error') + error.message);
        } else {
            fetchProducts();
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const columns = [
        {
            label: t('admin.products.col_product'),
            accessor: 'name_bg',
            render: (row) => {
                const badgeKey = categoryBadgeKey(row.category);
                return (
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded bg-slate-100 flex-shrink-0 overflow-hidden">
                            {row.image_url ? (
                                <img src={row.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">{t('admin.no_image')}</div>
                            )}
                        </div>
                        <div>
                            <div className="font-medium text-slate-900">{row.name_bg}</div>
                            <div className="text-slate-400 text-xs">{badgeKey ? t(badgeKey) : row.category}</div>
                        </div>
                    </div>
                );
            },
        },
        { label: t('admin.products.col_price'), padding: true, render: (row) => <span className="font-mono font-medium">{row.price.toFixed(2)} €</span> },
        {
            label: t('admin.products.col_stock'),
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {row.in_stock ? t('admin.products.in_stock') : t('admin.products.out_of_stock')}
                </span>
            )
        },
        {
            label: t('admin.products.col_roast'),
            render: (row) => (
                <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < row.roast_level ? 'bg-brand-primary' : 'bg-slate-200'}`}></div>
                    ))}
                </div>
            )
        },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 font-serif">{t('admin.products.title')}</h1>
                    <p className="text-slate-500">{t('admin.products.subtitle')}</p>
                </div>
                <Link
                    to="/admin/products/new"
                    className="inline-flex items-center justify-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-brand-primary/90 transition shadow-sm"
                >
                    <Plus size={20} />
                    <span>{t('admin.products.add')}</span>
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
                </div>
            ) : (
                <AdminTable
                    columns={columns}
                    data={products}
                    editPath="/admin/products"
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}
