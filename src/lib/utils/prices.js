const model_prices = {
    'gpt-5-nano': {
        price: {
            cents: {
                input_token:   5/1000000, // $0.05/mTok
                output_token: 40/1000000
            }
        }
    },
    'gpt-5-mini': {
        price: {
            cents: {
                input_token:   25/1000000, // $0.25/mTok
                output_token: 100/1000000
            }
        }
    },
    'gpt-5': {
        price: {
            cents: {
                input_token:   125/1000000, // $1.25/mTok
                output_token: 1000/1000000
            }
        }
    },
    'gpt-4.1-nano': {
        price: {
            cents: {
                input_token:  10/1000000, // $0.10/mTok
                output_token: 40/1000000
            }
        }
    },
    'gpt-4.1-mini': {
        price: {
            cents: {
                input_token:   40/1000000, // $0.40/mTok
                output_token: 160/1000000
            }
        }
    },
    'gpt-4.1': {
        price: {
            cents: {
                input_token:  200/1000000, // $2.00/mTok
                output_token: 800/1000000
            }
        }
    },
    'o4-mini': {
        price: {
            cents: {
                input_token:  110/1000000, // $1.10/mTok
                output_token: 440/1000000
            }
        }
    },
    'o3': {
        price: {
            cents: {
                input_token:  200/1000000, // $2.00/mTok
                output_token: 800/1000000
            }
        }
    },
    'o3-pro': {
        price: {
            cents: {
                input_token:  2000/1000000, // $20.00/mTok
                output_token: 8000/1000000
            }
        }
    },
    'gpt-oss-20b': {
        price: {
            cents: {
                input_token:   5/1000000, // $0.05/mTok
                output_token: 20/1000000
            }
        }
    },
    'gpt-oss-120b': {
        price: {
            cents: {
                input_token:  15/1000000, // $0.15/mTok
                output_token: 60/1000000
            }
        }
    },
    'claude-haiku': {
        price: {
            cents: {
                input_token:  100/1000000, // $0.80/mTok
                output_token: 500/1000000,
                cache_write:  125/1000000,
                cache_read:    10/1000000
            }
        }
    },
    'claude-sonnet': {
        price: {
            cents: {
                input_token:   300/1000000, // $3.00/mTok
                output_token: 1500/1000000,
                cache_write:   375/1000000,
                cache_read:     30/1000000
            }
        }
    },
    'claude-3-5-sonnet-latest': {
        price: {
            cents: {
                input_token:   300/1000000, // $3.00/mTok
                output_token: 1500/1000000,
                cache_write:   375/1000000,
                cache_read:     30/1000000
            }
        }
    },
    'claude-3-7-sonnet-latest': {
        price: {
            cents: {
                input_token:   300/1000000, // $3.00/mTok
                output_token: 1500/1000000,
                cache_write:   375/1000000,
                cache_read:     30/1000000
            }
        }
    },
    'claude-opus': {
        price: {
            cents: {
                input_token:  1500/1000000, // $15.00/mTok
                output_token: 7500/1000000,
                cache_write:  1875/1000000,
                cache_read:    150/1000000
            }
        }
    },
    'gemini-2.5-flash-lite': {
        price: {
            cents: {
                input_token:  10/1000000, // $0.10/mTok
                output_token: 40/1000000  // $0.40/mTok
            }
        }
    },
    'gemini-2.5-flash': {
        price: {
            cents: {
                input_token:   30/1000000, // $0.30/mTok
                output_token: 250/1000000
            }
        }
    },
    'gemini-2.5-flash-thinking': {
        price: {
            cents: {
                input_token:   30/1000000, // $0.30/mTok
                output_token: 250/1000000
            }
        }
    },
    'gemini-2.5-pro': {
        price: {
            cents: {
                input_token:   125/1000000, // $1.25/mTok
                output_token: 1000/1000000
            }
        }
    },
    'gemini-3-pro': {
        price: {
            cents: {
                input_token:   200/1000000, // $2.00/mTok
                output_token: 1200/1000000
            }
        }
    },
    'grok-3-mini': {
        price: {
            cents: {
                input_token:  30/1000000, // $0.30/mTok
                output_token: 50/1000000
            }
        }
    },
    'grok-4-fast': {
        price: {
            cents: {
                input_token:  20/1000000, // $0.20/mTok
                output_token: 50/1000000
            }
        }
    },
    'grok': {
        price: {
            cents: {
                input_token:   300/1000000, // $3.00/mTok
                output_token: 1500/1000000
            }
        }
    },
    'nova-lite': {
        price: {
            cents: {
                input_token:   6/1000000, // $0.06/mTok
                output_token: 24/1000000
            }
        }
    },
    'nova-pro': {
        price: {
            cents: {
                input_token:   80/1000000, // $0.80/mTok
                output_token: 320/1000000
            }
        }
    },
    'nova-premier': {
        price: {
            cents: {
                input_token:   250/1000000, // $2.50/mTok
                output_token: 1250/1000000
            }
        }
    },
    'command-r': {
        price: {
            cents: {
                input_token:  15/1000000, // $0.15/mTok
                output_token: 60/1000000
            }
        }
    },
    'command-r-plus': {
        price: {
            cents: {
                input_token:   250/1000000, // $2.50/mTok
                output_token: 1000/1000000
            }
        }
    },
    'llama-4-scout': {
        price: {
            cents: {
                input_token:  10/1000000, // $0.10/mTok
                output_token: 30/1000000
            }
        }
    },
    'llama-4-maverick': {
        price: {
            cents: {
                input_token:  20/1000000, // $0.20/mTok
                output_token: 60/1000000
            }
        }
    },
    'llama-3-405b': {
        price: {
            cents: {
                input_token:  80/1000000, // $0.80/mTok
                output_token: 80/1000000
            }
        }
    },
    'qwen-turbo': {
        price: {
            cents: {
                input_token:   5/1000000, // $0.05/mTok
                output_token: 20/1000000
            }
        }
    },
    'qwen-a3b': {
        price: {
            cents: {
                input_token:   6/1000000, // $0.06/mTok
                output_token: 22/1000000
            }
        }
    },
    'qwen-plus': {
        price: {
            cents: {
                input_token:   40/1000000, // $0.40/mTok
                output_token: 400/1000000
            }
        }
    },
    'qwen-max': {
        price: {
            cents: {
                input_token:  120/1000000, // $1.20/mTok
                output_token: 600/1000000
            }
        }
    },
    'deepseek-chat': {
        price: {
            cents: {
                input_token:  28/1000000, // $0.28/mTok
                output_token: 42/1000000,
                cache_read:   28/10000000
            }
        }
    },
    'deepseek-reasoner': {
        price: {
            cents: {
                input_token:  28/1000000, // $0.28/mTok
                output_token: 42/1000000,
                cache_read:   28/10000000
            }
        }
    },
    'jamba-mini': {
        price: {
            cents: {
                input_token:  20/1000000, // $0.20/mTok
                output_token: 40/1000000
            }
        }
    },
    'jamba-large': {
        price: {
            cents: {
                input_token:  200/1000000, // $2.00/mTok
                output_token: 800/1000000
            }
        }
    },
    'groq-qwen3-32b': {
        price: {
            cents: {
                input_token:  29/1000000, // $0.29/mTok
                output_token: 59/1000000
            }
        }
    },
    'groq-llama-4-maverick': {
        price: {
            cents: {
                input_token:  20/1000000, // $0.20/mTok
                output_token: 60/1000000
            }
        }
    },
    'groq-r1-distill-70b': {
        price: {
            cents: {
                input_token:  75/1000000, // $0.75/mTok
                output_token: 99/1000000
            }
        }
    },
    'groq-gpt-oss-120b': {
        price: {
            cents: {
                input_token:  15/1000000, // $0.15/mTok
                output_token: 75/1000000
            }
        }
    },
    'groq-kimi-k2-instruct': {
        price: {
            cents: {
                input_token:  100/1000000, // $1.00/mTok
                output_token: 300/1000000
            }
        }
    },
    'minimax-01': {
        price: {
            cents: {
                input_token:   20/1000000, // $0.20/mTok
                output_token: 110/1000000
            }
        }
    },
    'minimax-m1': {
        price: {
            cents: {
                input_token:   30/1000000, // $0.30/mTok
                output_token: 165/1000000
            }
        }
    },
    'inception-mercury': {
        price: {
            cents: {
                input_token:   25/1000000, // $0.25/mTok
                output_token: 100/1000000
            }
        }
    },
    'kimi-k2': {
        price: {
            cents: {
                input_token:   39/1000000, // $0.39/mTok
                output_token: 190/1000000
            }
        }
    },
    'kimi-k2-thinking': {
        price: {
            cents: {
                input_token:   60/1000000, // $0.60/mTok
                output_token: 250/1000000
            }
        }
    },
    'kimi-linear-48b': {
        price: {
            cents: {
                input_token:  30/1000000, // $0.30/mTok
                output_token: 60/1000000
            }
        }
    },
    'glm-4.6': {
        price: {
            cents: {
                input_token:   60/1000000, // $0.60/mTok
                output_token: 200/1000000
            }
        }
    },
    'cogito-v2': {
        price: {
            cents: {
                input_token:  125/1000000, // $1.25/mTok
                output_token: 125/1000000
            }
        }
    },
    'ling-1t': {
        price: {
            cents: {
                input_token:  100/1000000, // $1.00/mTok
                output_token: 300/1000000
            }
        }
    },
    'olmo-3-7b': {
        price: {
            cents: {
                input_token:  10/1000000, // $0.10/mTok
                output_token: 20/1000000
            }
        }
    },
    'olmo-3-7b-think': {
        price: {
            cents: {
                input_token:  12/1000000, // $0.12/mTok
                output_token: 40/1000000
            }
        }
    },
    'olmo-3-32b-think': {
        price: {
            cents: {
                input_token:  20/1000000, // $0.20/mTok
                output_token: 35/1000000
            }
        }
    }
}

