import { apiError, json, methodNotAllowed } from '../_http.js'
import { findGame, listGames } from '../_site.js'

export default {
  fetch(request: Request) {
    if (request.method !== 'GET') return methodNotAllowed('GET')
    const id = decodeURIComponent(
      new URL(request.url).pathname.split('/').filter(Boolean).pop() ?? '',
    )
    const game = findGame(id)
    if (!game) {
      return apiError(
        404,
        'game_not_found',
        `No game with id "${id}" exists.`,
        `Valid ids: ${listGames()
          .map((item) => item.id)
          .join(', ')}. Call GET /api/games to list them.`,
      )
    }
    return json(game)
  },
}
