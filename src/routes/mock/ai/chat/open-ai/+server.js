import { sleep, wordsFrom, process, speed_limit } from '$tests/helpers/tools'
import { createdObject, outputTextDeltaObject, outputItemDoneObject, reasoningSummaryTextDeltaObject, completedObject } from '$tests/mock/stream_objects/open-ai-responses-api'

export const POST = async ({ request }) => {
    const { model, input: messages } = await request.json()

    const { reply, reasoning, input_tokens, output_tokens, reasoning_tokens, is_delay_test, is_slow_test } = process(messages)

    if (is_delay_test) await sleep(2000)

    const stream = new ReadableStream({
        async start(controller) {
            const encoder         = new TextEncoder(),
                  enqueue         = (data) => controller.enqueue(encoder.encode(`data: ${data}\n\n`)),
                  reasoning_words = wordsFrom(reasoning),
                  reply_words     = wordsFrom(reply)
                
            let sequence_number = 0

            let json = JSON.stringify(createdObject(model))
            enqueue(json)

            if (is_delay_test) await sleep(2000)

            for (let i = 0; i < reasoning_words.length; i++) {
                sequence_number++
                json = JSON.stringify(reasoningSummaryTextDeltaObject(reasoning_words[i], sequence_number))
                enqueue(json)
                await sleep(is_slow_test ? speed_limit.slow : speed_limit.fast)
            }

            for (let i = 0; i < reply_words.length; i++) {
                sequence_number++
                json = JSON.stringify(outputTextDeltaObject(reply_words[i], sequence_number))
                enqueue(json)
                await sleep(is_slow_test ? speed_limit.slow : speed_limit.fast)
            }

            sequence_number++
            json = JSON.stringify(outputItemDoneObject(reply, sequence_number))
            enqueue(json)

            sequence_number++
            json = JSON.stringify(completedObject(model, reply, input_tokens, output_tokens, reasoning_tokens))
            enqueue(json)

            enqueue('[DONE]')
            controller.close()
        }
    })
 
    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream' }
    })
}
