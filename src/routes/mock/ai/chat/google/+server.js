import { sleep } from '$tests/helpers/tools'
import { Tiktoken } from 'tiktoken/lite'
import cl100k_base from 'tiktoken/encoders/cl100k_base.json'
import { prompt as basic_prompt, response as basic_response } from '$tests/mock/prompts/basic_response'
import { prompt as basic_reasoning_prompt, reasoning as basic_reasoning, response as basic_reasoning_response } from '$tests/mock/prompts/basic_reasoning'
import { startObject, partObject, partThoughtObject, finishObject } from '$tests/mock/stream_objects/google'

export const POST = async ({ request }) => {
    const { model, contents } = await request.json()

    const ai_reasoning = getAIReasoning(contents),
          ai_response  = getAIResponse(contents)

    const { input_tokens, output_tokens } = getUsage(contents, ai_response)

    const stream = new ReadableStream({
        async start(controller) {
            const encoder         = new TextEncoder(),
                  enqueue         = (data) => controller.enqueue(encoder.encode(`data: ${data}\n\n`)),
                  reasoning_words = wordsFrom(ai_reasoning),
                  response_words  = wordsFrom(ai_response)

            let json = JSON.stringify(startObject(model, input_tokens))
            enqueue(json)

            const chunk_size = 5

            for (let i = 0; i < reasoning_words.length; i += chunk_size) {
                const chunk = reasoning_words.slice(i, i + chunk_size).join(' ')
                json = JSON.stringify(partThoughtObject(model, chunk, input_tokens))
                enqueue(json)
                await sleep(25)
            }

            for (let i = 0; i < response_words.length; i += chunk_size) {
                const chunk = response_words.slice(i, i + chunk_size).join(' ')
                if (i + chunk_size >= response_words.length) {
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

const getAIReasoning = (contents) => {
    let reasoning = ''

    const prompt = contents[contents.length - 1]?.parts[0]?.text

    if (prompt === basic_reasoning_prompt) {
        reasoning = basic_reasoning
    }

    return reasoning
}

const getAIResponse = (contents) => {
    let response

    const prompt = contents[contents.length - 1]?.parts[0]?.text

    if (prompt === basic_prompt) {
        response = basic_response
    } else if (prompt === basic_reasoning_prompt) {
        response = basic_reasoning_response
    } else {
        response = '💩'
    }

    return response
}

const wordsFrom = (text) => {
    return text.split(' ').map((word, i, arr) => word + (i === arr.length - 1 ? '' : ' '))
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
