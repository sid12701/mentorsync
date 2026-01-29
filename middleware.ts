import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );
   const {data: {user}}= await  supabase.auth.getUser();
   const path = request.nextUrl.pathname;

   const publicRoutes = ['/', '/login', '/signup']
   const isPublicRoute = publicRoutes.includes(path);
   
   const authRoutes = ['/login','signup']
   const isAuthRoute = authRoutes.includes(path);
   
   const protectedRoutes = ['/dashboard', 'onboarding']
   const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

   if(!user && isProtectedRoute){
    return NextResponse.redirect(new URL('/login', request.url))
   }

   if(user){
    const{data: profile}= await supabase.from('profiles').select('role').eq('id', user.id).single();
    const hasProfile = !!profile

    if (!hasProfile && !path.startsWith('/onboarding')) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
  
      // If has profile and on onboarding page → redirect to dashboard
      if (hasProfile && path.startsWith('/onboarding')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
  
      // If logged in and trying to access auth pages → redirect to dashboard
      if (isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    return response
}

export const config = {
    matcher: [
      /*
       * Match all request paths except:
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico (favicon file)
       * - public folder
       */
      '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
  }

