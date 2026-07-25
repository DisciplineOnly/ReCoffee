import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Save, ArrowLeft } from 'lucide-react';
import ImageUpload from '../../components/admin/ImageUpload';
import { useTranslation } from '../../lib/translations';

export default function ServiceForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const isEdit = !!id;
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);

    const [form, setForm] = useState({
        name_bg: '',
        name_en: '',
        description_bg: '',
        description_en: '',
        price: 0,
        duration_minutes: 60,
        active: true,
        image_url: '',
    });

    useEffect(() => {
        if (isEdit) {
            async function fetchService() {
                const { data, error } = await supabase
                    .from('services')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    alert(t('admin.serviceForm.load_error'));
                    navigate('/admin/services');
                    return;
                }
                setForm(data);
                setFetching(false);
            }
            fetchService();
        }
    }, [id, isEdit, navigate, t]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit) {
                const { error } = await supabase
                    .from('services')
                    .update(form)
                    .eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('services')
                    .insert(form);
                if (error) throw error;
            }
            navigate('/admin/services');
        } catch (error) {
            console.error(error);
            alert(t('admin.serviceForm.save_error') + error.message);
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
                        {isEdit ? t('admin.serviceForm.title_edit') : t('admin.serviceForm.title_new')}
                    </h1>
                    <p className="text-slate-500">
                        {isEdit
                            ? t('admin.serviceForm.subtitle_edit').replace('{{name}}', form.name_bg)
                            : t('admin.serviceForm.subtitle_new')}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/admin/services')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition px-4 py-2"
                >
                    <ArrowLeft size={18} />
                    <span>{t('admin.cancel')}</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">{t('admin.serviceForm.section_info')}</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('admin.serviceForm.name_bg')}</label>
                            <input
                                name="name_bg"
                                value={form.name_bg}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('admin.serviceForm.name_en')}</label>
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
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('admin.serviceForm.price')}</label>
                            <input
                                type="number"
                                name="price"
                                value={form.price}
                                onChange={handleChange}
                                step="0.01"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('admin.serviceForm.duration')}</label>
                            <input
                                type="number"
                                name="duration_minutes"
                                value={form.duration_minutes}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                            />
                        </div>
                    </div>

                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('admin.serviceForm.description_bg')}</label>
                            <textarea
                                name="description_bg"
                                value={form.description_bg || ''}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('admin.serviceForm.description_en')}</label>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">{t('admin.serviceForm.section_media')}</h3>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('admin.serviceForm.image')}</label>
                        <ImageUpload
                            value={form.image_url}
                            onChange={(url) => setForm(prev => ({ ...prev, image_url: url }))}
                        />
                    </div>
                    <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">{t('admin.serviceForm.section_settings')}</h3>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="active"
                                checked={form.active}
                                onChange={handleChange}
                                className="w-5 h-5 text-brand-primary rounded focus:ring-brand-primary"
                            />
                            <span className="text-slate-700">{t('admin.serviceForm.active')}</span>
                        </label>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-brand-primary text-white px-8 py-3 rounded-lg font-bold tracking-wide hover:bg-brand-primary/90 transition shadow-lg flex items-center gap-2 disabled:opacity-70"
                    >
                        <Save size={20} />
                        <span>{loading ? t('admin.saving') : t('admin.serviceForm.save')}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
