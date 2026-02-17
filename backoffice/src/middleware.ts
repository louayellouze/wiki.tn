import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // 1. Exclude public assets and auth paths
    if (
        pathname.startsWith('/auth') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/images') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.includes('.') // Static files
    ) {
        // Prevent logged-in users from accessing sign-in page (optional but good UX)
        if (token && pathname === '/auth/sign-in') {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // 2. Protection: Redirect to sign-in if no token
    if (!token) {
        const url = new URL('/auth/sign-in', request.url);
        // url.searchParams.set('callbackUrl', encodeURIComponent(pathname)); // Optional: for redirect back
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

// Ensure middleware runs on all paths
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
