import React from 'react'
import ContactContent from '@/modules/contact/components/ContactContent'
import HeaderTop from '@/common/components/layouts/HeaderTop'
import HeaderBottom from '@/common/components/layouts/HeaderBottom'
import Navigation from '@/common/components/layouts/Navigation'
import Footer from '@/common/components/layouts/Footer'
import FooterMenu from '@/common/components/layouts/FooterMenu'
import Newsletter from '@/common/components/layouts/Newsletter'

export const metadata = {
  title: 'Nous Contacter | WIKI.TN',
  description: 'Besoin d\'aide ? Contactez l\'équipe WIKI.TN pour toute question ou assistance immédiate.',
}

export default function ContactPage() {
  return (
    <main>
      <HeaderTop />
      <HeaderBottom />
      <ContactContent />
      <Newsletter />
      <FooterMenu />
      <Footer />
    </main>
  )
}
