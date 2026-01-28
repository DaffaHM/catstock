'use client'

import { useFormStatus } from 'react-dom'
import { logoutAction } from '@/lib/actions/auth'
import { LogOutIcon } from 'lucide-react'

function LogoutButtonContent({ iconOnly = false, className = '' }) {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 ease-in-out min-h-[44px] min-w-[44px] touch-manipulation active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <LogOutIcon className={`h-4 w-4 ${iconOnly ? '' : 'mr-2'}`} />
      {!iconOnly && (pending ? 'Sedang keluar...' : 'Keluar')}
    </button>
  )
}

export default function LogoutButton({ className = '', iconOnly = false }) {
  return (
    <form action={logoutAction}>
      <LogoutButtonContent iconOnly={iconOnly} className={className} />
    </form>
  )
}