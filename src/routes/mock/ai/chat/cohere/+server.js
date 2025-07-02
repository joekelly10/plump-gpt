import { sleep, wordsFrom, process, speed_limit } from '$tests/helpers/tools'
import { messageStartObject, contentStartObject, contentDeltaObject, contentEndObject, messageEndObject } from '$tests/mock/stream_objects/cohere'

export const POST = async ({ request }) => {
    const { model, messages } = await request.json()

    const { reply, input_tokens, output_tokens, is_delay_test, is_slow_test } = process(messages)

    if (is_delay_test) await sleep(2000)

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder(),
                  enqueue = (data) => controller.enqueue(encoder.encode(`data: ${data}\n\n`)),
                  words   = wordsFrom(reply)

            let json = JSON.stringify(messageStartObject())
            enqueue(json)

            if (is_delay_test) await sleep(2000)

            json = JSON.stringify(contentStartObject())
            enqueue(json)

            for (let i = 0; i < words.length; i++) {
                json = JSON.stringify(contentDeltaObject(words[i]))
                enqueue(json)
                await sleep(is_slow_test ? speed_limit.slow : speed_limit.fast)
            }

            json = JSON.stringify(contentEndObject())
            enqueue(json)

            json = JSON.stringify(messageEndObject(input_tokens, output_tokens))
            enqueue(json)

            enqueue('[DONE]')
            controller.close()
        }
    })

    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream' }
    })
}
