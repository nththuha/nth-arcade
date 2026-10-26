import { apiError } from './_http.js'
import { PAGES, notFoundPage, toHtml, toMarkdown } from './_pages.js'

const VARY = { Vary: 'Accept' }

export default {
  fetch(request: Request) {
    const url = new URL(request.url)
    const raw = url.searchParams.get('path') ?? url.pathname
    const path = `/${raw.replace(/^\/+|\/+$/g, '')}`

    if (path === '/api' || path.startsWith('/api/')) {
      return apiError(
        404,
        'endpoint_not_found',
        `No API endpoint exists at ${path}.`,
        'Available endpoints: GET /api/games, GET /api/games/{id}, POST /api/mcp. See /openapi.json.',
        VARY,
      )
    }

    const page = PAGES.find((candidate) => candidate.path === path)
    const status = page ? 200 : 404
    const resolved = page ?? notFoundPage(path)

    if ((request.headers.get('accept') ?? '').includes('text/markdown')) {
      return new Response(toMarkdown(resolved), {
        status,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8', ...VARY },
      })
    }
    return new Response(toHtml(resolved, status), {
      status,
      headers: { 'Content-Type': 'text/html; charset=utf-8', ...VARY },
    })
  },
}
