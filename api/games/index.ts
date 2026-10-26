import { json, methodNotAllowed } from '../_http.js'
import { listGames } from '../_site.js'

export default {
  fetch(request: Request) {
    if (request.method !== 'GET') return methodNotAllowed('GET')
    return json({ games: listGames() })
  },
}
