import HeaderBottom from '@/common/components/layouts/HeaderBottom'
import HeaderTop from '@/common/components/layouts/HeaderTop'
import Footer from '@/common/components/layouts/Footer'
import { BlogList } from '@/modules/blog/components/BlogList'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function BlogsPage() {
    return (
        <main className="bg-[#f8fafc] min-h-screen">
            <HeaderTop />
            <HeaderBottom />

            <div className="bg-wiki-btn py-12 md:py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-wiki/20 to-transparent"></div>
                <div className="container mx-auto px-4 md:px-10 relative z-10">
                    <div className="flex items-center gap-2 text-white/60 text-sm font-bold uppercase tracking-widest mb-4">
                        <Link href="/" className="hover:text-wiki transition-colors">Accueil</Link>
                        <ChevronRight className="w-4 h-4 opacity-40" />
                        <span className="text-white">Blog & Actualités</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-2xl">
                        Toutes les dernières actualités de <span className="text-wiki">Wiki Tunisie</span>
                    </h1>
                </div>
            </div>

            <div className="py-16">
                <BlogList />
            </div>

            <Footer />
        </main>
    )
}
