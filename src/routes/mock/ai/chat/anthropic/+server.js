import { sleep, wordsFrom, process, speed_limit } from '$tests/helpers/tools'
import { messageStartObject, thinkingStartObject, thinkingDeltaObject, signatureDeltaObject, textStartObject, textDeltaObject, contentBlockStopObject, messageDeltaObject, messageStopObject } from '$tests/mock/stream_objects/anthropic'

export const POST = async ({ request }) => {
    const { model, messages, thinking } = await request.json()

    const mapped_messages = messages.map(message => ({ content: message.content[0].text })) // map to OpenAI format

    const { reply, reasoning, input_tokens, output_tokens, is_delay_test, is_slow_test } = process(mapped_messages)

    let is_thinking_test = thinking?.type === 'enabled'

    if (is_delay_test) await sleep(2000)

    const stream = new ReadableStream({
        async start(controller) {
            const encoder         = new TextEncoder(),
                  enqueue         = (data) => controller.enqueue(encoder.encode(`data: ${data}\n\n`)),
                  reasoning_words = wordsFrom(reasoning),
                  reply_words     = wordsFrom(reply)
            
            let json = JSON.stringify(messageStartObject(model, input_tokens))
            enqueue(json)

            if (is_delay_test) await sleep(2000)

            if (is_thinking_test) {
                json = JSON.stringify(thinkingStartObject())
                enqueue(json)

                for (let i = 0; i < reasoning_words.length; i++) {
                    json = JSON.stringify(thinkingDeltaObject(reasoning_words[i]))
                    enqueue(json)
                    await sleep(is_slow_test ? speed_limit.slow : speed_limit.fast)
                }

                json = JSON.stringify(signatureDeltaObject())
                enqueue(json)

                json = JSON.stringify(contentBlockStopObject())
                enqueue(json)
            }

            json = JSON.stringify(textStartObject())
            enqueue(json)

            for (let i = 0; i < reply_words.length; i++) {
                json = JSON.stringify(textDeltaObject(reply_words[i]))
                enqueue(json)
                await sleep(is_slow_test ? speed_limit.slow : speed_limit.fast)
            }

            json = JSON.stringify(contentBlockStopObject())
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
