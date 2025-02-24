'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type Booking, type User } from '@/lib/supabase'
import DashboardLayout from '@/components/DashboardLayout'

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<(Booking & { user: User })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      const houseId = localStorage.getItem('house_id')
      if (!houseId) {
        router.push('/')
        return
      }

      setIsLoading(true)
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          user:users(*)
        `)
        .eq('house_id', houseId)
        .order('start_date', { ascending: true })

      if (error) {
        console.error('Error fetching bookings:', error)
        return
      }

      setBookings(data as (Booking & { user: User })[])
      setIsLoading(false)
    }

    fetchBookings()
  }, [router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleDeleteBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)

      if (error) throw error

      setBookings(bookings.filter(booking => booking.id !== bookingId))
    } catch (error) {
      console.error('Error deleting booking:', error)
      alert('Failed to delete booking')
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bookings</h1>
        </div>

        <div className="grid gap-4">
          {bookings.map(booking => (
            <div
              key={booking.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 
                       bg-white dark:bg-gray-800 
                       rounded-xl shadow-sm
                       border border-gray-100 dark:border-gray-700
                       space-y-2 sm:space-y-0"
            >
              <div className="flex flex-col">
                <span className="font-medium text-lg text-gray-800 dark:text-gray-100">
                  {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {booking.user?.name}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Visitors: {booking.visitors}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/calendar?edit=${booking.id}`)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium
                           bg-blue-50 dark:bg-blue-500/10 
                           text-blue-600 dark:text-blue-400 
                           rounded-lg transition-colors
                           hover:bg-blue-100 dark:hover:bg-blue-500/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteBooking(booking.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium
                           bg-red-50 dark:bg-red-500/10 
                           text-red-600 dark:text-red-400 
                           rounded-lg transition-colors
                           hover:bg-red-100 dark:hover:bg-red-500/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {bookings.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No bookings found. Create a booking from the calendar.
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Loading bookings...
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 