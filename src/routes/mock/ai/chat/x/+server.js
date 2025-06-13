import { sleep, wordsFrom, getUsage } from '$tests/helpers/tools'
import { basic_prompt, basic_response } from '$tests/mock/prompts/basic_response'
import { basic_reasoning_prompt, basic_reasoning, basic_reasoning_response } from '$tests/mock/prompts/basic_reasoning'
import { startObject, deltaReasoningObject, deltaObject, finishObject, usageObject } from '$tests/mock/stream_objects/open-ai'

export const POST = async ({ request }) => {
    const { model, messages } = await request.json()

    const ai_reasoning = getAIReasoning(messages),
          ai_response  = getAIResponse(messages)

    const { input_tokens, output_tokens, reasoning_tokens } = getUsage(messages, ai_reasoning, ai_response)

    const stream = new ReadableStream({
        async start(controller) {
            const encoder         = new TextEncoder(),
                  enqueue         = (data) => controller.enqueue(encoder.encode(`data: ${data}\n\n`)),
                  reasoning_words = wordsFrom(ai_reasoning),
                  response_words  = wordsFrom(ai_response)

            let json = JSON.stringify(startObject(model))
            enqueue(json)

            for (let i = 0; i < reasoning_words.length; i++) {
                json = JSON.stringify(deltaReasoningObject(model, reasoning_words[i]))
                enqueue(json)
                await sleep(25)
            }

            for (let i = 0; i < response_words.length; i++) {
                json = JSON.stringify(deltaObject(model, response_words[i]))
                enqueue(json)
                await sleep(25)
            }

            json = JSON.stringify(finishObject(model))
            enqueue(json)

            json = JSON.stringify(usageObject(model, input_tokens, output_tokens, reasoning_tokens))
            enqueue(json)

            enqueue('[DONE]')
            controller.close()
        }
    })

    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream' }
    })
}

const getAIReasoning = (messages) => {
    let reasoning = ''

    const prompt = messages[messages.length - 1].content

    if (prompt === basic_reasoning_prompt) {
        reasoning = basic_reasoning
    }

    return reasoning
}

const getAIResponse = (messages) => {
    let ai_response

    const prompt = messages[messages.length - 1].content

    if (prompt === basic_prompt) {
        ai_response = basic_response
    } else if (prompt === basic_reasoning_prompt) {
        ai_response = basic_reasoning_response
    } else {
        ai_response = '💩'
    }

    return ai_response
}
