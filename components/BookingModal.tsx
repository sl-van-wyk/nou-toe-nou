import { useState } from 'react'
import { User, Booking } from '@/lib/supabase'

interface BookingModalProps {
  date: Date
  users: User[]
  onClose: () => void
  booking?: Booking | null
  onDelete?: (id: number) => void
  onBook: (booking: {
    user_id: number
    start_date: string
    end_date: string
    visitors: number
  }) => void
}

export default function BookingModal({ 
  date, 
  users, 
  onClose, 
  onBook, 
  booking, 
  onDelete 
}: BookingModalProps) {
  const [userId, setUserId] = useState<number>(booking?.user_id || 0)
  const [startDate, setStartDate] = useState(booking?.start_date || date.toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(booking?.end_date || date.toISOString().split('T')[0])
  const [visitors, setVisitors] = useState(booking?.visitors || 1)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {booking ? 'Edit Booking' : 'New Booking'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              User
            </label>
            <select
              value={userId}
              onChange={(e) => setUserId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a user</option>
              {users.map(user => (
                <option key={user.id} value={user.id} className="text-gray-900 dark:text-white">
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Number of Visitors
            </label>
            <input
              type="number"
              min="1"
              value={visitors}
              onChange={(e) => setVisitors(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          {booking && onDelete && (
            <button
              onClick={() => {
                onDelete(booking.id)
                onClose()
              }}
              className="px-4 py-2 rounded-xl border border-red-300 dark:border-red-500
                       text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20
                       transition-colors"
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600
                     text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                     transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (userId) {
                onBook({
                  user_id: userId,
                  start_date: startDate,
                  end_date: endDate,
                  visitors
                })
              }
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white
                     hover:bg-blue-700 dark:hover:bg-blue-500
                     transition-colors"
          >
            {booking ? 'Save Changes' : 'Book'}
          </button>
        </div>
      </div>
    </div>
  )
} 