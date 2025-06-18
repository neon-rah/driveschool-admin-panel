import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = ['/signin', '/signup'];

async function verifyToken(token: string): Promise<boolean> {
    try {
        const response = await fetch('http://localhost:8000/api/auth/verify', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.ok;
    } catch {
        return false;
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    if (!token || !(await verifyToken(token))) {
        return NextResponse.redirect(new URL('/signin', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};






// import { NextRequest, NextResponse } from 'next/server';
//
// // Liste des routes publiques
// const publicRoutes = ['/signin', '/signup'];
//
// export function middleware(request: NextRequest) {
//     const { pathname } = request.nextUrl; // Récupère le chemin de la requête
//     const token = request.cookies.get('token')?.value; // Récupère le token depuis les cookies
//
//     // Si la route est publique, autoriser l’accès sans vérification
//     if (publicRoutes.includes(pathname)) {
//         return NextResponse.next();
//     }
//
//     // Si pas de token et la route n’est pas publique, rediriger vers /signin
//     if (!token) {
//         return NextResponse.redirect(new URL('/signin', request.url));
//     }
//
//     // Si le token existe, continuer vers la route demandée
//     return NextResponse.next();
// }
//
// // Configuration pour appliquer le middleware à toutes les routes
// export const config = {
//     matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], // Exclut les routes API et statiques
// };