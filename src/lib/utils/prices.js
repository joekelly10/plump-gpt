const model_prices = [
    {
        id: 'gpt-4o-mini',
        price: {
            cents: {
                input_token:  15/1000000, // $0.15/mTok
                output_token: 60/1000000
            }
        }
    },
    {
        id: 'gpt-4o',
        price: {
            cents: {
                input_token:   250/1000000, // $2.50/mTok
                output_token: 1000/1000000
            }
        }
    },
    {
        id: 'claude-3-haiku',
        price: {
            cents: {
                input_token:   25/1000000, // $0.25/mTok
                output_token: 125/1000000,
                cache_write:   30/1000000,
                cache_read:     3/1000000
            }
        }
    },
    {
        id: 'claude-3-5-haiku',
        price: {
            cents: {
                input_token:   80/1000000, // $0.80/mTok
                output_token: 500/1000000,
                cache_write:  100/1000000,
                cache_read:     8/1000000
            }
        }
    },
    {
        id: 'claude-3-5-sonnet',
        price: {
            cents: {
                input_token:   300/1000000, // $3.00/mTok
                output_token: 1500/1000000,
                cache_write:   375/1000000,
                cache_read:     30/1000000
            }
        }
    },
    {
        id: 'claude-3-opus',
        price: {
            cents: {
                input_token:  1500/1000000, // $15.00/mTok
                output_token: 7500/1000000,
                cache_write:  1875/1000000,
                cache_read:    150/1000000
            }
        }
    },
    {
        id: 'gemini-2.0-flash-lite',
        price: {
            cents: {
                // input_token:  7.5/1000000, // $0.075/mTok
                // output_token:  15/1000000  // $0.15/mTok
                input_token:  0, // Free (for now)
                output_token: 0  //
            }
        }
    },
    {
        id: 'gemini-2.0-flash',
        price: {
            cents: {
                // input_token:  10/1000000, // $0.10/mTok
                // output_token: 40/1000000
                input_token:  0, // Free (for now)
                output_token: 0  //
            }
        }
    },
    {
        id: 'gemini-2.0-flash-thinking',
        price: {
            cents: {
                input_token:  0, // Free (for now)
                output_token: 0  //
            }
        }
    },
    {
        id: 'gemini-2.0-pro',
        price: {
            cents: {
                input_token:  0, // Free (for now)
                output_token: 0  //
            }
        }
    },
    {
        id: 'grok-2',
        price: {
            cents: {
                input_token:   200/1000000, // $2.00/mTok
                output_token: 1000/1000000
            }
        }
    },
    {
        id: 'command-r',
        price: {
            cents: {
                input_token:  15/1000000, // $0.15/mTok
                output_token: 60/1000000
            }
        }
    },
    {
        id: 'command-r-plus',
        price: {
            cents: {
                input_token:   250/1000000, // $2.50/mTok
                output_token: 1000/1000000
            }
        }
    },
    {
        id: 'llama-3-free',
        price: {
            cents: {
                input_token:  0, // Free
                output_token: 0
            }
        }
    },
    {
        id: 'llama-3-405b',
        price: {
            cents: {
                input_token:  80/1000000, // $0.80/mTok
                output_token: 80/1000000
            }
        }
    },
    {
        id: 'nous-hermes-3',
        price: {
            cents: {
                input_token:  80/1000000, // $0.80/mTok
                output_token: 80/1000000
            }
        }
    },
    {
        id: 'mistral-small',
        price: {
            cents: {
                input_token:  0, // Free
                output_token: 0
            }
        }
    },
    {
        id: 'mistral-large',
        price: {
            cents: {
                input_token:  0, // Free(?)
                output_token: 0
            }
        }
    },
    {
        id: 'qwen-turbo',
        price: {
            cents: {
                input_token:   5/1000000, // $0.05/mTok
                output_token: 20/1000000
            }
        }
    },
    {
        id: 'qwen-plus',
        price: {
            cents: {
                input_token:   40/1000000, // $0.40/mTok
                output_token: 120/1000000
            }
        }
    },
    {
        id: 'qwen-max',
        price: {
            cents: {
                input_token:  160/1000000, // $1.60/mTok
                output_token: 640/1000000
            }
        }
    },
    {
        id: 'deepseek-chat',
        price: {
            cents: {
                input_token:   27/1000000, // $0.27/mTok
                output_token: 110/1000000,
                cache_read:     7/1000000
            }
        }
    },
    {
        id: 'deepseek-reasoner',
        price: {
            cents: {
                input_token:   55/1000000, // $0.55/mTok
                output_token: 219/1000000,
                cache_read:    15/1000000
            }
        }
    }
]

