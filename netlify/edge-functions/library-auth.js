export default async (request, context) => {
  if (!context.cookies.get('trainwellacademy_token')) {
    return Response.redirect(new URL('/pricing/', request.url), 307);
  }
  return context.next();
};

export const config = { path: ['/library', '/library/'] };
