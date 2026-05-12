'use client'

import React, { useState } from 'react'
import HeaderTop from '@/common/components/layouts/HeaderTop'
import HeaderBottom from '@/common/components/layouts/HeaderBottom'
import Footer from '@/common/components/layouts/Footer'
import Link from 'next/link'
import { ChevronRight, Store as StoreIcon, MapPin } from 'lucide-react'
import { StoreList } from '@/modules/store/components/StoreList'
import { StoreMap } from '@/modules/store/components/StoreMap'
import { STORES, Store } from '@/common/constant/stores'

export default function NosMagasinsPage() {
    const [selectedStore, setSelectedStore] = useState<Store>(STORES[0])

    return (
        <main className="bg-[#f8fafc] min-h-screen">
            <HeaderTop />
            <HeaderBottom />

            {/* Premium Header */}
            <div className="bg-wiki-btn py-12 md:py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-wiki/20 to-transparent"></div>
                <div className="container mx-auto px-4 md:px-10 relative z-10">
                    <div className="flex items-center gap-2 text-white/60 text-sm font-bold uppercase tracking-widest mb-4">
                        <Link href="/" className="hover:text-wiki transition-colors">Accueil</Link>
                        <ChevronRight className="w-4 h-4 opacity-40" />
                        <span className="text-white">Nos Magasins</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-4">
                                Trouvez le magasin <br /><span className="text-wiki">Wiki</span> le plus proche
                            </h1>
                            <p className="text-white/70 text-lg font-medium max-w-xl">
                                Découvrez nos 16 points de vente à travers toute la Tunisie. Nos experts vous accueillent pour vous conseiller au mieux.
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/20 flex items-center gap-6">
                            <div className="w-16 h-16 bg-wiki rounded-full flex items-center justify-center shadow-lg shadow-wiki/30">
                                <StoreIcon className="w-8 h-8 text-wiki-btn" />
                            </div>
                            <div>
                                <span className="block text-4xl font-black text-white">16</span>
                                <span className="text-white/60 font-bold uppercase tracking-widest text-xs">Magasins en Tunisie</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 md:px-10 -mt-10 pb-24 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Store List */}
                    <div className="lg:col-span-4 h-full">
                        <StoreList
                            onSelectStore={setSelectedStore}
                            selectedStoreId={selectedStore.id}
                        />
                    </div>

                    {/* Right: Map & Selection Details */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Map Container */}
                        <StoreMap query={selectedStore.mapQuery} title={selectedStore.displayName} />

                        {/* Selected Store Details Card (Visible on Mobile/Tablet if not overlapping map) */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100">
                                    <MapPin className="w-6 h-6 text-wiki" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-wiki-btn">{selectedStore.displayName}</h2>
                                    <p className="text-slate-500 font-medium">{selectedStore.address}</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedStore.mapQuery + ", Tunisia")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-wiki-btn text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-wiki-btn/20 hover:scale-105 active:scale-95 transition-all text-sm tracking-wide"
                                >
                                    Itinéraire
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    )
}
