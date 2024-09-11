import {
  convexAuthNextjsMiddleware, // Import Convex middleware for Next.js
  createRouteMatcher, // Utility to match specific routes
  isAuthenticatedNextjs, // Function to check if the user is authenticated
  nextjsMiddlewareRedirect, // Utility to redirect user requests
} from "@convex-dev/auth/nextjs/server";

// Define the routes that should be accessible without authentication
// For instance, the "/auth" page where users can sign in
const isPublicPage = createRouteMatcher(['/auth'])

export default convexAuthNextjsMiddleware((request) => {
  // If the request is for a non-public page and the user is not authenticated,
  // redirect them to the sign-in page
  if (!isPublicPage(request) && !isAuthenticatedNextjs()) {
    return nextjsMiddlewareRedirect(request, '/auth')
  }

  // If the user is authenticated and tries to access a public page (e.g., "/auth"),
  // redirect them away from the sign-in page to the home page or another protected page
  if (isPublicPage(request) && isAuthenticatedNextjs()) {
    return nextjsMiddlewareRedirect(request, '/')
  }

  // If none of the above conditions match, allow the request to proceed normally
});
 
export const config = {
  // This matcher runs the middleware on all routes except static assets and Next.js internal paths.
  // Static assets (like images or styles) are excluded using the regular expression.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
