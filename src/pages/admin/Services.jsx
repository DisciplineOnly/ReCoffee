import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminTable from '../../components/admin/AdminTable';
import { useTranslation } from '../../lib/translations';

export default function ServiceList() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    const fetchServices = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching services:', error);
        else setServices(data || []);
        setLoading(false);
    };

    const handleDelete = async (row) => {
        if (!window.confirm(t('admin.services.confirm_delete').replace('{{name}}', row.name_bg))) return;

        const { error } = await supabase.from('services').delete().eq('id', row.id);
        if (error) {
            alert(t('admin.services.delete_error') + error.message);
        } else {
            fetchServices();
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const columns = [
        {
            label: t('admin.services.col_service'),
            accessor: 'name_bg',
            render: (row) => (
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
                        <div className="text-slate-400 text-xs">
                            {row.duration_minutes
                                ? t('admin.services.duration_minutes').replace('{{count}}', row.duration_minutes)
                                : t('admin.services.duration_flexible')}
                        </div>
                    </div>
                </div>
            ),
        },
        { label: t('admin.services.col_price'), padding: true, render: (row) => <span className="font-mono font-medium">{row.price ? `${row.price.toFixed(2)} €` : t('admin.services.price_custom')}</span> },
        {
            label: t('admin.services.col_status'),
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {row.active ? t('admin.services.active') : t('admin.services.inactive')}
                </span>
            )
        },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 font-serif">{t('admin.services.title')}</h1>
                    <p className="text-slate-500">{t('admin.services.subtitle')}</p>
                </div>
                <Link
                    to="/admin/services/new"
                    className="inline-flex items-center justify-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-brand-primary/90 transition shadow-sm"
                >
                    <Plus size={20} />
                    <span>{t('admin.services.add')}</span>
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
                </div>
            ) : (
                <AdminTable
                    columns={columns}
                    data={services}
                    editPath="/admin/services"
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}
