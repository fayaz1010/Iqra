import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { Toaster } from 'react-hot-toast'
import Navigation from '@/components/shared/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Iqra Learning Platform',
  description: 'Interactive learning platform for Iqra books and Quran',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navigation />
          <main className="pt-16">
            {children}
          </main>
          <Toaster 
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
              },
            }} 
          />
        </AuthProvider>
      </body>
    </html>
  )
}
