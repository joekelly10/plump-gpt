import { sleep, wordsFrom, process } from '$tests/helpers/tools'
import { speed_limit } from '$tests/helpers/defaults'
import { messageStartObject, contentStartObject, contentDeltaObject, contentStopObject, messageDeltaObject, messageStopObject } from '$tests/mock/stream_objects/anthropic'

export const POST = async ({ request }) => {
    const { model, messages } = await request.json()

    const mapped_messages = messages.map(message => ({ content: message.content[0].text })) // map to OpenAI format

    const { reply, input_tokens, output_tokens, is_delay_test, is_slow_test } = process(mapped_messages)

    if (is_delay_test) await sleep(2000)

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder(),
                  enqueue = (data) => controller.enqueue(encoder.encode(`data: ${data}\n\n`)),
                  words   = wordsFrom(reply)
            
            let json = JSON.stringify(messageStartObject(model, input_tokens))
            enqueue(json)

            if (is_delay_test) await sleep(2000)

            json = JSON.stringify(contentStartObject())
            enqueue(json)

            for (let i = 0; i < words.length; i++) {
                json = JSON.stringify(contentDeltaObject(words[i]))
                enqueue(json)
                await sleep(is_slow_test ? speed_limit.slow : speed_limit.fast)
            }

            json = JSON.stringify(contentStopObject())
            enqueue(json)

            json = JSON.stringify(messageDeltaObject(output_tokens))
            enqueue(json)

            json = JSON.stringify(messageStopObject())
            enqueue(json)

            enqueue('[DONE]')
            controller.close()
        }
    })

    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream' }
    })
}
