import { test, expect } from '@playwright/test'
import { sleep } from '../helpers/tools'
import { switchModel } from '../helpers/actions'
import { scroll_prompt, scroll_reply, scroll_prompt_2, scroll_reply_2, scroll_reasoning_prompt, scroll_reasoning_content, scroll_reasoning_reply } from '../mock/prompts/autoscroll'

import defaults from '../../src/lib/fixtures/defaults'
import models from '../../src/lib/fixtures/models'

test.describe('Autoscroll', () => {
    test('the chat should scroll down automatically when a message is streaming', async ({ page }) => {
        await page.goto('/')

        const input        = page.locator('.primary-input-section .input'),
              chat         = page.locator('.chat'),
              user_message = chat.locator('.messages .message.user'),
              ai_message   = chat.locator('.messages .message.assistant')

        await input.fill(scroll_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(scroll_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(scroll_reply)

        await sleep(500)

        await input.fill(scroll_prompt_2)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(2)
        await expect(user_message.nth(1).locator('.message-content')).toHaveText(scroll_prompt_2)
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1)).toContainClass('streaming')
        await expect(ai_message.nth(1)).not.toContainClass('streaming', { timeout: 10_000 })

        // let scroll animation complete
        await sleep(500)

        const did_automatically_scroll_to_bottom = await chat.evaluate(element => {
            // the -1 here provides small tolerance for rounding errors
            return element.scrollTop + element.clientHeight >= element.scrollHeight - 1
        })
        
        expect(did_automatically_scroll_to_bottom).toBe(true)
    })

    test('the chat should stop autoscrolling if the user scrolls up', async ({ page }) => {
        await page.goto('/')

        const input        = page.locator('.primary-input-section .input'),
              chat         = page.locator('.chat'),
              user_message = chat.locator('.messages .message.user'),
              ai_message   = chat.locator('.messages .message.assistant')
        
        await input.fill(scroll_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message).not.toContainClass('streaming', { timeout: 10_000 })

        await sleep(500)

        await input.fill(scroll_prompt_2)
        await page.keyboard.press('Enter')

        await expect(user_message).toHaveCount(2)
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1)).toContainClass('streaming')

        // allow scrolling to start
        await sleep(4000)
        await chat.hover()
        await page.mouse.wheel(0, -100)

        // wait for streaming to finish
        await expect(ai_message.nth(1)).not.toContainClass('streaming', { timeout: 10_000 })

        // let scroll animation complete
        await sleep(500)

        const did_automatically_scroll_to_bottom = await chat.evaluate(element => {
            // the -1 here provides small tolerance for rounding errors
            return element.scrollTop + element.clientHeight >= element.scrollHeight - 1
        })
        
        expect(did_automatically_scroll_to_bottom).toBe(false)
    })

    test('reasoning content should scroll down automatically when a message is streaming', async ({ page }) => {
        await page.goto('/')

        const default_model     = models.find(m => m.id === defaults.model),
              input             = page.locator('.primary-input-section .input'),
              user_message      = page.locator('.chat .messages .message.user'),
              ai_message        = page.locator('.chat .messages .message.assistant'),
              reasoning_content = ai_message.locator('.reasoning-content')
        
        if (!default_model.is_reasoner || ['open-ai', 'anthropic'].includes(default_model.type)) {
            const reasoning_model = models.find(model => !['open-ai', 'anthropic'].includes(model.type) && model.is_reasoner)
            await switchModel(page, reasoning_model)
        }

        await input.fill(scroll_reasoning_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(scroll_reasoning_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(scroll_reasoning_reply)

        const reasoning_was_scrollable = await reasoning_content.evaluate(element => {
            return element.scrollHeight > element.clientHeight
        })

        expect(reasoning_was_scrollable).toBe(true)

        // let scroll animation complete
        await sleep(500)

        const did_automatically_scroll_to_bottom = await reasoning_content.evaluate(element => {
            // the -1 here provides small tolerance for rounding errors
            return element.scrollTop + element.clientHeight >= element.scrollHeight - 1
        })

        expect(did_automatically_scroll_to_bottom).toBe(true)
    })

    test('reasoning content should stop autoscrolling if the user scrolls up on it', async ({ page }) => {
        await page.goto('/')

        const default_model     = models.find(m => m.id === defaults.model),
              input             = page.locator('.primary-input-section .input'),
              user_message      = page.locator('.chat .messages .message.user'),
              ai_message        = page.locator('.chat .messages .message.assistant'),
              reasoning_content = ai_message.locator('.reasoning-content')
        
        if (!default_model.is_reasoner || ['open-ai', 'anthropic'].includes(default_model.type)) {
            const reasoning_model = models.find(model => !['open-ai', 'anthropic'].includes(model.type) && model.is_reasoner)
            await switchModel(page, reasoning_model)
        }
        
        await input.fill(scroll_reasoning_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message).toContainClass('streaming')

        await sleep(2000)

        await reasoning_content.hover()
        await page.mouse.wheel(0, -100)

        await expect(ai_message).not.toContainClass('streaming', { timeout: 10_000 })

        // let scroll animation complete
        await sleep(500)

        const did_automatically_scroll_to_bottom = await reasoning_content.evaluate(element => {
            // the -1 here provides small tolerance for rounding errors
            return element.scrollTop + element.clientHeight >= element.scrollHeight - 1
        })
        
        expect(did_automatically_scroll_to_bottom).toBe(false)
    })
})