export const getCost = (model, usage) => {
    let tool_use_cost = getToolUseCost(model, usage)

    if (model.pricing_id === 'free') return {
        input:         0,
        output:        0,
        tool_use:      tool_use_cost,
        cache_write:   0,
        cache_read:    0,
        total:         0 + tool_use_cost,
        cache_savings: 0
    }

    const price = model_prices[model.pricing_id ?? model.id]?.price

    if (!price) {
        console.log(`❌ Model ID "${model.pricing_id}" not found in price list.`)
        return { input: -1, output: -1, tool_use: -1, cache_write: -1, cache_read: -1, total: -1, cache_savings: -1 }
    }

    let input_cost       = 0,
        output_cost      = 0,
        cache_write_cost = 0,
        cache_read_cost  = 0,
        cache_savings    = 0

    switch (model.type) {
        case 'open-ai':
            cache_read_cost = usage.cache_read_tokens * 0.1 * price.cents.input_token
            cache_savings   = usage.cache_read_tokens * 0.9 * price.cents.input_token
            break
        
        case 'anthropic':
            cache_write_cost  = usage.cache_write_tokens * price.cents.cache_write
            cache_read_cost   = usage.cache_read_tokens * price.cents.cache_read
            cache_savings    += usage.cache_read_tokens * (price.cents.input_token - price.cents.cache_read)
            cache_savings    -= usage.cache_write_tokens * (price.cents.cache_write - price.cents.input_token)
            break
        
        case 'deepseek':
            cache_read_cost = usage.cache_read_tokens * price.cents.cache_read
            cache_savings   = usage.cache_read_tokens * (price.cents.input_token - price.cents.cache_read)
            break
        
        case 'groq':
            cache_read_cost = usage.cache_read_tokens * 0.5 * price.cents.input_token
            cache_savings   = usage.cache_read_tokens * 0.5 * price.cents.input_token
            break
    }

    input_cost  = usage.input_tokens * price.cents.input_token
    output_cost = usage.output_tokens * price.cents.output_token

    return {
        input:         input_cost,
        output:        output_cost,
        tool_use:      tool_use_cost,
        cache_write:   cache_write_cost,
        cache_read:    cache_read_cost,
        total:         cache_write_cost + cache_read_cost + input_cost + output_cost + tool_use_cost,
        cache_savings: cache_savings
    }
}

