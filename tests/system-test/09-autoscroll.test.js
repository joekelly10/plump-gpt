import { test, expect } from '@playwright/test'
import { fastExpect, slowExpect } from '../helpers/tools'
import { cssSanitised } from '../../src/lib/utils/helpers'
import { scroll_reasoning_prompt, scroll_reasoning_content, scroll_reasoning_reply } from '../mock/prompts/scroll_reasoning'

import defaults from '../../src/lib/fixtures/defaults'
import models from '../../src/lib/fixtures/models'

test.describe('Autoscroll', () => {
    test('the chat should scroll down automatically when a message is streaming', async ({ page }) => {
        await page.goto('/')

        const input        = page.locator('.primary-input-section .input'),
              chat         = page.locator('.chat'),
              user_message = chat.locator('.messages .message.user'),
              ai_message   = chat.locator('.messages .message.assistant')

        await input.fill(scroll_reasoning_prompt)
        await page.keyboard.press('Enter')

        await fastExpect(input).toHaveText('')
        await fastExpect(user_message).toHaveCount(1)
        await fastExpect(user_message.locator('.message-content')).toHaveText(scroll_reasoning_prompt)
        await fastExpect(ai_message).toHaveCount(1)
        await fastExpect(ai_message.locator('.message-content')).toHaveText(scroll_reasoning_reply)

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
            await fastExpect(model_list).toBeVisible()
            await fastExpect(deepseek_model_button).toBeVisible()

            await deepseek_model_button.click()
            await fastExpect(model_list).toBeHidden()
            await fastExpect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${deepseek_model.icon}`)
        }

        await input.fill(scroll_reasoning_prompt)
        await page.keyboard.press('Enter')

        await fastExpect(input).toHaveText('')
        await fastExpect(user_message).toHaveCount(1)
        await fastExpect(user_message.locator('.message-content')).toHaveText(scroll_reasoning_prompt)
        await fastExpect(ai_message).toHaveCount(1)
        await fastExpect(ai_message.locator('.message-content')).toHaveText(scroll_reasoning_reply)

        const first_100_chars = scroll_reasoning_content.slice(0, 100),
              last_100_chars  = scroll_reasoning_content.slice(-100)

        await fastExpect(reasoning_content).toContainText(first_100_chars)
        await slowExpect(reasoning_content).toContainText(last_100_chars)

        const did_automatically_scroll_to_bottom = await reasoning_content.evaluate(element => {
            // the -1 here provides small tolerance for rounding errors
            return element.scrollTop + element.clientHeight >= element.scrollHeight - 1
        })
        
        expect(did_automatically_scroll_to_bottom).toBe(true)
    })
})
