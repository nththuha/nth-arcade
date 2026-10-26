const CORS = { 'Access-Control-Allow-Origin': '*' }

export function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS, ...headers },
  })
}

export function apiError(
  status: number,
  code: string,
  message: string,
  hint: string,
  headers = {},
) {
  return json({ error: { code, message, hint } }, status, headers)
}

export function methodNotAllowed(allow: string) {
  return apiError(
    405,
    'method_not_allowed',
    'This endpoint does not support the requested HTTP method.',
    `Use one of: ${allow}. See /openapi.json for the full API description.`,
    { Allow: allow },
  )
}
