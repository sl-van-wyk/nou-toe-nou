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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">
          {booking ? 'Edit Booking' : 'New Booking'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Family Member
            </label>
            <select
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={userId}
              onChange={(e) => setUserId(Number(e.target.value))}
            >
              <option value="">Select a family member</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Number of Visitors
            </label>
            <input
              type="number"
              min="1"
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={visitors}
              onChange={(e) => setVisitors(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          {booking && onDelete && (
            <button
              onClick={() => {
                onDelete(booking.id)
                onClose()
              }}
              className="px-4 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50"
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
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
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            {booking ? 'Save Changes' : 'Book'}
          </button>
        </div>
      </div>
    </div>
  )
} 