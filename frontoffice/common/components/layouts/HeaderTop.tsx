import React from 'react'
import Link from 'next/link'
import { Phone, MapPin, Truck, ChevronDown } from 'lucide-react'

const HeaderTop = () => {
    return (
        <div className="bg-slate-900 border-b border-white/5 hidden lg:block">
            <div className="container mx-auto h-11 flex justify-between items-center px-4">
                <div className='flex items-center gap-6'>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium hover:text-wiki transition-colors cursor-pointer group">
                        <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-wiki/10 transition-colors">
                            <Phone size={14} className="group-hover:animate-pulse" />
                        </div>
                        <span>Besoin d'aide ? <span className="text-white font-bold ml-1">22 414 444</span></span>
                    </div>
                    <div className="h-4 w-px bg-white/10"></div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium hover:text-white transition-colors cursor-pointer group">
                        <Truck size={14} />
                        <span>Livraison sur toute la Tunisie</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium hover:text-white transition-colors cursor-pointer group">
                            <MapPin size={14} />
                            <span>Nos Magasins</span>
                        </div>
                        <div className="h-4 w-px bg-white/10"></div>
                        <Link href="/track-order" className="flex items-center gap-2 text-slate-400 text-xs font-medium hover:text-white transition-colors cursor-pointer group">
                            <span>Suivre ma commande</span>
                            <ChevronDown size={14} />
                        </Link>
                    </div>
                    
                    <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
                        <span className="text-[10px] font-black text-wiki uppercase tracking-widest bg-wiki/10 px-2 py-0.5 rounded">Wiki Pro</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeaderTop