import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminTable from '../../components/admin/AdminTable';

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

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
        if (!window.confirm(`Are you sure you want to delete "${row.name_bg}"?`)) return;

        const { error } = await supabase.from('products').delete().eq('id', row.id);
        if (error) {
            alert('Error deleting product: ' + error.message);
        } else {
            fetchProducts();
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const columns = [
        {
            label: 'Product',
            accessor: 'name_bg',
            render: (row) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-slate-100 flex-shrink-0 overflow-hidden">
                        {row.image_url ? (
                            <img src={row.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No Img</div>
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-slate-900">{row.name_bg}</div>
                        <div className="text-slate-400 text-xs">{row.category}</div>
                    </div>
                </div>
            ),
        },
        { label: 'Price', padding: true, render: (row) => <span className="font-mono font-medium">{row.price.toFixed(2)} BGN</span> },
        {
            label: 'Stock',
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {row.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
            )
        },
        {
            label: 'Roast',
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
                    <h1 className="text-2xl font-bold text-slate-900 font-serif">Products</h1>
                    <p className="text-slate-500">Manage your coffee inventory</p>
                </div>
                <Link
                    to="/admin/products/new"
                    className="inline-flex items-center justify-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-brand-primary/90 transition shadow-sm"
                >
                    <Plus size={20} />
                    <span>Add Product</span>
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
