const model_prices = {
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
    'claude-haiku': {
        price: {
            cents: {
                input_token:   80/1000000, // $0.80/mTok
                output_token: 400/1000000,
                cache_write:  100/1000000,
                cache_read:     8/1000000
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
    'gemini-2.0-flash-lite': {
        price: {
            cents: {
                input_token:  7.5/1000000, // $0.075/mTok
                output_token:  30/1000000  // $0.30/mTok
            }
        }
    },
    'gemini-2.5-flash': {
        price: {
            cents: {
                input_token:   15/1000000, // $0.15/mTok
                output_token:  60/1000000
            }
        }
    },
    'gemini-2.5-flash-thinking': {
        price: {
            cents: {
                input_token:   15/1000000, // $0.15/mTok
                output_token: 350/1000000
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
    'grok-3-mini': {
        price: {
            cents: {
                input_token:  30/1000000, // $0.30/mTok
                output_token: 50/1000000
            }
        }
    },
    'grok-3': {
        price: {
            cents: {
                input_token:   300/1000000, // $3.00/mTok
                output_token: 1500/1000000
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
    'qwen-plus': {
        price: {
            cents: {
                input_token:   40/1000000, // $0.40/mTok
                output_token: 120/1000000
            }
        }
    },
    'qwen-max': {
        price: {
            cents: {
                input_token:  160/1000000, // $1.60/mTok
                output_token: 640/1000000
            }
        }
    },
    'deepseek-chat': {
        price: {
            cents: {
                input_token:   27/1000000, // $0.27/mTok
                output_token: 110/1000000,
                cache_read:     7/1000000
            }
        }
    },
    'deepseek-reasoner': {
        price: {
            cents: {
                input_token:   55/1000000, // $0.55/mTok
                output_token: 219/1000000,
                cache_read:    15/1000000
            }
        }
    },
    'jamba-1.6-mini': {
        price: {
            cents: {
                input_token:  20/1000000, // $0.20/mTok
                output_token: 40/1000000
            }
        }
    },
    'jamba-1.6-large': {
        price: {
            cents: {
                input_token:  200/1000000, // $2.00/mTok
                output_token: 800/1000000
            }
        }
    }
}

export const getCost = (model, usage) => {
    if (model.pricing_id === 'free') return { input: 0, output: 0, cache_write: 0, cache_read: 0, total: 0, cache_savings: 0 }

    const price = model_prices[model.pricing_id ?? model.id]?.price

    if (!price) {
        console.log(`❌ Model ID "${model.pricing_id}" not found in price list.`)
        return { input: -1, output: -1, cache_write: -1, cache_read: -1, total: -1, cache_savings: -1 }
    }

    let input_cost       = 0,
        output_cost      = 0,
        cache_write_cost = 0,
        cache_read_cost  = 0,
        cache_savings    = 0

    if (model.type === 'openai') {
        cache_read_cost = usage.cache_read_tokens * 0.25 * price.cents.input_token
        cache_savings   = usage.cache_read_tokens * 0.25 * price.cents.input_token
    }

    if (model.type === 'anthropic') {
        cache_write_cost = usage.cache_write_tokens * price.cents.cache_write
        cache_read_cost  = usage.cache_read_tokens * price.cents.cache_read

        cache_savings += usage.cache_read_tokens * (price.cents.input_token - price.cents.cache_read)
        cache_savings -= usage.cache_write_tokens * (price.cents.cache_write - price.cents.input_token)
    }

    if (model.type === 'deepseek') {
        cache_read_cost = usage.cache_read_tokens * price.cents.cache_read
        cache_savings   = usage.cache_read_tokens * (price.cents.input_token - price.cents.cache_read)
    }

    input_cost  = usage.input_tokens * price.cents.input_token
    output_cost = usage.output_tokens * price.cents.output_token

    return {
        input:         input_cost,
        output:        output_cost,
        cache_write:   cache_write_cost,
        cache_read:    cache_read_cost,
        total:         cache_write_cost + cache_read_cost + input_cost + output_cost,
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
