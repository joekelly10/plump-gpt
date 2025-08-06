import { test, expect } from '@playwright/test'
import { switchModel } from '../helpers/actions'
import { basic_reasoning_prompt, basic_reasoning_content, basic_reasoning_reply } from '../mock/prompts/basic_reasoning'
import { basic_prompt, basic_reply } from '../mock/prompts/basic_reply'

import defaults from '../../src/lib/fixtures/defaults'
import models from '../../src/lib/fixtures/models'

test.describe('Reasoning Content', () => {
    test('we should see the reasoning from Open AI models', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')

        if (default_model.type !== 'open-ai' || !default_model.is_reasoner) {
            const open_ai_model = models.find(m => m.type === 'open-ai' && m.is_reasoner)
            await switchModel(page, open_ai_model)
        }

        await input.fill(basic_reasoning_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(basic_reasoning_prompt)

        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.reasoning-content')).toContainText(basic_reasoning_content)
        await expect(ai_message.locator('.message-content')).toHaveText(basic_reasoning_reply)
    })

    test('we should see the reasoning from Anthropic models', async ({ page }) => {
        await page.goto('/')

        const default_model                 = models.find(m => m.id === defaults.model),
              input                         = page.locator('.primary-input-section .input'),
              user_message                  = page.locator('.chat .messages .message.user'),
              ai_message                    = page.locator('.chat .messages .message.assistant'),
              tools_button                  = page.locator('.tools-button'),
              tool_list                     = page.locator('.tool-list'),
              toggle_thinking_budget_button = tool_list.locator('.toggle-thinking-budget-button'),
              thinking_budget_button        = page.locator('.primary-input-section .thinking-budget-button')

        if (default_model.type !== 'anthropic' || !default_model.is_reasoner) {
            const anthropic_model = models.find(m => m.type === 'anthropic' && m.is_reasoner)
            await switchModel(page, anthropic_model)
        }

        await expect(tools_button).toBeVisible()
        await expect(tool_list).not.toBeVisible()

        await tools_button.click()
        await expect(tool_list).toBeVisible()
        await expect(toggle_thinking_budget_button).toBeVisible()
        await expect(toggle_thinking_budget_button).not.toContainClass('is-active')

        await toggle_thinking_budget_button.click()
        await expect(toggle_thinking_budget_button).toContainClass('is-active')
        await expect(thinking_budget_button).toBeVisible()
        await expect(thinking_budget_button).toContainText('1,000')

        await input.fill(basic_reasoning_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(basic_reasoning_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.reasoning-content')).toContainText(basic_reasoning_content)
        await expect(ai_message.locator('.message-content')).toHaveText(basic_reasoning_reply)

        // ensure that 'off' works and reasoning content is not present on a normal reply
        await thinking_budget_button.click({ button: 'right' })
        await expect(thinking_budget_button).toContainText('Off')

        await input.fill(basic_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(2)
        await expect(user_message.nth(1).locator('.message-content')).toHaveText(basic_prompt)
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(basic_reply)
        await expect(ai_message.nth(1).locator('.reasoning-content')).not.toBeVisible()
    })

    test('we should see the reasoning from Google models', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')

        if (default_model.type !== 'google' || !default_model.is_reasoner) {
            const google_model = models.find(m => m.type === 'google' && m.is_reasoner)
            await switchModel(page, google_model)
        }

        await input.fill(basic_reasoning_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(basic_reasoning_prompt)

        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.reasoning-content')).toContainText(basic_reasoning_content)
        await expect(ai_message.locator('.message-content')).toHaveText(basic_reasoning_reply)
    })

    test('we should see the reasoning from X models', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')
        
        if (default_model.type !== 'x' || !default_model.is_reasoner) {
            const x_model = models.find(m => m.type === 'x' && m.is_reasoner)
            await switchModel(page, x_model)
        }

        await input.fill(basic_reasoning_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(basic_reasoning_prompt)

        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.reasoning-content')).toContainText(basic_reasoning_content)
        await expect(ai_message.locator('.message-content')).toHaveText(basic_reasoning_reply)
    })

    test('we should see the reasoning from DeepSeek models', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')
        
        if (default_model.type !== 'deepseek' || !default_model.is_reasoner) {
            const deepseek_model = models.find(m => m.type === 'deepseek' && m.is_reasoner)
            await switchModel(page, deepseek_model)
        }

        await input.fill(basic_reasoning_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(basic_reasoning_prompt)

        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.reasoning-content')).toContainText(basic_reasoning_content)
        await expect(ai_message.locator('.message-content')).toHaveText(basic_reasoning_reply)
    })

    test('we should see the reasoning from OpenRouter models', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')
        
        if (default_model.type !== 'openrouter' || !default_model.is_reasoner) {
            const openrouter_model = models.find(m => m.type === 'openrouter' && m.is_reasoner)
            await switchModel(page, openrouter_model)
        }

        await input.fill(basic_reasoning_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(basic_reasoning_prompt)

        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.reasoning-content')).toContainText(basic_reasoning_content)
        await expect(ai_message.locator('.message-content')).toHaveText(basic_reasoning_reply)
    })

    test('we should see the reasoning from Groq models', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')
        
        if (default_model.type !== 'groq' || !default_model.is_reasoner) {
            const groq_model = models.find(m => m.type === 'groq' && m.is_reasoner)
            await switchModel(page, groq_model)
        }

        await input.fill(basic_reasoning_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(basic_reasoning_prompt)

        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.reasoning-content')).toContainText(basic_reasoning_content)
        await expect(ai_message.locator('.message-content')).toHaveText(basic_reasoning_reply)
    })

    // test('thinking budget button should work', async ({ page }) => {
    //     await page.goto('/')

    //     const default_model          = models.find(m => m.id === defaults.model),
    //           thinking_budget_button = page.locator('.thinking-budget-button')

    //     if (default_model.type !== 'anthropic' || !default_model.is_reasoner) {
    //         const anthropic_model = models.find(m => m.type === 'anthropic' && m.is_reasoner)
    //         await switchModel(page, anthropic_model)
    //     }

    //     await expect(thinking_budget_button).toBeVisible()

    //     // if default is not 0, then keep right clicking until containsText('off')
    //     if (defaults.thinking_budget !== 0) {
    //         while (!(await thinking_budget_button.textContent()).includes('off')) {
    //             await thinking_budget_button.click({ button: 'right' })
    //         }
    //     }

    //     await expect(thinking_budget_button).toContainText('off')

    //     // left click: +1000
    //     await thinking_budget_button.click()
    //     await expect(thinking_budget_button).toContainText('1,000')

    //     // right click: -1000
    //     await thinking_budget_button.click({ button: 'right' })
    //     await expect(thinking_budget_button).toContainText('off')

    //     // left click up to max
    //     for (let i = 0; i < 4; i++) {
    //         await thinking_budget_button.click()
    //     }
    //     await expect(thinking_budget_button).toContainText('4,000')

    //     for (let i = 0; i < 4; i++) {
    //         await thinking_budget_button.click()
    //     }
    //     await expect(thinking_budget_button).toContainText('12,000')

    //     for (let i = 0; i < 5; i++) {
    //         await thinking_budget_button.click()
    //     }
    //     await expect(thinking_budget_button).toContainText('32,000')

    //     // right click down to min
    //     for (let i = 0; i < 5; i++) {
    //         await thinking_budget_button.click({ button: 'right' })
    //     }
    //     await expect(thinking_budget_button).toContainText('12,000')

    //     for (let i = 0; i < 4; i++) {
    //         await thinking_budget_button.click({ button: 'right' })
    //     }
    //     await expect(thinking_budget_button).toContainText('4,000')

    //     await thinking_budget_button.click({ button: 'right' })
    //     await thinking_budget_button.click({ button: 'right' })
    //     await expect(thinking_budget_button).toContainText('2,000')

    //     // check persistence
    //     await page.reload()
    //     await expect(thinking_budget_button).toContainText('2,000')
    // })
})
