import { sleep, wordsFrom, process, speed_limit } from '$tests/helpers/tools'
import { startObject, deltaReasoningObject, deltaObject, finishObject, usageObject } from '$tests/mock/stream_objects/open-ai'

export const POST = async ({ request }) => {
    const { model, messages } = await request.json()

    const { reply, reasoning, input_tokens, output_tokens, reasoning_tokens, is_delay_test, is_slow_test } = process(messages)

    if (is_delay_test) await sleep(2000)

    const stream = new ReadableStream({
        async start(controller) {
            const encoder         = new TextEncoder(),
                  enqueue         = (data) => controller.enqueue(encoder.encode(`data: ${data}\n\n`)),
                  reasoning_words = wordsFrom(reasoning),
                  reply_words     = wordsFrom(reply)

            let json = JSON.stringify(startObject(model))
            enqueue(json)

            if (is_delay_test) await sleep(2000)

            for (let i = 0; i < reasoning_words.length; i++) {
                json = JSON.stringify(deltaReasoningObject(model, reasoning_words[i]))
                enqueue(json)
                await sleep(is_slow_test ? speed_limit.slow : speed_limit.fast)
            }

            for (let i = 0; i < reply_words.length; i++) {
                json = JSON.stringify(deltaObject(model, reply_words[i]))
                enqueue(json)
                await sleep(is_slow_test ? speed_limit.slow : speed_limit.fast)
            }

            json = JSON.stringify(finishObject(model))
            enqueue(json)

            json = JSON.stringify(usageObject(model, input_tokens, output_tokens, reasoning_tokens))
            enqueue(json)

            enqueue('[DONE]')
            controller.close()
        }
    })

    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream' }
    })
}
