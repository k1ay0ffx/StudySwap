import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StudySwap - басқаларды үйрету арқылы үйреніңіз',
  description: 'Студенттер үшін білім алмасу платформасы',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}