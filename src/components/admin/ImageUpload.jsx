import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ImageUpload({ value, onChange, bucket = 'products' }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const uploadImage = async (event) => {
        try {
            setUploading(true);
            setError(null);

            if (!event.target.files || event.target.files.length === 0) {
                return;
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

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
                    <img src={value} alt="Uploaded preview" className="w-full h-full object-cover" />
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
                            <p className="text-sm text-slate-500 font-medium">Click to upload</p>
                            <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG (MAX. 2MB)</p>
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
