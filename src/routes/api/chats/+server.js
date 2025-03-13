import { json } from '@sveltejs/kit'
import PocketBase from 'pocketbase'
import { POCKETBASE_URL } from '$lib/config'

export const GET = async ({ url }) => {
    try {
        const pb       = new PocketBase(POCKETBASE_URL)
        const filter   = url.searchParams.get('filter')
        const page     = Number(url.searchParams.get('page') ?? 1)
        const per_page = Number(url.searchParams.get('per_page') ?? 20)

        let filter_string = ''
        if (filter === 'starred') filter_string = `stars.0 != null || highlights.0 != null`
        if (filter === 'non-default') filter_string = `messages.0.is_default = false`

        const data = await pb.collection('chats').getList(page, per_page, {
            filter: filter_string,
            sort:   '-updated'
        })

        return json(data, { status: 200 })
    } catch (error) {
        return json(error, { status: error.status })
    }
}
