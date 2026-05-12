'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/common/utils/api'
import { categoryService } from '@/common/services/categoryService'
import { formatPrice } from '@/common/utils/format'

interface SpecKey {
    id: number;
    name: string;
}

interface SideSpecFilterProps {
    selectedSpecs: Record<string, string[]>;
    onSpecChange: (keyName: string, value: string, checked: boolean) => void;
    onReset: () => void;
    priceRange: [number, number];
    onPriceChange: (range: [number, number]) => void;
    minPrice: number;
    maxPrice: number;
    categoryId?: string | null;
    searchQuery?: string | null;
}

const SHOW_LIMIT = 5;

const SideSpecFilter: React.FC<SideSpecFilterProps> = ({
    selectedSpecs,
    onSpecChange,
    onReset,
    priceRange,
    onPriceChange,
    minPrice,
    maxPrice,
    categoryId,
    searchQuery,
}) => {
    const [specKeys, setSpecKeys] = useState<SpecKey[]>([]);
    const [specValues, setSpecValues] = useState<Record<string, string[]>>({});
    const [categories, setCategories] = useState<any[]>([]);
    const [currentCategory, setCurrentCategory] = useState<any>(null);
    const [showMore, setShowMore] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                if (categoryId) {
                    const isId = !isNaN(Number(categoryId));
                    const data = isId 
                        ? await categoryService.getCategoryById(categoryId)
                        : await categoryService.getCategoryBySlug(categoryId);
                    setCurrentCategory(data);
                    setCategories(data.subCategories || []);
                } else {
                    const data = await categoryService.getCategoryTree();
                    setCategories(data);
                    setCurrentCategory(null);
                }
            } catch (error) {
                console.error('Failed to fetch categories', error);
            }
        };
        fetchCategories();
    }, [categoryId]);

    useEffect(() => {
        const fetchSpecFilters = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (categoryId) {
                    const isId = !isNaN(Number(categoryId));
                    if (isId) {
                        params.append('categoryId', categoryId);
                    } else {
                        params.append('categorySlug', categoryId);
                    }
                }
                if (searchQuery) params.append('q', searchQuery);

                const res = await api.get<any[]>(`/v1/spec-keys/filters?${params.toString()}`);

                const keys: SpecKey[] = [];
                const valuesMap: Record<string, string[]> = {};

                if (Array.isArray(res.data)) {
                    res.data.forEach(item => {
                        keys.push({ id: item.id, name: item.name });
                        if (item.values && Array.isArray(item.values) && item.values.length > 0) {
                            valuesMap[item.name] = item.values;
                        }
                    });
                }

                setSpecKeys(keys);
                setSpecValues(valuesMap);
            } catch (error) {
                console.error('Failed to fetch spec filters', error);
                setSpecKeys([]);
                setSpecValues({});
            } finally {
                setLoading(false);
            }
        };

        fetchSpecFilters();
    }, [categoryId, searchQuery]);

    const hasActiveFilters = Object.values(selectedSpecs).some(v => v.length > 0);
    const keysWithValues = specKeys.filter(k => specValues[k.name]?.length > 0);

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Math.min(Number(e.target.value), priceRange[1] - 1);
        onPriceChange([val, priceRange[1]]);
    };
    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Math.max(Number(e.target.value), priceRange[0] + 1);
        onPriceChange([priceRange[0], val]);
    };

    const minPercent = maxPrice > minPrice ? ((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100 : 0;
    const maxPercent = maxPrice > minPrice ? ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100 : 100;

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button className="w-full bg-wiki-btn hover:bg-wiki-dark text-white font-semibold text-sm py-2.5 rounded transition-colors flex items-center justify-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
                    </svg>
                    Filtrer
                </button>
            </div>

            {/* Category Navigation */}
            <div className="mb-6">
                <div className="font-semibold text-sm text-slate-800 mb-3 flex items-center justify-between">
                    Catégories
                    {currentCategory?.parentId && (
                        <Link
                            href={`/${currentCategory.parentSlug || currentCategory.parentId}`}
                            className="text-[10px] text-wiki-btn hover:underline"
                        >
                            ← Retour
                        </Link>
                    )}
                </div>

                {currentCategory && (
                    <div className="mb-3 p-2 bg-wiki-light/10 rounded-lg border border-wiki-light/20">
                        <span className="text-xs font-bold text-wiki-dark truncate block">
                            {currentCategory.name}
                        </span>
                    </div>
                )}

                <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pr-1">
                    {categories.length > 0 ? (
                        categories.map(cat => (
                            <Link
                                key={cat.id}
                                href={`/${cat.slug || cat.id}`}
                                className={`block py-1.5 px-3 rounded-lg text-sm transition-all ${categoryId === (cat.slug || cat.id.toString())
                                    ? 'bg-wiki text-white font-bold'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-wiki'
                                    }`}
                            >
                                {cat.name}
                            </Link>
                        ))
                    ) : (
                        <div className="text-[10px] text-slate-400 italic px-3">
                            Dernier niveau de catégorie
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t border-slate-100 mb-6" />

            {/* Price Range */}
            <div className="mb-6">
                <div className="font-semibold text-sm text-slate-800 mb-3">Prix</div>
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                </div>
                <div className="relative h-5 flex items-center">
                    {/* Track */}
                    <div className="absolute w-full h-1 bg-slate-200 rounded-full" />
                    {/* Active track */}
                    <div
                        className="absolute h-1 bg-wiki-btn rounded-full"
                        style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
                    />
                    {/* Min thumb */}
                    <input
                        type="range" min={minPrice} max={maxPrice} value={priceRange[0]}
                        onChange={handleMinChange}
                        className="absolute w-full h-1 appearance-none bg-transparent cursor-pointer range-thumb-wiki"
                        style={{ zIndex: priceRange[0] > maxPrice - 100 ? 5 : 3 }}
                    />
                    {/* Max thumb */}
                    <input
                        type="range" min={minPrice} max={maxPrice} value={priceRange[1]}
                        onChange={handleMaxChange}
                        className="absolute w-full h-1 appearance-none bg-transparent cursor-pointer range-thumb-wiki"
                        style={{ zIndex: 4 }}
                    />
                </div>
            </div>

            <div className="border-t border-slate-100 mb-4" />

            {/* Spec Key Groups */}
            {loading ? (
                <div className="flex flex-col gap-4 py-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="space-y-2 animate-pulse">
                            <div className="h-4 bg-slate-100 rounded w-2/3" />
                            <div className="space-y-1">
                                <div className="h-3 bg-slate-50 rounded w-full" />
                                <div className="h-3 bg-slate-50 rounded w-5/6" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : keysWithValues.length > 0 ? (
                keysWithValues.map((key) => {
                    const values = specValues[key.name] || [];
                    const isExpanded = showMore[key.name];
                    const displayed = isExpanded ? values : values.slice(0, SHOW_LIMIT);
                    const activeCount = selectedSpecs[key.name]?.length || 0;

                    return (
                        <div key={key.id} className="mb-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-sm text-slate-800">
                                    {key.name}
                                    {activeCount > 0 && (
                                        <span className="ml-2 text-xs text-wiki-btn font-bold">({activeCount})</span>
                                    )}
                                </span>
                                {activeCount > 0 && (
                                    <button
                                        onClick={() => {
                                            selectedSpecs[key.name]?.forEach(v => onSpecChange(key.name, v, false));
                                        }}
                                        className="text-xs text-slate-400 hover:text-rose-500 transition-colors"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                {displayed.map((val) => {
                                    const isChecked = selectedSpecs[key.name]?.includes(val) || false;
                                    const checkId = `spec-${key.id}-${val}`;
                                    return (
                                        <div key={val} className="flex items-center justify-between">
                                            <label htmlFor={checkId} className="flex items-center gap-2 cursor-pointer group flex-1">
                                                <input
                                                    id={checkId}
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => onSpecChange(key.name, val, e.target.checked)}
                                                    className="h-4 w-4 rounded border-slate-300 accent-wiki-btn cursor-pointer"
                                                />
                                                <span className={`text-sm transition-colors ${isChecked ? 'text-slate-900 font-medium' : 'text-slate-600 group-hover:text-slate-800'}`}>
                                                    {val}
                                                </span>
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>

                            {values.length > SHOW_LIMIT && (
                                <button
                                    onClick={() => setShowMore(prev => ({ ...prev, [key.name]: !prev[key.name] }))}
                                    className="mt-2 text-xs text-wiki-btn hover:text-wiki-dark font-medium flex items-center gap-1 transition-colors"
                                >
                                    <svg
                                        width="12" height="12" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2.5"
                                        className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                    {isExpanded ? 'Voir Moins' : `Voir Plus (${values.length - SHOW_LIMIT})`}
                                </button>
                            )}

                            <div className="border-t border-slate-100 mt-4" />
                        </div>
                    );
                })
            ) : (
                <div className="py-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400 px-4">
                        Aucune caractéristique disponible pour cette sélection.
                    </p>
                </div>
            )}

            {/* Global Reset */}
            {hasActiveFilters && (
                <button
                    onClick={onReset}
                    className="w-full text-sm text-slate-500 hover:text-rose-500 transition-colors py-2 border border-slate-200 rounded hover:border-rose-300 mt-2"
                >
                    Réinitialiser tous les filtres
                </button>
            )}
        </div>
    );
};

export default SideSpecFilter;
