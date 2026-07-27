import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../lib/translations';

// Extension is derived from the *validated* MIME type, never from the filename
// — `accept="image/*"` is a picker hint and `file.name` is attacker-controlled.
// Kept in step with `allowed_mime_types` on the bucket, which is the actual
// enforcement; this map only decides what the stored object is called.
const EXTENSION_BY_MIME = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
};

// Mirrors `file_size_limit` on the bucket.
const MAX_BYTES = 5 * 1024 * 1024;

export default function ImageUpload({ value, onChange, bucket = 'products' }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const { t } = useTranslation();

    const uploadImage = async (event) => {
        try {
            setUploading(true);
            setError(null);

            if (!event.target.files || event.target.files.length === 0) {
                return;
            }

            const file = event.target.files[0];

            // Both checks are courtesy: they turn a server rejection into a
            // readable message. The bucket enforces the same two rules.
            const extension = EXTENSION_BY_MIME[file.type];
            if (!extension) {
                setError(t('admin.upload.error_type'));
                return;
            }
            if (file.size > MAX_BYTES) {
                setError(t('admin.upload.error_size'));
                return;
            }

            // crypto.randomUUID() rather than Math.random(): the latter is not a
            // CSPRNG, and a guessable object name in a public bucket lets
            // someone enumerate or pre-empt uploads.
            const filePath = `${crypto.randomUUID()}.${extension}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, { contentType: file.type });

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
            onChange(data.publicUrl);
        } catch (error) {
            setError(error.message);
            console.error('Error uploading image:', error);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        onChange('');
    };

    return (
        <div className="space-y-4">
            {value ? (
                <div className="relative w-full max-w-xs aspect-square rounded-lg overflow-hidden border border-slate-200">
                    <img src={value} alt={t('admin.upload.preview_alt')} className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 text-slate-600 hover:text-red-500 rounded-full shadow-sm transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div className="w-full max-w-xs">
                    <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {uploading ? (
                                <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-2" />
                            ) : (
                                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                            )}
                            <p className="text-sm text-slate-500 font-medium">{t('admin.upload.click_to_upload')}</p>
                            <p className="text-xs text-slate-400 mt-1">{t('admin.upload.hint')}</p>
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={uploadImage}
                            disabled={uploading}
                        />
                    </label>
                </div>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