const aliases = {
    'gpt-4o-2024-08-06':                             'gpt-4o',
    'claude-3-5-haiku-latest':                       'claude-3-5-haiku',
    'claude-3-5-sonnet-20240620':                    'claude-3-5-sonnet',
    'claude-3-5-sonnet-20241022':                    'claude-3-5-sonnet',
    'claude-3-5-sonnet-latest':                      'claude-3-5-sonnet',
    'claude-3-opus-20240229':                        'claude-3-opus',
    'claude-3-opus-latest':                          'claude-3-opus',
    'gemini-2.0-flash-lite-preview-02-05':           'gemini-2.0-flash-lite',
    'gemini-2.0-flash-exp':                          'gemini-2.0-flash',
    'gemini-2.0-flash-thinking-exp-01-21':           'gemini-2.0-flash-thinking',
    'gemini-2.0-pro-exp-02-05':                      'gemini-2.0-pro',
    'grok-2-1212':                                   'grok-2',
    'command-r-plus-08-2024':                        'command-r-plus',
    'meta-llama/llama-3.2-11b-vision-instruct:free': 'llama-3-free',
    'meta-llama/llama-3.3-70b-instruct:free':        'llama-3-free',
    'meta-llama/llama-3.1-405b-instruct':            'llama-3-405b',
    'nousresearch/hermes-3-llama-3.1-405b':          'nous-hermes-3',
    'mistral-large-latest':                          'mistral-large',
    'qwen/qwen-turbo':                               'qwen-turbo',
    'qwen/qwen-plus':                                'qwen-plus',
    'qwen/qwen-max':                                 'qwen-max'
}

export const getCost = (model_id, usage) => {
    let cache_write_cost = 0,
        cache_read_cost  = 0,
        input_cost       = 0,
        output_cost      = 0

    model_id = aliases[model_id] ?? model_id

    const model = model_prices.find(m => m.id === model_id)

    if (!model) {
        console.log(`❌ Model ID "${model_id}" not found in price list.`)
        return { cached: 0, input: 0, output: 0, total: 0 }
    }

    let cache_savings = 0

    if (model_id.startsWith('gpt-4o')) {
        cache_read_cost = usage.cache_read_tokens * 0.5 * model.price.cents.input_token
        cache_savings   = usage.cache_read_tokens * 0.5 * model.price.cents.input_token
    }

    if (model_id.startsWith('claude')) {
        cache_write_cost = usage.cache_write_tokens * model.price.cents.cache_write
        cache_read_cost  = usage.cache_read_tokens * model.price.cents.cache_read

        cache_savings += usage.cache_read_tokens * (model.price.cents.input_token - model.price.cents.cache_read)
        cache_savings -= usage.cache_write_tokens * (model.price.cents.cache_write - model.price.cents.input_token)
    }

    if (model_id.startsWith('deepseek')) {
        cache_read_cost = usage.cache_read_tokens * model.price.cents.cache_read
        cache_savings   = usage.cache_read_tokens * (model.price.cents.input_token - model.price.cents.cache_read)
    }

    input_cost  = usage.input_tokens * model.price.cents.input_token
    output_cost = usage.output_tokens * model.price.cents.output_token

    return {
        cache_write:   cache_write_cost,
        cache_read:    cache_read_cost,
        input:         input_cost,
        output:        output_cost,
        total:         cache_write_cost + cache_read_cost + input_cost + output_cost,
        cache_savings: cache_savings
    }
}

export const getPrices = (model_id) => {
    model_id = aliases[model_id] ?? model_id

    const model = model_prices.find(m => m.id === model_id)

    return {
        input:  model.price.cents.input_token,
        output: model.price.cents.output_token
    }
}
