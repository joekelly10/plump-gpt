import { sleep, wordsFrom, getUsage } from '$tests/helpers/tools'
import { basic_prompt, basic_response } from '$tests/mock/prompts/basic_response'
import { messageStartObject, contentStartObject, contentDeltaObject, contentStopObject, messageDeltaObject, messageStopObject } from '$tests/mock/stream_objects/anthropic'

export const POST = async ({ request }) => {
    const { model, messages } = await request.json()

    const ai_response     = getAIResponse(messages),
          mapped_messages = messages.map(message => ({ content: message.content[0].text })) // map to OpenAI format for getUsage()

    const { input_tokens, output_tokens } = getUsage(mapped_messages, ai_response)

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder(),
                  enqueue = (data) => controller.enqueue(encoder.encode(`data: ${data}\n\n`)),
                  words   = wordsFrom(ai_response)
            
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

const getAIResponse = (messages) => {
    let ai_response

    const prompt = messages[messages.length - 1].content[0].text

    if (prompt === basic_prompt) {
        ai_response = basic_response
    } else {
        ai_response = '💩'
    }

    return ai_response
}
