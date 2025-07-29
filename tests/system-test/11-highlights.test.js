import { test, expect } from '@playwright/test'
import { sleep } from '../helpers/tools'
import { switchModel } from '../helpers/actions'
import { short_reply_prompt, short_reply, medium_reply_prompt, medium_reply } from '../mock/prompts/messages'
import { basic_reasoning_prompt, basic_reasoning_content, basic_reasoning_reply } from '../mock/prompts/basic_reasoning'

import models from '../../src/lib/fixtures/models'
import defaults from '../../src/lib/fixtures/defaults'

test.describe('Highlights', () => {
    test('we should be able to highlight text in a regular message', async ({ page }) => {
        await page.goto('/')

        const input                = page.locator('.primary-input-section .input'),
              chat                 = page.locator('.chat'),
              user_message         = chat.locator('.messages .message.user'),
              ai_message           = chat.locator('.messages .message.assistant'),
              selection_action     = chat.locator('.selection-action'),
              quote_button         = selection_action.locator('.quote-button'),
              add_highlight_button = selection_action.locator('.add-highlight-button'),
              save_button          = page.locator('.save-button')

        const text_to_highlight = 'The agents of orange, the priests of Hiroshima.'

        // send first message
        await input.fill(short_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)

        await sleep(50)

        // send second message
        await input.fill(medium_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(2)
        await expect(user_message.nth(1).locator('.message-content')).toHaveText(medium_reply_prompt)
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.message-content')).toContainText(text_to_highlight)

        // select text with mouse
        const coordinates = await page.evaluate((text_to_highlight) => {
            const message_el = document.querySelector('#message-4 .message-content')
            
            if (message_el && message_el.textContent.includes(text_to_highlight)) {
                const paragraph_node = message_el.querySelector('p:first-child'),
                      text_node      = paragraph_node.firstChild,
                      start_index    = text_node.textContent.indexOf(text_to_highlight),
                      end_index      = start_index + text_to_highlight.length

                const range = document.createRange()
                range.setStart(text_node, start_index)
                range.setEnd(text_node, end_index)

                // get start + end separately, because they can be on different lines
                const start_range = document.createRange()
                start_range.setStart(text_node, start_index)
                start_range.setEnd(text_node, start_index)
                
                const end_range = document.createRange()
                end_range.setStart(text_node, end_index)
                end_range.setEnd(text_node, end_index)

                const start_rect = start_range.getBoundingClientRect(),
                      end_rect   = end_range.getBoundingClientRect()

                return {
                    start: { x: start_rect.left, y: start_rect.top + start_rect.height / 2 },
                    end:   { x: end_rect.left, y: end_rect.top + end_rect.height / 2 }
                }
            }

            return null
        }, text_to_highlight)

        expect(coordinates).not.toBeNull()

        await page.mouse.move(coordinates.start.x, coordinates.start.y)
        await page.mouse.down()
        await page.mouse.move(coordinates.end.x, coordinates.end.y)
        await page.mouse.up()

        // check selection
        const selectedText = await page.evaluate(() => window.getSelection().toString())
        expect(selectedText).toBe(text_to_highlight)

        await expect(selection_action).toBeVisible()
        await expect(quote_button).toBeVisible()
        await expect(add_highlight_button).toBeVisible()

        const highlight = ai_message.nth(1).locator('span._text-highlight')

        // add highlight
        await add_highlight_button.click()
        await expect(highlight).toHaveCount(1)
        await expect(highlight).toHaveText(text_to_highlight)

        // should be autosaved
        await expect(save_button).toContainClass('saved')

        await page.reload()

        const load_button = page.locator('.load-button'),
              loader      = page.locator('.loader'),
              chat_list   = loader.locator('.chats'),
              latest_chat = chat_list.locator('.loader-chat').first()

        await load_button.click()
        await expect(loader).toBeVisible()
        await expect(latest_chat).toBeVisible()

        await latest_chat.click()
        await expect(loader).toBeHidden()
        await expect(user_message).toHaveCount(2)
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(highlight).toHaveCount(1)
        await expect(highlight).toHaveText(text_to_highlight)

        page.on('dialog', async dialog => { await dialog.accept() })

        await highlight.click()
        await expect(highlight).toHaveCount(0)
        await expect(save_button).toContainClass('saved')

        await page.reload()

        await load_button.click()
        await expect(loader).toBeVisible()
        await expect(latest_chat).toBeVisible()

        await latest_chat.click()
        await expect(loader).toBeHidden()
        await expect(user_message).toHaveCount(2)
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(highlight).toHaveCount(0)
    })

    test('we should be able to highlight text in a message with reasoning', async ({ page }) => {
        await page.goto('/')

        const default_model        = models.find(model => model.id === defaults.model),
              input                = page.locator('.primary-input-section .input'),
              chat                 = page.locator('.chat'),
              user_message         = chat.locator('.messages .message.user'),
              ai_message           = chat.locator('.messages .message.assistant'),
              selection_action     = chat.locator('.selection-action'),
              quote_button         = selection_action.locator('.quote-button'),
              add_highlight_button = selection_action.locator('.add-highlight-button'),
              highlights           = ai_message.locator('span._text-highlight'),
              save_button          = page.locator('.save-button')
        
        if (!default_model.is_reasoner || ['open-ai', 'anthropic'].includes(default_model.type)) {
            const reasoning_model = models.find(model => !['open-ai', 'anthropic'].includes(model.type) && model.is_reasoner)
            await switchModel(page, reasoning_model)
        }

        const reasoning_to_highlight    = 'the number of woods a woodchuck could chuck',
              message_text_to_highlight = '1 wood.'

        // send first message
        await input.fill(basic_reasoning_prompt)
        await page.keyboard.press('Enter')
        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(basic_reasoning_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(basic_reasoning_reply)
        await expect(ai_message.locator('.message-content')).toContainText(message_text_to_highlight)

        // select reasoning text with mouse
        const reasoning_highlight_coords = await page.evaluate((reasoning_to_highlight) => {
            const message_el = document.querySelector('#message-2 .reasoning-content')
            
            if (message_el && message_el.textContent.includes(reasoning_to_highlight)) {
                const paragraph_node = message_el.querySelector('p'),
                      text_node      = paragraph_node.firstChild,
                      start_index    = text_node.textContent.indexOf(reasoning_to_highlight),
                      end_index      = start_index + reasoning_to_highlight.length

                const range = document.createRange()
                range.setStart(text_node, start_index)
                range.setEnd(text_node, end_index)

                // get start + end separately, because they can be on different lines
                const start_range = document.createRange()
                start_range.setStart(text_node, start_index)
                start_range.setEnd(text_node, start_index)
                
                const end_range = document.createRange()
                end_range.setStart(text_node, end_index)
                end_range.setEnd(text_node, end_index)

                const start_rect = start_range.getBoundingClientRect(),
                      end_rect   = end_range.getBoundingClientRect()

                return {
                    start: { x: start_rect.left, y: start_rect.top + start_rect.height / 2 },
                    end:   { x: end_rect.left, y: end_rect.top + end_rect.height / 2 }
                }
            }

            return null
        }, reasoning_to_highlight)

        expect(reasoning_highlight_coords).not.toBeNull()

        await page.mouse.move(reasoning_highlight_coords.start.x, reasoning_highlight_coords.start.y)
        await page.mouse.down()
        await page.mouse.move(reasoning_highlight_coords.end.x, reasoning_highlight_coords.end.y)
        await page.mouse.up()

        // check selection
        const reasoning_selectedText = await page.evaluate(() => window.getSelection().toString())
        expect(reasoning_selectedText).toBe(reasoning_to_highlight)

        await expect(selection_action).toBeVisible()
        await expect(quote_button).toBeVisible()
        await expect(add_highlight_button).toBeVisible()

        // add reasoning highlight
        await add_highlight_button.click()
        await expect(highlights).toHaveCount(1)
        await expect(highlights.nth(0)).toHaveText(reasoning_to_highlight)

        await sleep(50)

        // select message text with mouse
        const message_highlight_coords = await page.evaluate((message_text_to_highlight) => {
            const message_el = document.querySelector('#message-2 .message-content')
            
            if (message_el && message_el.textContent.includes(message_text_to_highlight)) {
                const paragraph_node = message_el.querySelector('p'),
                      text_node      = paragraph_node.firstChild,
                      start_index    = text_node.textContent.indexOf(message_text_to_highlight),
                      end_index      = start_index + message_text_to_highlight.length

                const range = document.createRange()
                range.setStart(text_node, start_index)
                range.setEnd(text_node, end_index)

                // get start + end separately, because they can be on different lines
                const start_range = document.createRange()
                start_range.setStart(text_node, start_index)
                start_range.setEnd(text_node, start_index)
                
                const end_range = document.createRange()
                end_range.setStart(text_node, end_index)
                end_range.setEnd(text_node, end_index)

                const start_rect = start_range.getBoundingClientRect(),
                      end_rect   = end_range.getBoundingClientRect()

                return {
                    start: { x: start_rect.left, y: start_rect.top + start_rect.height / 2 },
                    end:   { x: end_rect.left, y: end_rect.top + end_rect.height / 2 }
                }
            }

            return null
        }, message_text_to_highlight)

        expect(message_highlight_coords).not.toBeNull()

        await page.mouse.move(message_highlight_coords.start.x, message_highlight_coords.start.y)
        await page.mouse.down()
        await page.mouse.move(message_highlight_coords.end.x, message_highlight_coords.end.y)
        await page.mouse.up()

        // check selection
        const selected_text = await page.evaluate(() => window.getSelection().toString())
        expect(selected_text).toBe(message_text_to_highlight)

        await expect(selection_action).toBeVisible()
        await expect(quote_button).toBeVisible()
        await expect(add_highlight_button).toBeVisible()

        // add message highlight
        await add_highlight_button.click()
        await expect(highlights).toHaveCount(2)
        await expect(highlights.nth(0)).toHaveText(reasoning_to_highlight)
        await expect(highlights.nth(1)).toHaveText(message_text_to_highlight)

        // should be autosaved
        await expect(save_button).toContainClass('saved')

        await page.reload()

        const load_button = page.locator('.load-button'),
              loader      = page.locator('.loader'),
              chat_list   = loader.locator('.chats'),
              latest_chat = chat_list.locator('.loader-chat').first()

        await load_button.click()
        await expect(loader).toBeVisible()
        await expect(latest_chat).toBeVisible()

        await latest_chat.click()
        await expect(loader).toBeHidden()
        await expect(user_message).toHaveCount(1)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(basic_reasoning_reply)
        await expect(highlights).toHaveCount(2)
        await expect(highlights.nth(0)).toHaveText(reasoning_to_highlight)
        await expect(highlights.nth(1)).toHaveText(message_text_to_highlight)

        page.on('dialog', async dialog => { await dialog.accept() })

        await highlights.nth(1).click()
        await expect(highlights).toHaveCount(1)
        await expect(highlights.nth(0)).toHaveText(reasoning_to_highlight)
        await expect(save_button).toContainClass('saved')

        await page.reload()

        await load_button.click()
        await expect(loader).toBeVisible()
        await expect(latest_chat).toBeVisible()

        await latest_chat.click()
        await expect(loader).toBeHidden()
        await expect(user_message).toHaveCount(1)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(basic_reasoning_reply)
        await expect(highlights).toHaveCount(1)
        await expect(highlights.nth(0)).toHaveText(reasoning_to_highlight)
    })
})
