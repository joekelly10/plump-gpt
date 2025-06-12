import { sleep } from '$tests/helpers/tools'
import { Tiktoken } from 'tiktoken/lite'
import cl100k_base from 'tiktoken/encoders/cl100k_base.json'
import { startObject, deltaObject, finishObject, usageObject } from '$tests/mock/open-ai'

export const POST = async ({ request }) => {
    const { model, messages } = await request.json()

    const ai_response = getAIResponse(messages)

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder(),
                  enqueue = (data) => controller.enqueue(encoder.encode(`data: ${data}\n\n`)),
                  words   = ai_response.split(' ').map((word, i, arr) => word + (i === arr.length - 1 ? '' : ' '))

            let json = JSON.stringify(startObject(model))
            enqueue(json)

            for (let i = 0; i < words.length; i++) {
                json = JSON.stringify(deltaObject(model, words[i]))
                enqueue(json)
                await sleep(25)
            }

            json = JSON.stringify(finishObject(model))
            enqueue(json)

            const { input_tokens, output_tokens } = getUsage(messages, ai_response)
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

const getAIResponse = (messages) => {
    let ai_response

    const prompt = messages[messages.length - 1].content

    if (prompt === 'Wake up, OpenRouter') {
        ai_response = 'What the hell?'
    } else {
        ai_response = '💩'
    }

    return ai_response
}

const getUsage = (messages, ai_response) => {
    let input_tokens  = 0,
        output_tokens = 0

    const encoding = new Tiktoken(
        cl100k_base.bpe_ranks,
        cl100k_base.special_tokens,
        cl100k_base.pat_str
    )

    output_tokens = encoding.encode(ai_response).length

    for (const message of messages) {
        input_tokens += encoding.encode(message.content).length
    }

    encoding.free()

    return { input_tokens, output_tokens }
}
