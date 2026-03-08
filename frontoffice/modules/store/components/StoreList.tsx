'use client'

import React, { useState } from 'react'
import { STORES, Store } from '@/common/constant/stores'
import { Search, MapPin, Phone, Clock, ChevronRight } from 'lucide-react'
import { Card } from '@/common/components/elements/Card'

interface StoreListProps {
    onSelectStore: (store: Store) => void
    selectedStoreId?: number
}

export const StoreList = ({ onSelectStore, selectedStoreId }: StoreListProps) => {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredStores = STORES.filter(store =>
        store.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.address.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex flex-col h-full bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
            {/* Search Header */}
            <div className="p-8 bg-wiki-btn space-y-4">
                <h3 className="text-white text-xl font-bold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-wiki" />
                    Trouver un magasin
                </h3>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Rechercher par ville ou adresse..."
                        className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-wiki/50 transition-all text-sm font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto max-h-[800px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {filteredStores.length > 0 ? (
                    filteredStores.map((store) => (
                        <div
                            key={store.id}
                            onClick={() => onSelectStore(store)}
                            className={`p-6 cursor-pointer border-b border-slate-50 transition-all group hover:bg-slate-50 ${selectedStoreId === store.id ? 'bg-emerald-50/50 border-l-4 border-l-wiki' : ''
                                }`}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-3">
                                    <h4 className={`font-bold text-lg transition-colors ${selectedStoreId === store.id ? 'text-wiki-btn' : 'text-slate-800 group-hover:text-wiki-btn'
                                        }`}>
                                        {store.displayName}
                                    </h4>

                                    <div className="flex gap-2 text-slate-500">
                                        <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-wiki" />
                                        <p className="text-sm font-medium leading-relaxed">{store.address}</p>
                                    </div>

                                    {store.phones.length > 0 && (
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Phone className="w-4 h-4 text-wiki" />
                                            <p className="text-sm font-bold">{store.phones.join(' / ')}</p>
                                        </div>
                                    )}

                                    <div className="flex gap-2 text-slate-400">
                                        <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            {store.hours.map((line, idx) => (
                                                <p key={idx} className="text-xs font-medium">{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className={`w-5 h-5 transition-all ${selectedStoreId === store.id ? 'text-wiki translate-x-1' : 'text-slate-200 group-hover:text-wiki'
                                    }`} />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-10 text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium">Aucun magasin trouvé pour votre recherche.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
