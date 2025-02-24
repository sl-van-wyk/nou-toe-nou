'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// Modern icons using SVG
const icons = {
  calendar: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  bookings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  darkMode: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  lightMode: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

interface LayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: LayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [houseName, setHouseName] = useState('')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const fetchHouseName = async () => {
      const houseId = localStorage.getItem('house_id')
      if (!houseId) {
        router.push('/')
        return
      }

      const { data } = await supabase
        .from('houses')
        .select('house_name')
        .eq('id', houseId)
        .single()

      if (data) setHouseName(data.house_name)
    }

    fetchHouseName()
  }, [router])

  useEffect(() => {
    // Check initial theme
    const isDarkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDark
    setIsDark(newDarkMode)
    localStorage.setItem('darkMode', String(newDarkMode))
    document.documentElement.classList.toggle('dark')
  }

  const navItems = [
    { path: '/calendar', label: 'Calendar', icon: icons.calendar },
    { path: '/users', label: 'Users', icon: icons.users },
    { path: '/bookings', label: 'Bookings', icon: icons.bookings },
  ]

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <aside className="w-72 m-4 bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-gray-800 dark:to-gray-800">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white truncate">
                {houseName}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Family House</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? icons.lightMode : icons.darkMode}
            </button>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${pathname === item.path 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <span className={`${pathname === item.path ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-4">
        {children}
      </main>
    </div>
  )
} 