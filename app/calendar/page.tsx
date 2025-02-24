'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type Booking, type User } from '@/lib/supabase'
import BookingModal from '@/components/BookingModal'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import DashboardLayout from '@/components/DashboardLayout'

const userColors: { [key: number]: string } = {}

// Predefined color palette
const COLORS = [
  '#FF6B6B', // red
  '#4ECDC4', // teal
  '#45B7D1', // blue
  '#96CEB4', // green
  '#FFEEAD', // yellow
  '#D4A5A5', // pink
  '#9B5DE5', // purple
  '#F15BB5', // magenta
  '#00BBF9', // cyan
  '#00F5D4', // mint
];

const formatDateString = (date: Date) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0]
}

export default function CalendarPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [isClientLoaded, setIsClientLoaded] = useState(false)

  // Calculate calendar height based on screen size
  const [calendarHeight, setCalendarHeight] = useState('auto')

  useEffect(() => {
    const initializePage = async () => {
      const houseId = localStorage.getItem('house_id')
      if (!houseId) {
        router.push('/')
        return
      }

      try {
        setIsLoading(true)
        await Promise.all([
          fetchBookings(houseId),
          fetchUsers(houseId)
        ])
      } finally {
        setIsLoading(false)
      }
    }

    initializePage()
  }, [router])

  useEffect(() => {
    setIsClientLoaded(true)
  }, [])

  useEffect(() => {
    const updateHeight = () => {
      if (window.innerWidth < 768) { // mobile
        // Subtract header (64px) and bottom nav (76px) plus padding
        const availableHeight = window.innerHeight - 64 - 76 - 32 // 32px for padding
        setCalendarHeight(`${availableHeight}px`)
      } else {
        setCalendarHeight('auto')
      }
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  const fetchBookings = async (houseId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        user:users(*)
      `)
      .eq('house_id', houseId)

    if (error) {
      console.error('Error fetching bookings:', error)
      return
    }

    if (data) setBookings(data)
  }

  const fetchUsers = async (houseId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('house_id', houseId)

    if (error) {
      console.error('Error fetching users:', error)
      return
    }

    if (data) {
      setUsers(data)
      // Assign consistent colors to users
      data.forEach((user, index) => {
        userColors[user.id] = COLORS[index % COLORS.length]
      })
    }
  }

  const handleDateClick = (info: { date: Date }) => {
    setSelectedDate(new Date(formatDateString(info.date)))
    setShowModal(true)
  }

  const getCalendarEvents = () => {
    return bookings.map(booking => ({
      title: booking.user?.name || 'Unknown',
      start: booking.start_date,
      end: booking.end_date,
      backgroundColor: userColors[booking.user_id] || '#6366f1',
      borderColor: 'transparent',
      extendedProps: {
        visitors: booking.visitors
      }
    }))
  }

  const isDateOverlapping = (startDate: string, endDate: string, excludeBookingId?: number) => {
    return bookings.some(booking => {
      if (excludeBookingId && booking.id === excludeBookingId) return false
      
      const start = new Date(startDate)
      const end = new Date(endDate)
      const bookingStart = new Date(booking.start_date)
      const bookingEnd = new Date(booking.end_date)

      return (start <= bookingEnd && end >= bookingStart)
    })
  }

  const handleEventClick = (info: { event: any }) => {
    const bookingId = info.event.id
    const booking = bookings.find(b => b.id === Number(bookingId))
    if (booking) {
      setEditingBooking(booking)
      setShowModal(true)
    }
  }

  const handleDeleteBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId)

    if (error) {
      alert('Error deleting booking')
      return
    }

    const houseId = localStorage.getItem('house_id')
    await fetchBookings(houseId!)
  }

  if (!isClientLoaded) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={bookings.map(booking => ({
              id: booking.id.toString(),
              title: booking.user?.name || 'Unknown',
              start: booking.start_date,
              end: new Date(new Date(booking.end_date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              backgroundColor: userColors[booking.user_id] || COLORS[0],
              borderColor: 'transparent',
              extendedProps: {
                visitors: booking.visitors
              }
            }))}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            headerToolbar={{
              left: 'prev',
              center: 'title',
              right: 'next'
            }}
            height="auto"
            contentHeight="auto"
            aspectRatio={1.8}
            editable={false}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={3}
            eventDisplay="block"
            eventContent={eventInfo => (
              <div className="p-1 min-w-0 w-full">
                <div className="text-xs font-semibold truncate dark:text-white">
                  {eventInfo.event.title}
                </div>
                <div className="text-xs truncate opacity-75 dark:text-gray-300">
                  Visitors: {eventInfo.event.extendedProps.visitors}
                </div>
              </div>
            )}
            eventClassNames="overflow-hidden"
          />
        </div>
      </div>
      
      {showModal && (
        <BookingModal
          date={selectedDate!}
          users={users}
          onClose={() => {
            setShowModal(false)
            setEditingBooking(null)
          }}
          booking={editingBooking}
          onDelete={handleDeleteBooking}
          onBook={async (bookingData) => {
            try {
              const houseId = localStorage.getItem('house_id')
              
              if (isDateOverlapping(
                bookingData.start_date, 
                bookingData.end_date,
                editingBooking?.id
              )) {
                alert('These dates overlap with an existing booking')
                return
              }

              if (editingBooking) {
                const { error } = await supabase
                  .from('bookings')
                  .update({
                    ...bookingData,
                    house_id: houseId
                  })
                  .eq('id', editingBooking.id)

                if (error) throw error
              } else {
                const { error } = await supabase
                  .from('bookings')
                  .insert({
                    ...bookingData,
                    house_id: houseId
                  })

                if (error) throw error
              }

              await fetchBookings(houseId!)
              setShowModal(false)
              setEditingBooking(null)
            } catch (error) {
              console.error('Error saving booking:', error)
              alert('Failed to save booking. Please try again.')
            }
          }}
        />
      )}
    </DashboardLayout>
  )
} 