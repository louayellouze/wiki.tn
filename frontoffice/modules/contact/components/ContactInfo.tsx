import React from 'react'
import { Mail, Phone, Headset, ShoppingCart } from 'lucide-react'

const ContactInfo = () => {
    return (
        <div className="space-y-16">
            <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wiki/10 border border-wiki/20 text-wiki text-sm font-bold uppercase tracking-wider">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wiki opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-wiki"></span>
                    </span>
                    Support en ligne
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                    Besoin d'une Assistance <span className="text-wiki">Immédiate</span> ?
                </h2>
                <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-lg">
                    Nos experts sont disponibles pour répondre à toutes vos questions techniques ou commerciales.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                {/* Email Card */}
                <div className="group p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-wiki/10 hover:-translate-y-1 transition-all duration-500">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <Mail size={28} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Email</p>
                            <a href="mailto:info@wiki.tn" className="text-2xl font-black text-slate-900 hover:text-wiki transition-colors">
                                info@wiki.tn
                            </a>
                        </div>
                    </div>
                </div>

                {/* Service Client Card */}
                <div className="group p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-wiki/10 hover:-translate-y-1 transition-all duration-500">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <Headset size={28} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Service Client</p>
                            <a href="tel:22414444" className="text-2xl font-black text-slate-900 hover:text-wiki transition-colors">
                                22 414 444
                            </a>
                        </div>
                    </div>
                </div>

                {/* Vente Card */}
                <div className="group p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-wiki/10 hover:-translate-y-1 transition-all duration-500">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-wiki/10 text-wiki flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <ShoppingCart size={28} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Vente en Ligne</p>
                            <a href="tel:58742472" className="text-2xl font-black text-slate-900 hover:text-wiki transition-colors">
                                58 742 472
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ContactInfo
