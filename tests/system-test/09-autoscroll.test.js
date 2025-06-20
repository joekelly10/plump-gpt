import { test, expect } from '@playwright/test'
import { sleep } from '../helpers/tools'
import { cssSanitised } from '../../src/lib/utils/helpers'
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

        await sleep(500)

        const did_automatically_scroll_to_bottom = await chat.evaluate(element => {
            // the -1 here provides small tolerance for rounding errors
            return element.scrollTop + element.clientHeight >= element.scrollHeight - 1
        })
        
        expect(did_automatically_scroll_to_bottom).toBe(true)
    })

    test('reasoning content should scroll down automatically when a message is streaming', async ({ page }) => {
        await page.goto('/')

        const default_model     = models.find(m => m.id === defaults.model),
              input             = page.locator('.primary-input-section .input'),
              user_message      = page.locator('.chat .messages .message.user'),
              ai_message        = page.locator('.chat .messages .message.assistant'),
              reasoning_content = ai_message.locator('.reasoning-content')
        
        if (default_model.type !== 'deepseek' || !default_model.is_reasoner) {
            const model_list_button     = page.locator('.active-model-button'),
                  model_list            = page.locator('.models-by-family'),
                  deepseek_model        = models.find(m => m.type === 'deepseek' && m.is_reasoner),
                  deepseek_model_button = model_list.locator(`#model-button-${cssSanitised(deepseek_model.id)}`),
                  active_model_icon     = model_list_button.locator('.icon')

            await model_list_button.click()
            await expect(model_list).toBeVisible()
            await expect(deepseek_model_button).toBeVisible()

            await deepseek_model_button.click()
            await expect(model_list).toBeHidden()
            await expect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${deepseek_model.icon}`)
        }

        await input.fill(scroll_reasoning_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(scroll_reasoning_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(scroll_reasoning_reply)

        const was_scrollable = await reasoning_content.evaluate(element => {
            return element.scrollHeight > element.clientHeight
        })

        expect(was_scrollable).toBe(true)

        const did_automatically_scroll_to_bottom = await reasoning_content.evaluate(element => {
            // the -1 here provides small tolerance for rounding errors
            return element.scrollTop + element.clientHeight >= element.scrollHeight - 1
        })
        
        expect(did_automatically_scroll_to_bottom).toBe(true)
    })
})
