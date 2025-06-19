import { sleep, wordsFrom, getUsage } from '$tests/helpers/tools'
import { getAIReply } from '$tests/helpers/prompt-map'
import { speed_limit } from '$tests/helpers/defaults'
import { startObject, deltaObject, finishObject, usageObject } from '$tests/mock/stream_objects/open-ai'

export const POST = async ({ request }) => {
    const { model, messages } = await request.json()

    const prompt        = messages[messages.length - 1].content,
          reply         = getAIReply(prompt),
          is_delay_test = prompt.includes('[DELAY]'),
          is_slow_test  = prompt.includes('[SLOW]')

    if (is_delay_test) await sleep(2500)

    const { input_tokens, output_tokens } = getUsage(messages, reply)

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder(),
                  enqueue = (data) => controller.enqueue(encoder.encode(`data: ${data}\n\n`)),
                  words   = wordsFrom(reply)

            let json = JSON.stringify(startObject(model))
            enqueue(json)

            if (is_delay_test) await sleep(2000)

            for (let i = 0; i < words.length; i++) {
                json = JSON.stringify(deltaObject(model, words[i]))
                enqueue(json)
                await sleep(is_slow_test ? speed_limit.slow : speed_limit.fast)
            }

            json = JSON.stringify(finishObject(model))
            enqueue(json)

            json = JSON.stringify(usageObject(model, input_tokens, output_tokens))
            enqueue(json)

            enqueue('[DONE]')
            controller.close()
        }
    })
 
    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream' }
    })
}
