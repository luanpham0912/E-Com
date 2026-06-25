const BACKEND = 'https://petproject-api.onrender.com';

export const config = {
  matcher: '/api/v1/:path*',
};

function readCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  return (
    cookieHeader
      .split('; ')
      .find((row) => row.trimStart().startsWith(`${name}=`))
      ?.split('=')[1] ?? null
  );
}

export default async function handler(request: Request) {
  const url = new URL(request.url);

  const cookieHeader = request.headers.get('cookie') ?? null;
  const token = readCookie(cookieHeader, 'access_token');

  const filteredHeaders: [string, string][] = [];
  request.headers.forEach((value: string, key: string) => {
    const lower = key.toLowerCase();
    if (!['host', 'connection', 'content-length', 'upgrade-insecure-requests', 'cookie'].includes(lower)) {
      filteredHeaders.push([key, value]);
    }
  });

  if (token) {
    filteredHeaders.push(['Authorization', `Bearer ${token}`]);
  }

  const backendResponse = await fetch(
    `${BACKEND}${url.pathname}${url.search}`,
    {
      method: request.method,
      headers: filteredHeaders,
      body: ['GET', 'HEAD', 'OPTIONS'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',
    }
  );

  const body = await backendResponse.text();

  const responseHeaders: [string, string][] = [];
  for (const [key, value] of backendResponse.headers.entries()) {
    if (key.toLowerCase() !== 'set-cookie') {
      responseHeaders.push([key, value]);
    }
  }

  for (const [key, value] of backendResponse.headers.entries()) {
    if (key.toLowerCase() === 'set-cookie') {
      const clean = value
        .replace(/;?\s*Domain=[^;]*/gi, '')
        .replace(/;?\s*SameSite=[^;]*/gi, '')
        .replace(/(;?\s*Secure)/gi, '')
        .trim()
        .replace(/;+\s*$/, '');
      responseHeaders.push(['set-cookie', `${clean}; SameSite=Lax; Path=/`]);
    }
  }

  if (backendResponse.status >= 300 && backendResponse.status < 400) {
    const location = backendResponse.headers.get('location');
    if (location) {
      responseHeaders.push(['location', location]);
    }
    return new Response(null, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  }

  return new Response(body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  });
}
