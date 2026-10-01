import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const requestedNext = searchParams.get('next') ?? '/'
  const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : '/'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Server Component içerisinden çağrıldığında yoksayılabilir
            }
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const user = data.user
      const username = typeof user?.user_metadata?.username === 'string'
        ? user.user_metadata.username.trim().toLowerCase()
        : ''
      const fullName = typeof user?.user_metadata?.full_name === 'string'
        ? user.user_metadata.full_name
        : username

      if (user && username) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: user.id,
          username,
          full_name: fullName || username,
          avatar_url: typeof user.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : null,
        }, { onConflict: 'id', ignoreDuplicates: true })

        if (profileError) {
          return NextResponse.redirect(new URL('/?verification=profile-error', origin))
        }
      }

      return NextResponse.redirect(new URL(next, origin))
    }
  }

  return NextResponse.redirect(new URL('/?verification=failed', origin))
}