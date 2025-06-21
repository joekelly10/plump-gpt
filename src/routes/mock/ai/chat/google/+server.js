import { sleep, wordsFrom, process } from '$tests/helpers/tools'
import { speed_limit } from '$tests/helpers/defaults'
import { startObject, partObject, partThoughtObject, finishObject } from '$tests/mock/stream_objects/google'

export const POST = async ({ request }) => {
    const { model, contents } = await request.json()

    const mapped_messages = contents.map(c => ({ content: c.parts[0].text })) // map to OpenAI format for getUsage()

    const { reply, reasoning, input_tokens, output_tokens, reasoning_tokens, is_delay_test, is_slow_test } = process(mapped_messages)

    if (is_delay_test) await sleep(2000)

    const stream = new ReadableStream({
        async start(controller) {
            const encoder         = new TextEncoder(),
                  enqueue         = (data) => controller.enqueue(encoder.encode(`data: ${data}\n\n`)),
                  reasoning_words = wordsFrom(reasoning),
                  reply_words     = wordsFrom(reply)

            let json = JSON.stringify(startObject(model, input_tokens))
            enqueue(json)

            if (is_delay_test) await sleep(2000)

            const chunk_size = 5

            for (let i = 0; i < reasoning_words.length; i += chunk_size) {
                const chunk = reasoning_words.slice(i, i + chunk_size).join(' ')
                json = JSON.stringify(partThoughtObject(model, chunk, input_tokens))
                enqueue(json)
                await sleep(is_slow_test ? speed_limit.slow : speed_limit.fast)
            }

            for (let i = 0; i < reply_words.length; i += chunk_size) {
                const chunk = reply_words.slice(i, i + chunk_size).join(' ')
                if (i + chunk_size >= reply_words.length) {
                    json = JSON.stringify(finishObject(model, chunk, input_tokens, output_tokens, reasoning_tokens))
                } else {
                    json = JSON.stringify(partObject(model, chunk, input_tokens))
                }
                enqueue(json)
                await sleep(is_slow_test ? speed_limit.slow : speed_limit.fast)
            }

            enqueue('[DONE]')
            controller.close()
        }
    })

    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream' }
    })
}
