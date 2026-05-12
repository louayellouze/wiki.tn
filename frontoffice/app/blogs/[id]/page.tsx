import React from 'react'
import HeaderBottom from '@/common/components/layouts/HeaderBottom'
import HeaderTop from '@/common/components/layouts/HeaderTop'
import Footer from '@/common/components/layouts/Footer'
import BlogDetail from '@/modules/blog/components/BlogDetail'

interface PageProps {
    params: {
        id: string
    }
}

export default function BlogDetailPage({ params }: PageProps) {
    return (
        <main className="bg-white">
            <HeaderTop />
            <HeaderBottom />
            <BlogDetail id={params.id} />
            <Footer />
        </main>
    )
}
