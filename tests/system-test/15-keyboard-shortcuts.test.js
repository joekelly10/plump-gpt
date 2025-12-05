import { test, expect } from '@playwright/test'
import { sleep } from '../helpers/tools'
import { switchModel } from '../helpers/actions'
import { basic_prompt, basic_reply } from '../mock/prompts/basic_reply'
import { short_reply_prompt, short_reply } from '../mock/prompts/messages'
import { scroll_prompt_2, scroll_reply_2 } from '../mock/prompts/autoscroll'

import defaults from '../../src/lib/fixtures/defaults'
import models from '../../src/lib/fixtures/models'

test.describe('Keyboard Shortcuts', () => {
    test('we should be able to use the keyboard to scroll the chat', async ({ page }) => {
        await page.goto('/')

        const input        = page.locator('.primary-input-section .input'),
              chat         = page.locator('.chat'),
              user_message = chat.locator('.messages .message.user'),
              ai_message   = chat.locator('.messages .message.assistant')

        // send many messages (to cause scrolling)
        await input.fill(scroll_prompt_2)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message).not.toContainClass('streaming', { timeout: 10_000 })

        // let autoscroll animation complete
        await sleep(500)

        // the -1 here provides small tolerance for rounding errors
        const did_automatically_scroll_to_bottom = await chat.evaluate(element => {
            return element.scrollTop + element.clientHeight >= element.scrollHeight - 1
        })
        expect(did_automatically_scroll_to_bottom).toBe(true)

        // shift+alt+up (scroll to top)
        await page.keyboard.press('Shift+Alt+ArrowUp')

        await sleep(1500)

        const did_scroll_to_top = await chat.evaluate(element => element.scrollTop <= 1)
        expect(did_scroll_to_top).toBe(true)

        // shift+alt+down (scroll to bottom)
        await page.keyboard.press('Shift+Alt+ArrowDown')
        await sleep(1500)
        
        const did_scroll_to_bottom = await chat.evaluate(element => {
            return element.scrollTop + element.clientHeight >= element.scrollHeight - 1
        })
        expect(did_scroll_to_bottom).toBe(true)

        // alt+down (scroll up incrementally)
        const before_up_scroll = await chat.evaluate(element => element.scrollTop)
        await page.keyboard.press('Alt+ArrowUp')
        await sleep(500)
        const after_up_scroll = await chat.evaluate(element => element.scrollTop)
        expect(after_up_scroll).toBeLessThan(before_up_scroll)

        // alt+up (scroll down incrementally)
        const before_down_scroll = await chat.evaluate(element => element.scrollTop)
        await page.keyboard.press('Alt+ArrowDown')
        await sleep(500)
        const after_down_scroll = await chat.evaluate(element => element.scrollTop)
        expect(after_down_scroll).toBeGreaterThan(before_down_scroll)
    })

    test('we should be able to use the keyboard to create a new chat', async ({ page }) => {
        await page.goto('/')

        const input        = page.locator('.primary-input-section .input'),
              chat         = page.locator('.chat'),
              user_message = chat.locator('.messages .message.user'),
              ai_message   = chat.locator('.messages .message.assistant')

        // send a message to create a chat
        await input.fill(basic_prompt)
        await page.keyboard.press('Enter')
        
        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(basic_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(basic_reply)

        // ctrl+n (new chat)
        await page.keyboard.press('Control+n')
        
        // Should clear the chat
        await expect(user_message).toHaveCount(0)
        await expect(ai_message).toHaveCount(0)
    })

    test('we should be able to use the keyboard to delete a chat', async ({ page }) => {
        await page.goto('/')

        const input        = page.locator('.primary-input-section .input'),
              chat         = page.locator('.chat'),
              user_message = chat.locator('.messages .message.user'),
              ai_message   = chat.locator('.messages .message.assistant')

        // send first message
        await input.fill(basic_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(basic_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(basic_reply)

        await sleep(50)

        page.on('dialog', async dialog => { await dialog.accept() })
        await page.keyboard.press('Meta+Alt+Backspace')
        await expect(user_message).toHaveCount(0)
        await expect(ai_message).toHaveCount(0)
    })

    test('we should be able to use the keyboard to load a chat', async ({ page }) => {
        await page.goto('/')

        const input        = page.locator('.primary-input-section .input'),
              chat         = page.locator('.chat'),
              user_message = chat.locator('.messages .message.user'),
              ai_message   = chat.locator('.messages .message.assistant'),
              save_button  = page.locator('.save-button')

        // send first message
        await input.fill(basic_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(basic_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(basic_reply)
        await expect(save_button).toContainClass('saved')

        await sleep(50)

        await page.reload()
        
        const initialiser = page.locator('.initialiser'),
              loader      = page.locator('.loader'),
              chat_list   = loader.locator('.chats'),
              latest_chat = chat_list.locator('.loader-chat').first()

        await expect(initialiser).toBeHidden()
        await expect(loader).toBeHidden()

        // ctrl+o (load)
        await page.keyboard.press('Control+o')
        await expect(loader).toBeVisible()
        await expect(latest_chat).toBeVisible()

        await page.keyboard.press('ArrowDown')
        await expect(latest_chat).toContainClass('keyboard-highlight')

        await page.keyboard.press('Enter')
        await expect(loader).toBeHidden()
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(basic_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(basic_reply)
    })

    test('we should be able to use the keyboard to change model and settings', async ({ page }) => {
        await page.goto('/')

        const default_model        = models.find(m => m.id === defaults.model),
              temp_and_top_p_model = models.find(m => m.settings.includes('temperature') && m.settings.includes('top_p')),
              model_button         = page.locator('.active-model-button'),
              model_icon           = model_button.locator('.icon'),
              temperature_button   = page.locator('.temperature-button'),
              top_p_button         = page.locator('.top_p-button')

        await expect(model_icon).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        // if default_model is last, fuck it don't care
        const default_model_index = models.findIndex(m => m.id === default_model.id),
              next_model          = models[default_model_index + 1]

        // cmd+m (next model)
        await page.keyboard.press('Meta+m')
        await expect(model_icon).toHaveAttribute('src', `/img/icons/models/${next_model.icon}`)

        // cmd+shift+m (previous model)
        await page.keyboard.press('Meta+Shift+m')
        await expect(model_icon).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        if (!default_model.settings.includes('temperature') || !default_model.settings.includes('top_p')) {
            await switchModel(page, temp_and_top_p_model)
            await sleep(200)
        }

        // ctrl+t (temperature)
        await page.keyboard.press('Control+t')
        await expect(temperature_button.locator('.value')).toHaveText((defaults.temperature + 0.1).toString())

        // ctrl+shift+t (temperature)
        await page.keyboard.press('Control+Shift+T')
        await expect(temperature_button.locator('.value')).toHaveText(defaults.temperature.toString())

        // ctrl+shift+p (top_p)
        await page.keyboard.press('Control+Shift+P')
        await expect(top_p_button.locator('.value')).toHaveText((defaults.top_p - 0.05).toString())

        // ctrl+p (top_p)
        await page.keyboard.press('Control+p')
        await expect(top_p_button.locator('.value')).toHaveText(defaults.top_p.toString())
    })

    test('we should be able to use the escape key to cancel and exit things', async ({ page }) => {
        await page.goto('/')

        const input             = page.locator('.primary-input-section .input'),
              chat              = page.locator('.chat'),
              user_message      = chat.locator('.messages .message.user'),
              ai_message        = chat.locator('.messages .message.assistant'),
              menu_button       = page.locator('.main-menu-button'),
              main_menu         = page.locator('.main-menu'),
              model_list_button = page.locator('.active-model-button'),
              model_list        = page.locator('.models-by-family'),
              loader            = page.locator('.loader'),
              prompt_editor     = page.locator('.prompt-editor')
              
        // close settings
        await menu_button.click()
        await expect(main_menu).toBeVisible()
        await page.keyboard.press('Escape')
        await expect(main_menu).toBeHidden()
        
        // close model list
        await model_list_button.click()
        await expect(model_list).toBeVisible()
        await page.keyboard.press('Escape')
        await expect(model_list).toBeHidden()
        
        // close prompt editor
        const system_prompt_button = page.locator('.system-prompt-button')
        await system_prompt_button.click()
        await expect(prompt_editor).toBeVisible()
        await page.keyboard.press('Escape')
        await expect(prompt_editor).toBeHidden()
        
        // close loader
        await page.keyboard.press('Control+o')
        await expect(loader).toBeVisible()
        await page.keyboard.press('Escape')
        await expect(loader).toBeHidden()

        // cancel fork
        await input.fill(basic_prompt)
        await page.keyboard.press('Enter')
        await expect(user_message).toHaveCount(1)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(basic_reply)

        await sleep(50)

        await input.fill('[SLOW] ' + basic_prompt)
        await page.keyboard.press('Enter')
        await expect(user_message).toHaveCount(2)
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(basic_reply)

        const fork_button          = ai_message.nth(0).locator('.message-controls-right .fork'),
              provisional_controls = ai_message.nth(0).locator('.provisional-fork-controls')
        
        await expect(fork_button).toBeVisible()

        await fork_button.click()
        await expect(user_message).toHaveCount(1)
        await expect(ai_message).toHaveCount(1)
        await expect(provisional_controls).toBeVisible()

        await page.keyboard.press('Escape')
        await expect(provisional_controls).toBeHidden()
        await expect(user_message).toHaveCount(2)
        await expect(ai_message).toHaveCount(2)
    })

    test('we should be able to use the keyboard to expand and collapse the input', async ({ page }) => {
        await page.goto('/')

        const input_section = page.locator('.primary-input-section')
        await expect(input_section).not.toContainClass('expanded')

        // ctrl+shift+up (expand input)
        await page.keyboard.press('Control+Shift+ArrowUp')
        await expect(input_section).toContainClass('expanded')

        // ctrl+shift+down (collapse input)
        await page.keyboard.press('Control+Shift+ArrowDown')
        await expect(input_section).not.toContainClass('expanded')
    })
})
