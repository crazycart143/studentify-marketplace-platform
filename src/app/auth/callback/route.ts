import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/profile'

  console.log('[Auth Callback] Code:', code ? 'present' : 'missing')
  console.log('[Auth Callback] Next param:', next)

  if (code) {
    const cookieStore = await cookies()
    const response = NextResponse.redirect(`${requestUrl.origin}${next}`)
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Explicitly get user to ensure session is serialized to cookies
      await supabase.auth.getUser()
      console.log('[Auth Callback] Session exchange successful! Redirecting to:', next)
      return response
    } else {
      console.error('[Auth Callback] Error exchanging code:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=${encodeURIComponent(error.message)}`)
    }
  }

  console.log('[Auth Callback] Fallback redirect to /auth')
  return NextResponse.redirect(`${requestUrl.origin}/auth`)
}
