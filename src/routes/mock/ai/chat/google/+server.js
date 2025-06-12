import { sleep } from '$tests/helpers/tools'
import { Tiktoken } from 'tiktoken/lite'
import cl100k_base from 'tiktoken/encoders/cl100k_base.json'
import { startObject, partObject, finishObject } from '$tests/mock/stream_objects/google'

export const POST = async ({ request }) => {
    const { model, contents } = await request.json()

    const ai_response = getAIResponse(contents)

    const { input_tokens, output_tokens } = getUsage(contents, ai_response)

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder(),
                  enqueue = (data) => controller.enqueue(encoder.encode(`data: ${data}\n\n`)),
                  words   = ai_response.split(' ').map((word, i, arr) => word + (i === arr.length - 1 ? '' : ' '))

            let json = JSON.stringify(startObject(model, words[0],input_tokens))
            enqueue(json)

            const chunk_size = 5
            //
            //  - take all words except first
            //  - break into chunks of N words
            //  - if it's the last chunk, send as finishObject
            //
            for (let i = 1; i < words.length; i += chunk_size) {
                const chunk = words.slice(i, i + chunk_size).join(' ')
                if (i + chunk_size >= words.length) {
                    json = JSON.stringify(finishObject(model, chunk, input_tokens, output_tokens))
                } else {
                    json = JSON.stringify(partObject(model, chunk, input_tokens))
                }
                enqueue(json)
                await sleep(25)
            }

            enqueue('[DONE]')
            controller.close()
        }
    })

    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream' }
    })
}

const getAIResponse = (contents) => {
    let ai_response

    const prompt = contents[contents.length - 1]?.parts[0]?.text

    if (prompt === 'Wake up, Gemini') {
        ai_response = 'What the hell?'
    } else {
        ai_response = '💩'
    }

    return ai_response
}

const getUsage = (contents, ai_response) => {
    let input_tokens  = 0,
        output_tokens = 0

    const encoding = new Tiktoken(
        cl100k_base.bpe_ranks,
        cl100k_base.special_tokens,
        cl100k_base.pat_str
    )

    output_tokens = encoding.encode(ai_response).length

    for (const content of contents) {
        input_tokens += encoding.encode(content.parts[0].text).length
    }

    encoding.free()

    return { input_tokens, output_tokens }
}
