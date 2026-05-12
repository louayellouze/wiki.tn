import HeaderBottom from '@/common/components/layouts/HeaderBottom'
import HeaderTop from '@/common/components/layouts/HeaderTop'
import Footer from '@/common/components/layouts/Footer'
import { Broadcum } from '@/common/components/layouts/Broadcrum'
import Products from '@/modules/products'
import { Suspense } from 'react'

export default function CategoriesPage() {
    return (
        <main className="bg-white">
            <HeaderTop />
            <HeaderBottom />
            <Broadcum />
            <Suspense fallback={<div className="h-screen flex items-center justify-center animate-pulse text-wiki font-bold">Chargement...</div>}>
                <Products />
            </Suspense>
            <Footer />
        </main>
    )
}
