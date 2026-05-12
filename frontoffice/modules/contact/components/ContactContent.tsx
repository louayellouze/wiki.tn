'use client'

import React from 'react'
import ContactForm from './ContactForm'
import ContactInfo from './ContactInfo'

const ContactContent = () => {
    return (
        <section className="py-20 md:py-32 bg-white relative overflow-hidden selection:bg-wiki/20">
            {/* Advanced Background Orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-wiki/10 -z-10 translate-x-1/3 -translate-y-1/3 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-slate-100 -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-emerald-50 -z-10 translate-y-1/2 rounded-full blur-[80px]" />

            <div className="container mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 xl:gap-32 items-start">
                    {/* Left Column: Form Section */}
                    <div className="order-2 lg:order-1 relative">
                        <div className="space-y-6 mb-12">
                            <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
                                Parlons de votre <span className="text-wiki">Projet</span>.
                            </h1>
                            <p className="text-slate-500 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                                Notre équipe d'experts est prête à vous accompagner. Envoyez-nous un message et nous vous répondrons en moins de 24h.
                            </p>
                        </div>

                        <div className="relative">
                            {/* Decorative line */}
                            <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-wiki via-wiki/50 to-transparent rounded-full hidden md:block" />
                            <ContactForm />
                        </div>
                    </div>

                    {/* Right Column: Info Section */}
                    <div className="order-1 lg:order-2 lg:sticky lg:top-32">
                        <ContactInfo />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ContactContent
