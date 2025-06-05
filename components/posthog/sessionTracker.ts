"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation' // Note: Using next/navigation instead of next/router
import posthog from 'posthog-js'

export default function SessionTracker() {
  const router = useRouter()

  useEffect(() => {
    // Ensure PostHog is initialized
    if (typeof posthog === 'undefined' || !posthog.__loaded) return
    
    const handleRouteChange = (url: string) => {
      try {
        posthog.capture('$pageview', {
          $current_url: url,
          $host: window.location.hostname,
          $pathname: window.location.pathname
        })
      } catch (e) {
        console.error('PostHog tracking error:', e)
      }
    }

    // Track initial pageview
    handleRouteChange(window.location.pathname)
    
    // Track subsequent pageviews
    window.addEventListener('routeChangeComplete', handleRouteChange)
    
    return () => {
      window.removeEventListener('routeChangeComplete', handleRouteChange)
    }
  }, [router])

  return null
}