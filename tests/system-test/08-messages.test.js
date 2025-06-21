import { test, expect } from '@playwright/test'
import { sleep } from '../helpers/tools'
import { cssSanitised } from '../../src/lib/utils/helpers'
import { delay_prompt, delay_reply, controls_prompt, controls_reply, controls_prompt_2, controls_reply_2, slow_prompt, slow_reply } from '../mock/prompts/messages'

import models from '../../src/lib/fixtures/models'
import defaults from '../../src/lib/fixtures/defaults'

test.describe('Messages', () => {
    test('we should see a waiting message while waiting for the API connection to be established', async ({ page }) => {
        await page.goto('/')

        // needs to be Open AI for this test to work (see mock endpoint)
        const input               = page.locator('.primary-input-section .input'),
              model_list_button   = page.locator('.active-model-button'),
              model_list          = page.locator('.models-by-family'),
              openai_model        = models.find(m => m.type === 'open-ai'),
              openai_model_button = model_list.locator(`#model-button-${cssSanitised(openai_model.id)}`),
              active_model_icon   = model_list_button.locator('.icon'),
              chat                = page.locator('.chat'),
              user_message        = chat.locator('.messages .message.user'),
              connecting_div      = chat.locator('.connecting')

        await model_list_button.click()
        await expect(model_list).toBeVisible()
        await expect(openai_model_button).toBeVisible()

        await openai_model_button.click()
        await expect(model_list).toBeHidden()
        await expect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${openai_model.icon}`)
    
        await input.fill(delay_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(delay_prompt)

        await sleep(2000)

        await expect(connecting_div).toBeVisible()
        await expect(connecting_div.locator('.text')).toContainText(`Waiting for ${openai_model.hosted_at}`)
    })

    test('we should see a waiting message while waiting for the reply to start streaming', async ({ page }) => {
        await page.goto('/')

        // needs to be Open AI for this test to work (see mock endpoint)
        const input               = page.locator('.primary-input-section .input'),
              model_list_button   = page.locator('.active-model-button'),
              model_list          = page.locator('.models-by-family'),
              openai_model        = models.find(m => m.type === 'open-ai'),
              openai_model_button = model_list.locator(`#model-button-${cssSanitised(openai_model.id)}`),
              active_model_icon   = model_list_button.locator('.icon'),
              chat                = page.locator('.chat'),
              user_message        = chat.locator('.messages .message.user'),
              ai_message          = chat.locator('.messages .message.assistant')

        await model_list_button.click()
        await expect(model_list).toBeVisible()
        await expect(openai_model_button).toBeVisible()

        await openai_model_button.click()
        await expect(model_list).toBeHidden()
        await expect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${openai_model.icon}`)
    
        await input.fill(delay_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(delay_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.status-text')).toContainText(`Waiting for ${openai_model.short_name}`)
        await expect(ai_message.locator('.message-content')).toHaveText(delay_reply)
    })

    test('full controls should be visible on the last AI reply only', async ({ page }) => {
        await page.goto('/')

        const input        = page.locator('.primary-input-section .input'),
              chat         = page.locator('.chat'),
              user_message = chat.locator('.messages .message.user'),
              ai_message   = chat.locator('.messages .message.assistant')
              
        await input.fill(controls_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(controls_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(controls_reply)
        await expect(ai_message.locator('.message-controls-right .add')).toBeVisible()
        await expect(ai_message.locator('.message-controls-right .regenerate')).toBeVisible()
        await expect(ai_message.locator('.message-controls-right .delete')).toBeVisible()
        await expect(ai_message.locator('.message-controls-right .fork')).toBeHidden()
        await expect(ai_message.locator('.message-controls-left .star')).toBeVisible()

        await sleep(500)

        await input.fill(controls_prompt_2)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(2)
        await expect(user_message.nth(1).locator('.message-content')).toHaveText(controls_prompt_2)
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(controls_reply_2)

        await expect(ai_message.nth(0).locator('.message-controls-right .add')).not.toBeVisible()
        await expect(ai_message.nth(0).locator('.message-controls-right .regenerate')).not.toBeVisible()
        await expect(ai_message.nth(0).locator('.message-controls-right .delete')).not.toBeVisible()
        await expect(ai_message.nth(0).locator('.message-controls-right .fork')).toBeVisible()
        await expect(ai_message.nth(0).locator('.message-controls-left .star')).toBeVisible()

        await expect(ai_message.nth(1).locator('.message-controls-right .add')).toBeVisible()
        await expect(ai_message.nth(1).locator('.message-controls-right .regenerate')).toBeVisible()
        await expect(ai_message.nth(1).locator('.message-controls-right .delete')).toBeVisible()
        await expect(ai_message.nth(1).locator('.message-controls-right .fork')).not.toBeVisible()
        await expect(ai_message.nth(1).locator('.message-controls-left .star')).toBeVisible()
    })

    test('all message controls should be hidden while a reply is streaming', async ({ page }) => {
        await page.goto('/')

        // needs to be Open AI for this test to work (see mock endpoint)
        const input               = page.locator('.primary-input-section .input'),
              model_list_button   = page.locator('.active-model-button'),
              model_list          = page.locator('.models-by-family'),
              openai_model        = models.find(m => m.type === 'open-ai'),
              openai_model_button = model_list.locator(`#model-button-${cssSanitised(openai_model.id)}`),
              active_model_icon   = model_list_button.locator('.icon'),
              chat                = page.locator('.chat'),
              user_message        = chat.locator('.messages .message.user'),
              ai_message          = chat.locator('.messages .message.assistant'),
              controls_right      = ai_message.locator('.message-controls-right'),
              controls_left       = ai_message.locator('.message-controls-left')

        await model_list_button.click()
        await expect(model_list).toBeVisible()
        await expect(openai_model_button).toBeVisible()

        await openai_model_button.click()
        await expect(model_list).toBeHidden()
        await expect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${openai_model.icon}`)
              
        await input.fill(slow_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(slow_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(controls_right).toBeHidden()
        await expect(controls_left).toBeHidden()

        // need to make sure the reply takes >1s to stream
        await sleep(1000)

        // should still be hidden...
        await expect(controls_right).toBeHidden()
        await expect(controls_left).toBeHidden()

        await expect(ai_message.locator('.message-content')).toHaveText(slow_reply)
        await expect(controls_right).toBeVisible()
        await expect(controls_left).toBeVisible()
    })

    test('we should be able to star messages', async ({ page }) => {
        await page.goto('/')

        const input        = page.locator('.primary-input-section .input'),
              chat         = page.locator('.chat'),
              user_message = chat.locator('.messages .message.user'),
              ai_message   = chat.locator('.messages .message.assistant'),
              star_button  = ai_message.locator('.message-controls-left .star'),
              hover_info   = ai_message.locator('.hover-info-star'),
              save_button  = page.locator('.save-button')
        
        await input.fill(controls_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(controls_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message).not.toContainClass('streaming')
        await expect(ai_message).not.toContainClass('starred')
        await expect(star_button).toBeVisible()
        await expect(star_button).not.toContainClass('starred')

        await star_button.hover()
        await expect(ai_message).toContainClass('star-highlight')
        await expect(hover_info).toBeVisible()
        await expect(hover_info.locator('.text')).toHaveText('Add Star')

        await star_button.click()
        await expect(ai_message).toContainClass('starred')
        await expect(star_button).toContainClass('starred')

        // allow hover_info to transition
        await expect(hover_info.locator('.text')).toHaveCount(1)
        await expect(hover_info).toBeVisible()
        await expect(hover_info.locator('.text')).toHaveText('Remove Star')
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
        await expect(user_message.locator('.message-content')).toHaveText(controls_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(controls_reply)
        await expect(ai_message).toContainClass('starred')
        await expect(star_button).toBeVisible()
        await expect(star_button).toContainClass('starred')

        await star_button.hover()
        await expect(ai_message).toContainClass('star-highlight')
        await expect(hover_info).toBeVisible()
        await expect(hover_info.locator('.text')).toHaveText('Remove Star')

        await star_button.click()
        await expect(ai_message).not.toContainClass('starred')
        await expect(star_button).not.toContainClass('starred')

        await expect(save_button).toContainClass('saved')
    })

    test('we should be able to delete messages', async ({ page }) => {
        await page.goto('/')

        const input         = page.locator('.primary-input-section .input'),
              chat          = page.locator('.chat'),
              user_message  = chat.locator('.messages .message.user'),
              ai_message    = chat.locator('.messages .message.assistant'),
              delete_button = ai_message.locator('.message-controls-right .delete'),
              hover_info    = ai_message.locator('.hover-info-delete')

        await input.fill(controls_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(controls_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(controls_reply)
        await expect(delete_button).toBeVisible()

        await sleep(500)

        await input.fill(controls_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(2)
        await expect(user_message.nth(1).locator('.message-content')).toHaveText(controls_prompt)
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(controls_reply)
        await expect(delete_button).toBeVisible()

        await delete_button.hover()
        await expect(ai_message.nth(1)).toContainClass('delete-highlight')
        await expect(hover_info).toBeVisible()
        await expect(hover_info.locator('.text')).toHaveText('Delete')

        page.on('dialog', async dialog => { await dialog.accept() })

        await delete_button.click()
        await expect(ai_message).toHaveCount(1)
        await expect(user_message).toHaveCount(1)
        await expect(delete_button).toBeVisible()

        await delete_button.hover()
        await expect(ai_message).toContainClass('delete-highlight')
        await expect(hover_info).toBeVisible()
        await expect(hover_info.locator('.text')).toHaveText('Delete')

        await delete_button.click()
        await expect(ai_message).toHaveCount(0)
        await expect(user_message).toHaveCount(0)
        await expect(delete_button).toBeHidden()
    })

    test('we should be able to regenerate replies', async ({ page }) => {
        await page.goto('/')

        const default_model     = models.find(m => m.id === defaults.model),
              input             = page.locator('.primary-input-section .input'),
              chat              = page.locator('.chat'),
              user_message      = chat.locator('.messages .message.user'),
              ai_message        = chat.locator('.messages .message.assistant'),
              model_icon        = ai_message.locator('.avatar-container .avatar.ai'),
              regenerate_button = ai_message.locator('.message-controls-right .regenerate'),
              hover_info        = ai_message.locator('.hover-info-regenerate'),
              save_button       = page.locator('.save-button')

        await input.fill(controls_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(controls_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(controls_reply)
        await expect(model_icon).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)
        await expect(save_button).toContainClass('saved')
        await expect(regenerate_button).toBeVisible()

        await regenerate_button.hover()
        await expect(ai_message).toContainClass('regenerate-highlight')
        await expect(hover_info).toBeVisible()
        await expect(hover_info.locator('.text')).toContainText('Regenerate Reply')
        await expect(hover_info.locator('.model-name')).toHaveText(default_model.name)

        const model_list_button  = page.locator('.active-model-button'),
              model_list         = page.locator('.models-by-family'),
              other_model        = models.find(m => m.id !== defaults.model),
              other_model_button = model_list.locator(`#model-button-${cssSanitised(other_model.id)}`),
              active_model_icon  = model_list_button.locator('.icon')

        await model_list_button.click()
        await expect(model_list).toBeVisible()
        await expect(other_model_button).toBeVisible()

        await other_model_button.click()
        await expect(model_list).toBeHidden()
        await expect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${other_model.icon}`)

        await regenerate_button.hover()
        await expect(ai_message).toContainClass('regenerate-highlight')
        await expect(hover_info).toBeVisible()
        await expect(hover_info.locator('.text')).toContainText('Regenerate Reply')
        await expect(hover_info.locator('.model-name')).toHaveText(other_model.name)

        page.on('dialog', async dialog => { await dialog.accept() })

        await regenerate_button.click()
        await expect(ai_message.locator('.message-content')).toHaveText(controls_reply)
        await expect(model_icon).toHaveAttribute('src', `/img/icons/models/${other_model.icon}`)
    })
})
