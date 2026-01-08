import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminTable({ columns, data, onEdit, onDelete, editPath }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    {col.label}
                                </th>
                            ))}
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((row, rowIdx) => (
                            <tr key={row.id || rowIdx} className="hover:bg-slate-50/50 transition-colors">
                                {columns.map((col, colIdx) => (
                                    <td key={colIdx} className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                                        {col.render ? col.render(row) : row[col.accessor]}
                                    </td>
                                ))}
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {editPath ? (
                                            <Link
                                                to={`${editPath}/${row.id}`}
                                                className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                                            >
                                                <Pencil size={18} />
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={() => onEdit && onEdit(row)}
                                                className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => onDelete && onDelete(row)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-slate-400">
                                    No records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
