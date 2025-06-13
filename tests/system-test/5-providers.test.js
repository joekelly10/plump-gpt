import { test, expect } from '@playwright/test'
import { fastExpect } from '../helpers/tools'
import { cssSanitised } from '../../src/lib/utils/helpers'
import { basic_prompt, basic_reply } from '../mock/prompts/basic_reply'

import defaults from '../../src/lib/fixtures/defaults'
import models from '../../src/lib/fixtures/models'

test.describe('Providers', () => {
    test('we should be able to stream a response from Open AI', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')

        if (default_model.type !== 'open-ai') {
            const model_list_button   = page.locator('.active-model-button'),
                  model_list          = page.locator('.models-by-family'),
                  openai_model        = models.find(m => m.type === 'open-ai'),
                  openai_model_button = model_list.locator(`#model-button-${cssSanitised(openai_model.id)}`),
                  active_model_icon   = model_list_button.locator('.icon')

            await model_list_button.click()
            await fastExpect(model_list).toBeVisible()
            await fastExpect(openai_model_button).toBeVisible()

            await openai_model_button.click()
            await fastExpect(model_list).toBeHidden()
            await fastExpect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${openai_model.icon}`)
        }

        await input.fill(basic_prompt)
        await page.keyboard.press('Enter')

        await fastExpect(input).toHaveText('')
        await fastExpect(user_message).toHaveCount(1)
        await fastExpect(user_message.locator('.message-content')).toHaveText(basic_prompt)

        await expect(ai_message).toHaveCount(1)
        await fastExpect(ai_message.locator('.message-content')).toHaveText(basic_reply)
    })

    test('we should be able to stream a response from Anthropic', async ({ page }) => {
        page.on('console', msg => console.log(msg.text()))

        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')

        if (default_model.type !== 'anthropic') {
            const model_list_button      = page.locator('.active-model-button'),
                  model_list             = page.locator('.models-by-family'),
                  anthropic_model        = models.find(m => m.type === 'anthropic'),
                  anthropic_model_button = model_list.locator(`#model-button-${cssSanitised(anthropic_model.id)}`),
                  active_model_icon      = model_list_button.locator('.icon')

            await model_list_button.click()
            await fastExpect(model_list).toBeVisible()
            await fastExpect(anthropic_model_button).toBeVisible()

            await anthropic_model_button.click()
            await fastExpect(model_list).toBeHidden()
            await fastExpect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${anthropic_model.icon}`)
        }

        await input.fill(basic_prompt)
        await page.keyboard.press('Enter')

        await fastExpect(input).toHaveText('')
        await fastExpect(user_message).toHaveCount(1)
        await fastExpect(user_message.locator('.message-content')).toHaveText(basic_prompt)

        await expect(ai_message).toHaveCount(1)
        await fastExpect(ai_message.locator('.message-content')).toHaveText(basic_reply)
    })

    test('we should be able to stream a response from Google', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')

        if (default_model.type !== 'google') {
            const model_list_button   = page.locator('.active-model-button'),
                  model_list          = page.locator('.models-by-family'),
                  google_model        = models.find(m => m.type === 'google' && !m.is_reasoner),
                  google_model_button = model_list.locator(`#model-button-${cssSanitised(google_model.id)}`),
                  active_model_icon   = model_list_button.locator('.icon')

            await model_list_button.click()
            await fastExpect(model_list).toBeVisible()
            await fastExpect(google_model_button).toBeVisible()

            await google_model_button.click()
            await fastExpect(model_list).toBeHidden()
            await fastExpect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${google_model.icon}`)
        }

        await input.fill(basic_prompt)
        await page.keyboard.press('Enter')

        await fastExpect(input).toHaveText('')
        await fastExpect(user_message).toHaveCount(1)
        await fastExpect(user_message.locator('.message-content')).toHaveText(basic_prompt)

        await expect(ai_message).toHaveCount(1)
        await fastExpect(ai_message.locator('.message-content')).toHaveText(basic_reply)
    })

    test('we should be able to stream a response from X', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')

        if (default_model.type !== 'x') {
            const model_list_button = page.locator('.active-model-button'),
                  model_list        = page.locator('.models-by-family'),
                  x_model           = models.find(m => m.type === 'x'),
                  x_model_button    = model_list.locator(`#model-button-${cssSanitised(x_model.id)}`),
                  active_model_icon = model_list_button.locator('.icon')

            await model_list_button.click()
            await fastExpect(model_list).toBeVisible()
            await fastExpect(x_model_button).toBeVisible()

            await x_model_button.click()
            await fastExpect(model_list).toBeHidden()
            await fastExpect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${x_model.icon}`)
        }

        await input.fill(basic_prompt)
        await page.keyboard.press('Enter')

        await fastExpect(input).toHaveText('')
        await fastExpect(user_message).toHaveCount(1)
        await fastExpect(user_message.locator('.message-content')).toHaveText(basic_prompt)

        await expect(ai_message).toHaveCount(1)
        await fastExpect(ai_message.locator('.message-content')).toHaveText(basic_reply)
    })

    test('we should be able to stream a response from DeepSeek', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')

        if (default_model.type !== 'deepseek') {
            const model_list_button    = page.locator('.active-model-button'),
                  model_list           = page.locator('.models-by-family'),
                  deepseek_model       = models.find(m => m.type === 'deepseek'),
                  deepseek_model_button = model_list.locator(`#model-button-${cssSanitised(deepseek_model.id)}`),
                  active_model_icon    = model_list_button.locator('.icon')

            await model_list_button.click()
            await fastExpect(model_list).toBeVisible()
            await fastExpect(deepseek_model_button).toBeVisible()

            await deepseek_model_button.click()
            await fastExpect(model_list).toBeHidden()
            await fastExpect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${deepseek_model.icon}`)
        }

        await input.fill(basic_prompt)
        await page.keyboard.press('Enter')

        await fastExpect(input).toHaveText('')
        await fastExpect(user_message).toHaveCount(1)
        await fastExpect(user_message.locator('.message-content')).toHaveText(basic_prompt)

        await expect(ai_message).toHaveCount(1)
        await fastExpect(ai_message.locator('.message-content')).toHaveText(basic_reply)
    })

    test('we should be able to stream a response from Mistral', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')

        if (default_model.type !== 'mistral') {
            const model_list_button   = page.locator('.active-model-button'),
                  model_list          = page.locator('.models-by-family'),
                  mistral_model       = models.find(m => m.type === 'mistral'),
                  mistral_model_button = model_list.locator(`#model-button-${cssSanitised(mistral_model.id)}`),
                  active_model_icon   = model_list_button.locator('.icon')

            await model_list_button.click()
            await fastExpect(model_list).toBeVisible()
            await fastExpect(mistral_model_button).toBeVisible()

            await mistral_model_button.click()
            await fastExpect(model_list).toBeHidden()
            await fastExpect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${mistral_model.icon}`)
        }

        await input.fill(basic_prompt)
        await page.keyboard.press('Enter')

        await fastExpect(input).toHaveText('')
        await fastExpect(user_message).toHaveCount(1)
        await fastExpect(user_message.locator('.message-content')).toHaveText(basic_prompt)

        await expect(ai_message).toHaveCount(1)
        await fastExpect(ai_message.locator('.message-content')).toHaveText(basic_reply)
    })

    test('we should be able to stream a response from AI21', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')

        if (default_model.type !== 'ai21') {
            const model_list_button = page.locator('.active-model-button'),
                  model_list        = page.locator('.models-by-family'),
                  ai21_model        = models.find(m => m.type === 'ai21'),
                  ai21_model_button = model_list.locator(`#model-button-${cssSanitised(ai21_model.id)}`),
                  active_model_icon = model_list_button.locator('.icon')

            await model_list_button.click()
            await fastExpect(model_list).toBeVisible()
            await fastExpect(ai21_model_button).toBeVisible()

            await ai21_model_button.click()
            await fastExpect(model_list).toBeHidden()
            await fastExpect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${ai21_model.icon}`)
        }

        await input.fill(basic_prompt)
        await page.keyboard.press('Enter')

        await fastExpect(input).toHaveText('')
        await fastExpect(user_message).toHaveCount(1)
        await fastExpect(user_message.locator('.message-content')).toHaveText(basic_prompt)

        await expect(ai_message).toHaveCount(1)
        await fastExpect(ai_message.locator('.message-content')).toHaveText(basic_reply)
    })

    test('we should be able to stream a response from Cohere', async ({ page }) => {
        page.on('console', msg => console.log(msg.text()))

        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')

        if (default_model.type !== 'cohere') {
            const model_list_button  = page.locator('.active-model-button'),
                  model_list         = page.locator('.models-by-family'),
                  cohere_model       = models.find(m => m.type === 'cohere'),
                  cohere_model_button = model_list.locator(`#model-button-${cssSanitised(cohere_model.id)}`),
                  active_model_icon  = model_list_button.locator('.icon')

            await model_list_button.click()
            await fastExpect(model_list).toBeVisible()
            await fastExpect(cohere_model_button).toBeVisible()

            await cohere_model_button.click()
            await fastExpect(model_list).toBeHidden()
            await fastExpect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${cohere_model.icon}`)
        }

        await input.fill(basic_prompt)
        await page.keyboard.press('Enter')

        await fastExpect(input).toHaveText('')
        await fastExpect(user_message).toHaveCount(1)
        await fastExpect(user_message.locator('.message-content')).toHaveText(basic_prompt)

        await expect(ai_message).toHaveCount(1)
        await fastExpect(ai_message.locator('.message-content')).toHaveText(basic_reply)
    })

    test('we should be able to stream a response from Groq', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')

        if (default_model.type !== 'groq') {
            const model_list_button = page.locator('.active-model-button'),
                  model_list        = page.locator('.models-by-family'),
                  groq_model        = models.find(m => m.type === 'groq' && !m.is_reasoner),
                  groq_model_button = model_list.locator(`#model-button-${cssSanitised(groq_model.id)}`),
                  active_model_icon = model_list_button.locator('.icon')

            await model_list_button.click()
            await fastExpect(model_list).toBeVisible()
            await fastExpect(groq_model_button).toBeVisible()

            await groq_model_button.click()
            await fastExpect(model_list).toBeHidden()
            await fastExpect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${groq_model.icon}`)
        }

        await input.fill(basic_prompt)
        await page.keyboard.press('Enter')

        await fastExpect(input).toHaveText('')
        await fastExpect(user_message).toHaveCount(1)
        await fastExpect(user_message.locator('.message-content')).toHaveText(basic_prompt)

        await expect(ai_message).toHaveCount(1)
        await fastExpect(ai_message.locator('.message-content')).toHaveText(basic_reply)
    })

    test('we should be able to stream a response from OpenRouter', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')

        if (default_model.type !== 'openrouter') {
            const model_list_button       = page.locator('.active-model-button'),
                  model_list              = page.locator('.models-by-family'),
                  openrouter_model        = models.find(m => m.type === 'openrouter' && !m.is_reasoner),
                  openrouter_model_button = model_list.locator(`#model-button-${cssSanitised(openrouter_model.id)}`),
                  active_model_icon       = model_list_button.locator('.icon')

            await model_list_button.click()
            await fastExpect(model_list).toBeVisible()
            await fastExpect(openrouter_model_button).toBeVisible()

            await openrouter_model_button.click()
            await fastExpect(model_list).toBeHidden()
            await fastExpect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${openrouter_model.icon}`)
        }

        await input.fill(basic_prompt)
        await page.keyboard.press('Enter')

        await fastExpect(input).toHaveText('')
        await fastExpect(user_message).toHaveCount(1)
        await fastExpect(user_message.locator('.message-content')).toHaveText(basic_prompt)

        await expect(ai_message).toHaveCount(1)
        await fastExpect(ai_message.locator('.message-content')).toHaveText(basic_reply)
    })
})
