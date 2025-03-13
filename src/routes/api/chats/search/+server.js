import { json } from '@sveltejs/kit'
import PocketBase from 'pocketbase'
import { POCKETBASE_URL } from '$lib/config'

export const GET = async ({ url }) => {
    try {
        const pb       = new PocketBase(POCKETBASE_URL),
              filter   = url.searchParams.get('filter'),
              page     = Number(url.searchParams.get('page') ?? 1),
              per_page = Number(url.searchParams.get('per_page') ?? 20),
              query    = url.searchParams.get('query') ?? ''

        const search_terms  = query.split(' ').filter(term => term.trim().length > 0)

        let filter_string = search_terms.map(term => `messages ~ "${term}"`).join(' && ')
        if (filter === 'starred') filter_string += ` && stars.0 != null || highlights.0 != null`
        if (filter === 'non-default') filter_string += ` && messages.0.is_default = false`

        const data = await pb.collection('chats').getList(page, per_page, {
            filter: filter_string,
            sort:   '-updated'
        })

        // TODO: If query string matches on json keys,
        //       then handle further filtering of these
        //       special cases manually

        return json(data, { status: 200 })
    } catch (error) {
        return json(error, { status: error.status })
    }
}
