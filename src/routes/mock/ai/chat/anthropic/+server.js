import { sleep, wordsFrom, getUsage } from '$tests/helpers/tools'
import { getAIReply } from '$tests/helpers/prompt-map'
import { messageStartObject, contentStartObject, contentDeltaObject, contentStopObject, messageDeltaObject, messageStopObject } from '$tests/mock/stream_objects/anthropic'

export const POST = async ({ request }) => {
    const { model, messages } = await request.json()

    const mapped_messages = messages.map(message => ({ content: message.content[0].text })),  // map to OpenAI format for getUsage()
          prompt          = mapped_messages[mapped_messages.length - 1].content,
          reply           = getAIReply(prompt)

    const { input_tokens, output_tokens } = getUsage(mapped_messages, reply)

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder(),
                  enqueue = (data) => controller.enqueue(encoder.encode(`data: ${data}\n\n`)),
                  words   = wordsFrom(reply)
            
            let json = JSON.stringify(messageStartObject(model, input_tokens))
            enqueue(json)

            json = JSON.stringify(contentStartObject())
            enqueue(json)

            for (let i = 0; i < words.length; i++) {
                json = JSON.stringify(contentDeltaObject(words[i]))
                enqueue(json)
                await sleep(25)
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
