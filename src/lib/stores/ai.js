import { writable } from 'svelte/store'
import { browser } from '$app/environment'

export const model       = createModel()
export const temperature = writable(0.7)
export const top_p       = writable(1)

function createModel() {
    const models = [
        {
            type:           'open-ai',
            id:             'gpt-4.1-nano',
            name:           'GPT-4.1 nano',
            short_name:     'GPT-4.1 nano',
            icon:           'gpt-4.1-nano.png',
            hosted_at:      'openai.com',
            context_window: 1000000,
            pricing_id:     'gpt-4.1-nano'
        },
        {
            type:           'open-ai',
            id:             'gpt-4.1-mini',
            name:           'GPT-4.1 mini',
            short_name:     'GPT-4.1 mini',
            icon:           'gpt-4.1-mini.png',
            hosted_at:      'openai.com',
            context_window: 1000000,
            pricing_id:     'gpt-4.1-mini'
        },
        {
            type:           'open-ai',
            id:             'gpt-4.1',
            name:           'GPT-4.1',
            short_name:     'GPT-4.1',
            icon:           'gpt-4.1.png',
            hosted_at:      'openai.com',
            context_window: 1000000,
            pricing_id:     'gpt-4.1'
        },
        // {
        //     type:           'openrouter',
        //     id:             'openai/o3-mini',
        //     name:           'o3-mini',
        //     short_name:     'o3-mini',
        //     icon:           'o3-mini.png',
        //     hosted_at:      'openrouter.ai',
        //     context_window: 128000,
        //     pricing_id:     'o3-mini'
        // },
        {
            type:           'anthropic',
            id:             'claude-3-5-haiku-latest',
            name:           'Claude 3.5 Haiku',
            short_name:     'Claude',
            icon:           'claude-3-haiku.png',
            hosted_at:      'anthropic.com',
            context_window: 200000,
            pricing_id:     'claude-haiku'
        },
        {
            type:           'anthropic',
            id:             'claude-3-7-sonnet-latest',
            name:           'Claude 3.7 Sonnet',
            short_name:     'Claude',
            icon:           'claude-3-sonnet.png',
            hosted_at:      'anthropic.com',
            context_window: 200000,
            pricing_id:     'claude-sonnet'
        },
        {
            type:           'anthropic',
            id:             'claude-3-opus-latest',
            name:           'Claude 3 Opus',
            short_name:     'Claude',
            icon:           'claude-3-opus.png',
            hosted_at:      'anthropic.com',
            context_window: 200000,
            pricing_id:     'claude-opus'
        },
        {
            type:           'google',
            id:             'gemini-2.0-flash-lite',
            name:           'Gemini 2.0 Flash Lite',
            short_name:     'Gemini',
            icon:           'gemini-flash-lite.png',
            hosted_at:      'googleapis.com',
            context_window: 1000000,
            pricing_id:     'free'
        },
        {
            type:           'google',
            id:             'gemini-2.0-flash',
            name:           'Gemini 2.0 Flash',
            short_name:     'Gemini',
            icon:           'gemini-flash.png',
            hosted_at:      'googleapis.com',
            context_window: 1000000,
            pricing_id:     'free'
        },
        {
            type:           'google',
            id:             'gemini-2.0-flash-thinking-exp-01-21',
            name:           'Gemini 2.0 Flash Thinking',
            short_name:     'Gemini',
            icon:           'gemini-flash-thinking.png',
            hosted_at:      'googleapis.com',
            context_window: 1000000,
            pricing_id:     'free'
        },
        {
            type:           'google',
            id:             'gemini-2.5-pro-exp-03-25',
            name:           'Gemini 2.5 Pro',
            short_name:     'Gemini',
            icon:           'gemini-pro.png',
            hosted_at:      'googleapis.com',
            context_window: 1000000,
            pricing_id:     'gemini-2.5-pro'
        },
        {
            type:           'x',
            id:             'grok-3-mini-beta',
            name:           'Grok 3 Mini',
            short_name:     'Grok',
            icon:           'grok-mini.png',
            hosted_at:      'x.ai',
            context_window: 131072,
            pricing_id:     'grok-3-mini'
        },
        {
            type:           'x',
            id:             'grok-3-beta',
            name:           'Grok 3',
            short_name:     'Grok',
            icon:           'grok.png',
            hosted_at:      'x.ai',
            context_window: 131072,
            pricing_id:     'grok-3'
        },
        {
            type:           'cohere',
            id:             'command-r',
            name:           'Command R',
            short_name:     'Command R',
            icon:           'command-r.png',
            hosted_at:      'cohere.com',
            context_window: 128000,
            pricing_id:     'command-r'
        },
        {
            type:           'cohere',
            id:             'command-r-plus-08-2024',
            name:           'Command R+',
            short_name:     'Command R+',
            icon:           'command-r-plus.png',
            hosted_at:      'cohere.com',
            context_window: 128000,
            pricing_id:     'command-r-plus'
        },
        {
            type:           'openrouter',
            id:             'meta-llama/llama-4-scout:free',
            name:           'Llama 4 Scout (free)',
            short_name:     'Llama 4 Scout',
            icon:           'llama-light.png',
            hosted_at:      'openrouter.ai',
            context_window: 512000,
            pricing_id:     'free'
        },
        {
            type:           'openrouter',
            id:             'meta-llama/llama-4-maverick:free',
            name:           'Llama 4 Maverick (free)',
            short_name:     'Llama 4 Maverick',
            icon:           'llama-medium.png',
            hosted_at:      'openrouter.ai',
            context_window: 128000,
            pricing_id:     'free'
        },
        {
            type:           'openrouter',
            id:             'meta-llama/llama-3.1-405b-instruct',
            name:           'Llama 3.1 405b',
            short_name:     'Llama 405b',
            icon:           'llama-heavy.png',
            hosted_at:      'openrouter.ai',
            context_window: 33000,
            pricing_id:     'llama-3-405b'
        },
        {
            type:           'openrouter',
            id:             'nousresearch/hermes-3-llama-3.1-405b',
            name:           'Nous Hermes 3 405b',
            short_name:     'Hermes',
            icon:           'nous-hermes.png',
            hosted_at:      'openrouter.ai',
            context_window: 131000,
            pricing_id:     'llama-3-405b'
        },
        // {
        //     type:           'groq',
        //     id:             'llama-3.3-70b-versatile',
        //     name:           'Groq Llama 70b Versatile',
        //     short_name:     'Llama',
        //     icon:           'groq-llama.png',
        //     hosted_at:      'Groq',
        //     context_window: 128000,
        //     pricing_id:     'free'
        // },
        // {
        //     type:           'groq',
        //     id:             'deepseek-r1-distill-llama-70b',
        //     name:           'Groq R1 Distill 70b',
        //     short_name:     'R1',
        //     icon:           'groq-r1.png',
        //     hosted_at:      'Groq',
        //     context_window: 128000,
        //     is_reasoner:    true,
        //     pricing_id:     'free'
        // },
        {
            type:           'mistral',
            id:             'mistral-small',
            name:           'Mistral Small',
            short_name:     'Mistral',
            icon:           'mistral-small.png',
            hosted_at:      'mistral.ai',
            context_window: 32000,
            pricing_id:     'free'
        },
        {
            type:           'mistral',
            id:             'mistral-large-latest',
            name:           'Mistral Large',
            short_name:     'Mistral',
            icon:           'mistral-large.png',
            hosted_at:      'mistral.ai',
            context_window: 131000,
            pricing_id:     'free'
        },
        {
            type:           'ai21',
            id:             'jamba-mini',
            name:           'Jamba 1.6 Mini',
            short_name:     'Jamba',
            icon:           'jamba-mini.png',
            hosted_at:      'ai21.com',
            context_window: 256000,
            pricing_id:     'jamba-1.6-mini'
        },
        {
            type:           'ai21',
            id:             'jamba-large',
            name:           'Jamba 1.6 Large',
            short_name:     'Jamba',
            icon:           'jamba-large.png',
            hosted_at:      'ai21.com',
            context_window: 256000,
            pricing_id:     'jamba-1.6-large'
        },
        {
            type:           'openrouter',
            id:             'qwen/qwen-turbo',
            name:           'Qwen 2.5 Turbo',
            short_name:     'Qwen',
            icon:           'qwen-turbo.png',
            hosted_at:      'openrouter.ai',
            context_window: 1000000,
            pricing_id:     'qwen-turbo'
        },
        {
            type:           'openrouter',
            id:             'qwen/qwen-plus',
            name:           'Qwen 2.5 Plus',
            short_name:     'Qwen',
            icon:           'qwen-plus.png',
            hosted_at:      'openrouter.ai',
            context_window: 1000000,
            pricing_id:     'qwen-plus'
        },
        {
            type:           'openrouter',
            id:             'qwen/qwen-max',
            name:           'Qwen 2.5 Max',
            short_name:     'Qwen',
            icon:           'qwen-max.png',
            hosted_at:      'openrouter.ai',
            context_window: 32000,
            pricing_id:     'qwen-max'
        },
        {
            type:           'openrouter',
            id:             'deepseek/deepseek-chat-v3-0324:free',
            name:           'DeepSeek V3 (free)',
            short_name:     'V3',
            icon:           'deepseek-chat.png',
            hosted_at:      'openrouter.ai',
            context_window: 64000,
            pricing_id:     'free'
        },
        {
            type:           'deepseek',
            id:             'deepseek-chat',
            name:           'DeepSeek V3',
            short_name:     'V3',
            icon:           'deepseek-chat.png',
            hosted_at:      'deepseek.com',
            context_window: 64000,
            pricing_id:     'deepseek-chat'
        },
        {
            type:           'deepseek',
            id:             'deepseek-reasoner',
            name:           'DeepSeek R1',
            short_name:     'R1',
            icon:           'deepseek-reasoner.png',
            hosted_at:      'deepseek.com',
            context_window: 64000,
            pricing_id:     'deepseek-reasoner'
        }
    ]

    const { subscribe, set, update } = writable(models[0])

    return {
        subscribe,
        set,
        next: () => {
            update(value => {
                let i = models.findIndex(m => m.id === value.id)
                return (i === models.length - 1) ? models[0] : models[i + 1]
            })
        },
        prev: () => {
            update(value => {
                let i = models.findIndex(m => m.id === value.id)
                return (i === 0) ? models[models.length - 1] : models[i - 1]
            })
        },
        setById: (id) => {
            const model = models.find(m => m.id === id)
            if (model) set(model)
        }
    }
}

if (browser) {
    const stored_temperature = Number(localStorage.getItem('temperature'))
    const stored_top_p       = Number(localStorage.getItem('top_p'))

    if (stored_temperature) temperature.set(stored_temperature)
    if (stored_top_p) top_p.set(stored_top_p)

    temperature.subscribe(value => localStorage.setItem('temperature', value))
    top_p.subscribe(value => localStorage.setItem('top_p', value))
}
