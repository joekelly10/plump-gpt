import { sleep, wordsFrom, getUsage } from '$tests/helpers/tools'
import { getAIReply, getAIReasoning } from '$tests/helpers/prompt-map'
import { speed_limit } from '$tests/helpers/defaults'
import { startObject, deltaObject, finishObject, usageObject } from '$tests/mock/stream_objects/open-ai'

export const POST = async ({ request }) => {
    const { model, messages } = await request.json()

    const prompt    = messages[messages.length - 1].content,
          reasoning = getAIReasoning(prompt),
          reply     = getAIReply(prompt)

    const { input_tokens, output_tokens, reasoning_tokens } = getUsage(messages, reply, reasoning)

    const stream = new ReadableStream({
        async start(controller) {
            const encoder         = new TextEncoder(),
                  enqueue         = (data) => controller.enqueue(encoder.encode(`data: ${data}\n\n`)),
                  reasoning_words = wordsFrom(reasoning),
                  reply_words     = wordsFrom(reply)

            let json = JSON.stringify(startObject(model))
            enqueue(json)

            if (reasoning.length > 0) {
                enqueue(JSON.stringify(deltaObject(model, '<think>')))
                for (let i = 0; i < reasoning_words.length; i++) {
                    json = JSON.stringify(deltaObject(model, reasoning_words[i]))
                    enqueue(json)
                    await sleep(speed_limit.fast)
                }
                enqueue(JSON.stringify(deltaObject(model, '</think>')))
            }

            for (let i = 0; i < reply_words.length; i++) {
                json = JSON.stringify(deltaObject(model, reply_words[i]))
                enqueue(json)
                await sleep(speed_limit.fast)
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
