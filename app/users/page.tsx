'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type User } from '@/lib/supabase'
import DashboardLayout from '@/components/DashboardLayout'

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      const houseId = localStorage.getItem('house_id')
      if (!houseId) {
        router.push('/')
        return
      }

      setIsLoading(true)
      const { data } = await supabase
        .from('users')
        .select()
        .eq('house_id', houseId)

      if (data) setUsers(data)
      setIsLoading(false)
    }

    fetchUsers()
  }, [router])

  const handleSaveUser = async (userData: { name: string }) => {
    const houseId = localStorage.getItem('house_id')
    
    if (users.length >= 20 && !editingUser) {
      alert('Maximum number of users (20) reached')
      return
    }

    try {
      if (editingUser) {
        const { error } = await supabase
          .from('users')
          .update({ name: userData.name })
          .eq('id', editingUser.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('users')
          .insert({ name: userData.name, house_id: houseId })

        if (error) throw error
      }

      const { data } = await supabase
        .from('users')
        .select()
        .eq('house_id', houseId)

      if (data) setUsers(data)
      setShowModal(false)
      setEditingUser(null)
    } catch (error) {
      console.error('Error saving user:', error)
      alert('Failed to save user')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure? This will also delete all bookings for this user.')) return

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) throw error

      setUsers(users.filter(user => user.id !== userId))
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    }
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Users</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Add User
          </button>
        </div>

        <div className="grid gap-4">
          {users.map(user => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm"
            >
              <span className="font-medium text-gray-800">{user.name}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingUser(user)
                    setShowModal(true)
                  }}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-4">
                {editingUser ? 'Edit User' : 'Add User'}
              </h2>
              <form
                onSubmit={e => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  handleSaveUser({ name: formData.get('name') as string })
                }}
              >
                <input
                  type="text"
                  name="name"
                  defaultValue={editingUser?.name}
                  placeholder="User name"
                  className="w-full px-3 py-2 border rounded-xl mb-4"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingUser(null)
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                  >
                    {editingUser ? 'Save Changes' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 