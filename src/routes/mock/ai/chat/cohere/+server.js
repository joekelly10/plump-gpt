import { sleep, wordsFrom, getUsage } from '$tests/helpers/tools'
import { getAIReply } from '$tests/helpers/prompt-map'
import { messageStartObject, contentStartObject, contentDeltaObject, contentEndObject, messageEndObject } from '$tests/mock/stream_objects/cohere'

export const POST = async ({ request }) => {
    const { model, messages } = await request.json()

    const prompt = messages[messages.length - 1].content,
          reply  = getAIReply(prompt)

    const { input_tokens, output_tokens } = getUsage(messages, reply)

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder(),
                  enqueue = (data) => controller.enqueue(encoder.encode(`data: ${data}\n\n`)),
                  words   = wordsFrom(reply)

            let json = JSON.stringify(messageStartObject())
            enqueue(json)

            json = JSON.stringify(contentStartObject())
            enqueue(json)

            for (let i = 0; i < words.length; i++) {
                json = JSON.stringify(contentDeltaObject(words[i]))
                enqueue(json)
                await sleep(25)
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
