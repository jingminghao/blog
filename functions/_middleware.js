/**
 * Cloudflare Pages auth middleware.
 *
 * Required secret in Pages settings:
 * - SITE_USERNAME
 * - SITE_PASSWORD
 */
export async function onRequest(context) {
  const { request, env, next } = context

  // Allow health checks without auth if needed.
  if (new URL(request.url).pathname === '/healthz') {
    return new Response('ok', { status: 200 })
  }

  const expectedUser = env.SITE_USERNAME
  const expectedPass = env.SITE_PASSWORD

  if (!expectedUser || !expectedPass) {
    return new Response('Missing SITE_USERNAME or SITE_PASSWORD in Pages secrets.', {
      status: 500,
      headers: { 'content-type': 'text/plain; charset=utf-8' }
    })
  }

  const auth = request.headers.get('Authorization') || ''
  if (!auth.startsWith('Basic ')) {
    return unauthorized()
  }

  const base64 = auth.slice('Basic '.length)
  let decoded = ''
  try {
    decoded = atob(base64)
  } catch {
    return unauthorized()
  }

  const separator = decoded.indexOf(':')
  if (separator < 0) {
    return unauthorized()
  }

  const username = decoded.slice(0, separator)
  const password = decoded.slice(separator + 1)

  if (username !== expectedUser || password !== expectedPass) {
    return unauthorized()
  }

  return next()
}

function unauthorized() {
  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'www-authenticate': 'Basic realm="Private Blog", charset="UTF-8"'
    }
  })
}
