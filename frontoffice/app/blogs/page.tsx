import HeaderBottom from '@/common/components/layouts/HeaderBottom'
import HeaderTop from '@/common/components/layouts/HeaderTop'
import Footer from '@/common/components/layouts/Footer'
import Blogs from '@/modules/homepage/components/Blogs'

export default function BlogsPage() {
    return (
        <main className="bg-white">
            <HeaderTop />
            <HeaderBottom />
            <div className="py-10">
                <Blogs />
            </div>
            <Footer />
        </main>
    )
}
