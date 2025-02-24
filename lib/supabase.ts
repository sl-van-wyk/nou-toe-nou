import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type House = {
  id: number
  house_name: string
  password: string
}

export type User = {
  id: number
  name: string
  house_id: number
}

export type Booking = {
  id: number
  house_id: number
  user_id: number
  start_date: string
  end_date: string
  visitors: number
  user?: User
} 