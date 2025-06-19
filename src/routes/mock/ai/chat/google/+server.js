import { sleep, wordsFrom, getUsage } from '$tests/helpers/tools'
import { getAIReply, getAIReasoning } from '$tests/helpers/prompt-map'
import { speed_limit } from '$tests/helpers/defaults'
import { startObject, partObject, partThoughtObject, finishObject } from '$tests/mock/stream_objects/google'

export const POST = async ({ request }) => {
    const { model, contents } = await request.json()

    const mapped_messages = contents.map(c => ({ content: c.parts[0].text })),   // map to OpenAI format for getUsage()
          prompt          = mapped_messages[mapped_messages.length - 1].content,
          reasoning       = getAIReasoning(prompt),
          reply           = getAIReply(prompt)

    const { input_tokens, output_tokens, reasoning_tokens } = getUsage(mapped_messages, reply, reasoning)

    const stream = new ReadableStream({
        async start(controller) {
            const encoder         = new TextEncoder(),
                  enqueue         = (data) => controller.enqueue(encoder.encode(`data: ${data}\n\n`)),
                  reasoning_words = wordsFrom(reasoning),
                  reply_words     = wordsFrom(reply)

            let json = JSON.stringify(startObject(model, input_tokens))
            enqueue(json)

            const chunk_size = 5

            for (let i = 0; i < reasoning_words.length; i += chunk_size) {
                const chunk = reasoning_words.slice(i, i + chunk_size).join(' ')
                json = JSON.stringify(partThoughtObject(model, chunk, input_tokens))
                enqueue(json)
                await sleep(speed_limit.fast)
            }

            for (let i = 0; i < reply_words.length; i += chunk_size) {
                const chunk = reply_words.slice(i, i + chunk_size).join(' ')
                if (i + chunk_size >= reply_words.length) {
                    json = JSON.stringify(finishObject(model, chunk, input_tokens, output_tokens, reasoning_tokens))
                } else {
                    json = JSON.stringify(partObject(model, chunk, input_tokens))
                }
                enqueue(json)
                await sleep(speed_limit.fast)
            }

            enqueue('[DONE]')
            controller.close()
        }
    })

    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream' }
    })
}
