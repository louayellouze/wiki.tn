import type { Metadata } from 'next'
import './globals.css'
import { METADATA } from '../common/constant/metadata'
import { poppins } from '@/common/styles/fonts'

export const metadata: Metadata = {
  title: METADATA.title + METADATA.bTitle,
  description: METADATA.description,
  keywords: METADATA.keywords,
  authors: {
    name: METADATA.author,
  }
}

import Providers from '../common/components/Providers'
import WheelOfFortune from '@/common/components/gamification/WheelOfFortune'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Providers>
          {children}
          <WheelOfFortune />
        </Providers>
      </body>
    </html>
  )
}
