'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useRef, useMemo, useCallback } from 'react'
import { loginAction } from '@/lib/actions/auth'
import TouchButton from './ui/TouchButton'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-14 tablet:h-16 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white text-lg tablet:text-xl font-semibold rounded-xl tablet:rounded-2xl transition-all duration-200 ease-in-out active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:cursor-not-allowed disabled:transform-none"
    >
      {pending ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 tablet:h-7 tablet:w-7 border-2 border-white border-t-transparent mr-3"></div>
          <span>Sedang masuk...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <svg className="w-5 h-5 tablet:w-6 tablet:h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          <span>Masuk</span>
        </div>
      )}
    </button>
  )
}

function TouchInput({ id, name, type, label, placeholder, required, autoComplete, defaultValue, hasError }) {
  const inputRef = useRef(null)
  
  // Auto-scroll to input on focus for better iPad experience
  const handleFocus = useCallback(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }, 300) // Delay to allow keyboard animation
    }
  }, [])
  
  return (
    <div className="space-y-3 tablet:space-y-4">
      <label 
        htmlFor={id} 
        className="block text-base tablet:text-lg font-semibold text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        onFocus={handleFocus}
        className={`w-full h-14 tablet:h-16 px-4 tablet:px-6 text-base tablet:text-lg border-2 rounded-xl tablet:rounded-2xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 placeholder-gray-400 ${
          hasError 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50' 
            : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100 bg-white hover:border-gray-300'
        }`}
        placeholder={placeholder}
        defaultValue={defaultValue}
        // Prevent zoom on iPad when focusing
        style={{ fontSize: '16px' }}
      />
    </div>
  )
}

function ErrorMessage({ error }) {
  if (!error) return null
  
  return (
    <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 tablet:px-6 py-4 tablet:py-5 rounded-xl tablet:rounded-2xl">
      <div className="flex items-start">
        <svg className="w-5 h-5 tablet:w-6 tablet:h-6 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-base tablet:text-lg font-medium">
            {error}
          </p>
          {error.includes('Too many login attempts') && (
            <p className="text-sm tablet:text-base text-red-600 mt-1">
              For security, please wait before trying again.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginForm() {
  const [state, formAction] = useFormState(loginAction, {})
  const formRef = useRef(null)

  // Remove client-side redirect since we handle it server-side now

  return (
    <form ref={formRef} action={formAction} className="space-y-6 tablet:space-y-8">
      <TouchInput
        id="email"
        name="email"
        type="email"
        label="Alamat Email"
        placeholder="owner@catstock.com"
        autoComplete="email"
        required
        defaultValue={state?.fields?.email || ''}
        hasError={state?.error && state?.error.toLowerCase().includes('email')}
      />

      <TouchInput
        id="password"
        name="password"
        type="password"
        label="Kata Sandi"
        placeholder="admin123"
        autoComplete="current-password"
        required
        defaultValue=""
        hasError={state?.error && !state?.error.toLowerCase().includes('email')}
      />

      <ErrorMessage error={state?.error} />

      <div className="pt-2 tablet:pt-4">
        <SubmitButton />
      </div>
      
      <div className="text-center pt-4 tablet:pt-6">
        <p className="text-sm tablet:text-base text-gray-500">
          🔒 Login aman
        </p>
      </div>
    </form>
  )
}