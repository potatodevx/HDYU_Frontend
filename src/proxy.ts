import { withAuth } from "next-auth/middleware";

/**
 * Stop unauthenticated visitors before protected pages render. The server
 * layouts keep a second check in place, including the ADMIN role check.
 */
export default withAuth({
  pages: { signIn: "/login" },
  callbacks: {
    authorized: ({ token }) => Boolean(token),
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
