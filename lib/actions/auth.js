'use server'

import { redirect } from 'next/navigation'
import { authenticateUser, destroySession } from '@/lib/auth'

export async function loginAction(prevState, formData) {
  try {
    const email = formData.get('email')?.toString().trim() || ''
    const password = formData.get('password')?.toString() || ''
    
    console.log(`[LoginAction] Login attempt for: ${email}`)
    
    // Simple validation
    if (!email || !password) {
      return { error: 'Email and password are required' }
    }
    
    // Authenticate user
    const result = await authenticateUser(email, password)
    
    if (result.error) {
      console.log(`[LoginAction] Failed: ${result.error}`)
      return { error: result.error }
    }
    
    console.log(`[LoginAction] Success for: ${email}, redirecting to dashboard`)
    
    // Redirect immediately after successful authentication
    redirect('/dashboard')
    
  } catch (error) {
    console.error('[LoginAction] Error:', error)
    return { error: 'Login failed. Please try again.' }
  }
}

export async function logoutAction() {
  try {
    await destroySession()
  } catch (error) {
    console.error('Logout error:', error)
  }
  
  redirect('/login')
}