export const getPrices = (model) => {
    if (model.pricing_id === 'free') return { input: 0, output: 0 }

    const price = model_prices[model.pricing_id ?? model.id]?.price

    if (!price) {
        console.log(`❌ Model ID "${model.pricing_id}" not found in price list.`)
        return { input: -1, output: -1 }
    }

    return {
        input:  price.cents.input_token,
        output: price.cents.output_token
    }
}

const getToolUseCost = (model, usage) => {
    let tool_use_cost = 0

    if (usage.server_tool_use) {
        if (model.type === 'openai') {
            // $25/1000 web search requests
            const web_search_requests = usage.server_tool_use.web_search_requests ?? 0
            tool_use_cost += web_search_requests * 2.5
        } else if (model.type === 'anthropic') {
            // $10/1000 web search requests
            const web_search_requests = usage.server_tool_use.web_search_requests ?? 0
            tool_use_cost += web_search_requests * 1
        } else if (model.type === 'google') {
            // 1,500 RPD free, then $0.035/req
            const google_search_requests = usage.server_tool_use.google_search_requests ?? 0
            tool_use_cost += google_search_requests * 0
        } else if (model.type === 'x') {
            // $25/1000 x search requests
            const x_search_requests = usage.server_tool_use.x_search_requests ?? 0
            tool_use_cost += x_search_requests * 2.5
        }
    }

    return tool_use_cost
}
