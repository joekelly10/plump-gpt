import { test, expect } from '@playwright/test'
import { sleep } from '../helpers/tools'
import { switchModel } from '../helpers/actions'
import { short_reply_prompt, short_reply, medium_reply_prompt, medium_reply, long_reply_prompt, long_reply } from '../mock/prompts/messages'

import models from '../../src/lib/fixtures/models'
import defaults from '../../src/lib/fixtures/defaults'

test.describe('Forks', () => {
    test('we should be able to create many replies to one prompt', async ({ page }) => {
        await page.goto('/')

        const default_model    = models.find(m => m.id === defaults.model),
              input            = page.locator('.primary-input-section .input'),
              chat             = page.locator('.chat'),
              user_message     = chat.locator('.messages .message.user'),
              ai_message       = chat.locator('.messages .message.assistant'),
              add_reply_button = ai_message.locator('.message-controls-right .add'),
              hover_info       = ai_message.locator('.hover-info-add-reply'),
              forks_container  = page.locator('.prompt-forks-container'),
              fork_buttons     = forks_container.locator('.prompt-fork-button')

        // send first message
        await input.fill(short_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)
        await expect(add_reply_button).toBeVisible()

        await sleep(100)

        // add second message
        const second_model = models.find(m => m.id !== defaults.model)
        await switchModel(page, second_model)

        await add_reply_button.hover()
        await expect(hover_info).toBeVisible()
        await expect(hover_info.locator('.model-icon')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)
        await expect(hover_info.locator('.text')).toContainText(`Add Another Reply`)
        await expect(hover_info.locator('.model-name')).toHaveText(second_model.name)
        await expect(user_message).toContainClass('add-reply-highlight')
        await expect(ai_message).toContainClass('add-reply-highlight')

        await add_reply_button.click()
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(forks_container).toBeVisible()
        await expect(fork_buttons).toHaveCount(2)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('active')
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)

        await sleep(100)

        // switch back to first fork
        await fork_buttons.nth(0).click()
        await expect(fork_buttons.nth(0)).toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        await sleep(100)

        // add third message
        const third_model = models.find(m => m.id !== defaults.model && m.id !== second_model.id)
        await switchModel(page, third_model)

        await add_reply_button.hover()
        await expect(fork_buttons).toHaveCount(3)
        await expect(fork_buttons.nth(2)).toContainClass('temporary')
        
        await add_reply_button.click()
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(forks_container).toBeVisible()
        await expect(fork_buttons).toHaveCount(3)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(fork_buttons.nth(2)).toContainClass('active')
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${third_model.icon}`)

        // switch to second fork
        await fork_buttons.nth(1).click()
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('active')
        await expect(fork_buttons.nth(2)).not.toContainClass('active')
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)

        // switch to first fork
        await fork_buttons.nth(0).click()
        await expect(fork_buttons.nth(0)).toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(fork_buttons.nth(2)).not.toContainClass('active')
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        await add_reply_button.hover()
        await expect(fork_buttons).toHaveCount(4)
        await expect(fork_buttons.nth(3)).toContainClass('temporary')
    })

    test('we should be able to delete any one reply out of many', async ({ page }) => {
        await page.goto('/')

        const default_model     = models.find(m => m.id === defaults.model),
              input             = page.locator('.primary-input-section .input'),
              chat              = page.locator('.chat'),
              user_message      = chat.locator('.messages .message.user'),
              ai_message        = chat.locator('.messages .message.assistant'),
              add_reply_button  = ai_message.locator('.message-controls-right .add'),
              delete_button     = ai_message.locator('.message-controls-right .delete'),
              hover_info_delete = ai_message.locator('.hover-info-delete'),
              forks_container   = page.locator('.prompt-forks-container'),
              fork_buttons      = forks_container.locator('.prompt-fork-button')

        // send first message
        await input.fill(short_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        await sleep(100)

        // add second message
        const second_model = models.find(m => m.id !== defaults.model)
        await switchModel(page, second_model)

        await add_reply_button.click()
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(forks_container).toBeVisible()
        await expect(fork_buttons).toHaveCount(2)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('active')
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)

        await sleep(100)

        // add third message
        const third_model = models.find(m => m.id !== defaults.model && m.id !== second_model.id)
        await switchModel(page, third_model)
        
        await add_reply_button.click()
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(fork_buttons).toHaveCount(3)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(fork_buttons.nth(2)).toContainClass('active')
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${third_model.icon}`)

        await sleep(100)

        // test delete highlighting
        await delete_button.hover()
        await expect(hover_info_delete).toBeVisible()
        await expect(hover_info_delete.locator('.text')).toContainText(`Delete`)
        await expect(ai_message).toContainClass('delete-highlight')
        await expect(forks_container).toContainClass('delete-fork-highlight')

        // switch to first fork
        await fork_buttons.nth(0).click()
        await expect(fork_buttons.nth(0)).toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(fork_buttons.nth(2)).not.toContainClass('active')
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        await sleep(100)

        // delete first fork
        page.on('dialog', async dialog => { await dialog.accept() })

        await delete_button.click()
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(fork_buttons).toHaveCount(2)
        await expect(fork_buttons.nth(0)).toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)

        await sleep(100)

        // switch to second fork (of 2 remaining)
        await fork_buttons.nth(1).click()
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('active')
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${third_model.icon}`)

        await sleep(100)

        // delete second fork
        await delete_button.click()
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(forks_container).not.toBeVisible()
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)
    })

    test('we should be able to regenerate any one reply out of many', async ({ page }) => {
        await page.goto('/')

        const default_model         = models.find(m => m.id === defaults.model),
              input                 = page.locator('.primary-input-section .input'),
              chat                  = page.locator('.chat'),
              user_message          = chat.locator('.messages .message.user'),
              ai_message            = chat.locator('.messages .message.assistant'),
              add_reply_button      = ai_message.locator('.message-controls-right .add'),
              regenerate_button     = ai_message.locator('.message-controls-right .regenerate'),
              hover_info_regenerate = ai_message.locator('.hover-info-regenerate'),
              forks_container       = page.locator('.prompt-forks-container'),
              fork_buttons          = forks_container.locator('.prompt-fork-button')

        // send first message
        await input.fill(short_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        await sleep(100)

        // add second message
        const second_model = models.find(m => m.id !== defaults.model)
        await switchModel(page, second_model)

        await add_reply_button.click()
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(forks_container).toBeVisible()
        await expect(fork_buttons).toHaveCount(2)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('active')
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)

        await sleep(100)

        // add third message
        const third_model = models.find(m => m.id !== defaults.model && m.id !== second_model.id)
        await switchModel(page, third_model)
        
        await add_reply_button.click()
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(fork_buttons).toHaveCount(3)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(fork_buttons.nth(2)).toContainClass('active')
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${third_model.icon}`)

        await sleep(100)

        // test regenerate highlighting
        const fourth_model = models.find(m => ![defaults.model, second_model.id, third_model.id].includes(m.id))
        await switchModel(page, fourth_model)

        await regenerate_button.hover()
        await expect(hover_info_regenerate).toBeVisible()
        await expect(hover_info_regenerate.locator('.text')).toContainText(`Regenerate Reply`)
        await expect(hover_info_regenerate.locator('.model-name')).toHaveText(fourth_model.name)
        await expect(ai_message).toContainClass('regenerate-highlight')

        // regenerate third fork
        page.on('dialog', async dialog => { await dialog.accept() })

        await regenerate_button.click()
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(fork_buttons).toHaveCount(3)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(fork_buttons.nth(2)).toContainClass('active')
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${fourth_model.icon}`)

        await sleep(100)

        // switch to second fork
        await fork_buttons.nth(1).click()
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('active')
        await expect(fork_buttons.nth(2)).not.toContainClass('active')
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)

        await sleep(100)

        // regenerate second fork
        await regenerate_button.click()
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(fork_buttons).toHaveCount(3)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('active')
        await expect(fork_buttons.nth(2)).not.toContainClass('active')
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${fourth_model.icon}`)

        await sleep(100)
        
        // switch to first fork
        await fork_buttons.nth(0).click()
        await expect(fork_buttons.nth(0)).toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(fork_buttons.nth(2)).not.toContainClass('active')
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        await sleep(100)

        // regenerate first fork
        await regenerate_button.click()
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(fork_buttons).toHaveCount(3)
        await expect(fork_buttons.nth(0)).toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(fork_buttons.nth(2)).not.toContainClass('active')
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${fourth_model.icon}`)
    })

    test('we should be able to add many prompts to one reply', async ({ page }) => {
        await page.goto('/')

        const default_model             = models.find(m => m.id === defaults.model),
              input                     = page.locator('.primary-input-section .input'),
              chat                      = page.locator('.chat'),
              user_message              = chat.locator('.messages .message.user'),
              ai_message                = chat.locator('.messages .message.assistant'),
              create_fork_button        = ai_message.locator('.message-controls-right .fork'),
              provisional_fork_controls = ai_message.locator('.provisional-fork-controls'),
              add_reply_button          = provisional_fork_controls.locator('.add-reply'),
              cancel_fork_button        = provisional_fork_controls.locator('.cancel-fork'),
              forks_container           = page.locator('.reply-forks-container'),
              fork_buttons              = forks_container.locator('.reply-fork-button')

        // send first message
        await input.fill(short_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        await sleep(100)

        // send second message
        await input.fill(medium_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(2)
        await expect(user_message.nth(1).locator('.message-content')).toHaveText(medium_reply_prompt)
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)
        await expect(create_fork_button).toBeVisible()

        await sleep(100)

        // create a fork from first message
        await create_fork_button.click()
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)
        await expect(forks_container).toBeVisible()
        await expect(fork_buttons).toHaveCount(2)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('provisional')
        await expect(create_fork_button).toBeHidden()
        await expect(provisional_fork_controls).toBeVisible()
        await expect(add_reply_button).toBeVisible()
        await expect(cancel_fork_button).toBeVisible()

        await sleep(100)

        // add message to fork #2
        const second_model = models.find(m => m.id !== default_model.id)
        await switchModel(page, second_model)

        await input.fill(medium_reply_prompt, medium_reply)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(2)
        await expect(user_message.nth(1).locator('.message-content')).toHaveText(medium_reply_prompt)
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)
        await expect(fork_buttons).toHaveCount(2)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('provisional')

        await sleep(100)

        // switch back to fork #1 (in order to test cancel fork behaviour in a sec)
        await fork_buttons.nth(0).click()
        await expect(fork_buttons.nth(0)).toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        await sleep(100)

        // create another fork from first message
        await create_fork_button.click()
        await expect(fork_buttons).toHaveCount(3)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(fork_buttons.nth(2)).toContainClass('active')
        await expect(fork_buttons.nth(2)).toContainClass('provisional')

        await sleep(100)

        // cancel the fork (we should be taken back to fork #1, i.e. where we came from, not fork #2)
        await cancel_fork_button.click()
        await expect(fork_buttons).toHaveCount(2)
        await expect(fork_buttons.nth(0)).toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        await sleep(100)

        // create a fork again
        await create_fork_button.click()
        await expect(fork_buttons).toHaveCount(3)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(fork_buttons.nth(2)).toContainClass('active')
        await expect(fork_buttons.nth(2)).toContainClass('provisional')

        await sleep(100)

        // add message to fork #3
        const third_model = models.find(m => m.id !== default_model.id && m.id !== second_model.id)
        await switchModel(page, third_model)

        await input.fill(medium_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(2)
        await expect(user_message.nth(1).locator('.message-content')).toHaveText(medium_reply_prompt)
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${third_model.icon}`)

        await expect(fork_buttons).toHaveCount(3)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(fork_buttons.nth(2)).toContainClass('active')
        await expect(fork_buttons.nth(2)).not.toContainClass('provisional')
    })

    test('we should be able to delete any one prompt out of many', async ({ page }) => {
        await page.goto('/')

        const default_model             = models.find(m => m.id === defaults.model),
              input                     = page.locator('.primary-input-section .input'),
              chat                      = page.locator('.chat'),
              user_message              = chat.locator('.messages .message.user'),
              ai_message                = chat.locator('.messages .message.assistant'),
              create_fork_button        = ai_message.locator('.message-controls-right .fork'),
              provisional_fork_controls = ai_message.locator('.provisional-fork-controls'),
              cancel_fork_button        = provisional_fork_controls.locator('.cancel-fork'),
              forks_container           = page.locator('.reply-forks-container'),
              fork_buttons              = forks_container.locator('.reply-fork-button'),
              delete_button             = ai_message.locator('.message-controls-right .delete')

        // send first message
        await input.fill(short_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        await sleep(100)

        // send second message
        await input.fill(medium_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(2)
        await expect(user_message.nth(1).locator('.message-content')).toHaveText(medium_reply_prompt)
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        await sleep(100)

        // create a fork from first message
        await create_fork_button.click()
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)
        await expect(forks_container).toBeVisible()
        await expect(fork_buttons).toHaveCount(2)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('provisional')
        await expect(create_fork_button).toBeHidden()

        await sleep(100)

        // add message to fork #2
        const second_model = models.find(m => m.id !== default_model.id)
        await switchModel(page, second_model)

        await input.fill(medium_reply_prompt, medium_reply)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(2)
        await expect(user_message.nth(1).locator('.message-content')).toHaveText(medium_reply_prompt)
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)
        await expect(fork_buttons).toHaveCount(2)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('provisional')

        await sleep(100)

        // create another fork
        await create_fork_button.click()
        await expect(fork_buttons).toHaveCount(3)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(fork_buttons.nth(2)).toContainClass('active')
        await expect(fork_buttons.nth(2)).toContainClass('provisional')

        await sleep(100)

        // add message to fork #3
        const third_model = models.find(m => m.id !== default_model.id && m.id !== second_model.id)
        await switchModel(page, third_model)

        await input.fill(medium_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(2)
        await expect(user_message.nth(1).locator('.message-content')).toHaveText(medium_reply_prompt)
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${third_model.icon}`)

        await expect(fork_buttons).toHaveCount(3)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(fork_buttons.nth(2)).toContainClass('active')
        await expect(fork_buttons.nth(2)).not.toContainClass('provisional')

        // switch to fork #1
        await fork_buttons.nth(0).click()
        await expect(fork_buttons.nth(0)).toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(fork_buttons.nth(2)).not.toContainClass('active')
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        await sleep(100)

        // delete message from fork #1
        page.on('dialog', async dialog => { await dialog.accept() })

        await delete_button.click()
        await expect(fork_buttons).toHaveCount(3)
        await expect(fork_buttons.nth(0)).toContainClass('active')
        await expect(fork_buttons.nth(0)).toContainClass('provisional')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(fork_buttons.nth(2)).not.toContainClass('active')

        // allow delete animation to finish
        await sleep(300)

        // cancel/remove the now-empty fork #1
        await cancel_fork_button.click()
        await expect(fork_buttons).toHaveCount(2)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('active')
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${third_model.icon}`)

        await sleep(100)

        // delete message from fork #2
        await delete_button.click()
        await expect(fork_buttons).toHaveCount(2)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('provisional')

        // allow delete animation to finish
        await sleep(300)

        // cancel/remove the now-empty fork #2
        await fork_buttons.nth(0).click()
        await expect(forks_container).toBeHidden()
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)        
    })

    test('we should be able to regenerate any one prompt out of many', async ({ page }) => {
        await page.goto('/')

        const default_model             = models.find(m => m.id === defaults.model),
              input                     = page.locator('.primary-input-section .input'),
              chat                      = page.locator('.chat'),
              user_message              = chat.locator('.messages .message.user'),
              ai_message                = chat.locator('.messages .message.assistant'),
              create_fork_button        = ai_message.locator('.message-controls-right .fork'),
              provisional_fork_controls = ai_message.locator('.provisional-fork-controls'),
              cancel_fork_button        = provisional_fork_controls.locator('.cancel-fork'),
              forks_container           = page.locator('.reply-forks-container'),
              fork_buttons              = forks_container.locator('.reply-fork-button'),
              regenerate_button         = ai_message.locator('.message-controls-right .regenerate')

        // send first message
        await input.fill(short_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        await sleep(100)

        // send second message
        await input.fill(medium_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(2)
        await expect(user_message.nth(1).locator('.message-content')).toHaveText(medium_reply_prompt)
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        await sleep(100)

        // create a fork from first message
        await create_fork_button.click()
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)
        await expect(forks_container).toBeVisible()
        await expect(fork_buttons).toHaveCount(2)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('provisional')
        await expect(create_fork_button).toBeHidden()

        await sleep(100)

        // add message to fork #2
        const second_model = models.find(m => m.id !== default_model.id)
        await switchModel(page, second_model)

        await input.fill(medium_reply_prompt, medium_reply)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(2)
        await expect(user_message.nth(1).locator('.message-content')).toHaveText(medium_reply_prompt)
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)
        await expect(fork_buttons).toHaveCount(2)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('provisional')

        await sleep(100)

        // create another fork
        await create_fork_button.click()
        await expect(fork_buttons).toHaveCount(3)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(fork_buttons.nth(2)).toContainClass('active')
        await expect(fork_buttons.nth(2)).toContainClass('provisional')

        await sleep(100)

        // add message to fork #3
        const third_model = models.find(m => m.id !== default_model.id && m.id !== second_model.id)
        await switchModel(page, third_model)

        await input.fill(medium_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(2)
        await expect(user_message.nth(1).locator('.message-content')).toHaveText(medium_reply_prompt)
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${third_model.icon}`)

        await expect(fork_buttons).toHaveCount(3)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(fork_buttons.nth(2)).toContainClass('active')
        await expect(fork_buttons.nth(2)).not.toContainClass('provisional')

        // regenerate message from fork #3
        const fourth_model = models.find(m => ![default_model.id, second_model.id, third_model.id].includes(m.id))
        await switchModel(page, fourth_model)

        page.on('dialog', async dialog => { await dialog.accept() })

        await regenerate_button.click()

        // allow delete animation to finish
        await sleep(300)

        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(fork_buttons.nth(2)).toContainClass('active')
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${fourth_model.icon}`)

        // switch to fork #2
        await fork_buttons.nth(1).click()
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('active')
        await expect(fork_buttons.nth(2)).not.toContainClass('active')
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)

        // regenerate message from fork #2
        await regenerate_button.click()

        // allow delete animation to finish
        await sleep(300)

        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${fourth_model.icon}`)

        await sleep(100)

        // switch to fork #1
        await fork_buttons.nth(0).click()
        await expect(fork_buttons.nth(0)).toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(fork_buttons.nth(2)).not.toContainClass('active')
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        // regenerate message from fork #1
        await regenerate_button.click()

        // allow delete animation to finish
        await sleep(300)

        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${fourth_model.icon}`)
    })

    test ('clicking a fork button should cancel a provisional fork', async ({ page }) => {
        await page.goto('/')

        const default_model      = models.find(m => m.id === defaults.model),
              input              = page.locator('.primary-input-section .input'),
              chat               = page.locator('.chat'),
              user_message       = chat.locator('.messages .message.user'),
              ai_message         = chat.locator('.messages .message.assistant'),
              create_fork_button = ai_message.locator('.message-controls-right .fork'),
              forks_container    = page.locator('.reply-forks-container'),
              fork_buttons       = forks_container.locator('.reply-fork-button')

        // send first message
        await input.fill(short_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        await sleep(100)

        // send second message
        await input.fill(medium_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(2)
        await expect(user_message.nth(1).locator('.message-content')).toHaveText(medium_reply_prompt)
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        await sleep(100)

        // create a fork from first message
        await create_fork_button.click()
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)
        await expect(forks_container).toBeVisible()
        await expect(fork_buttons).toHaveCount(2)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('provisional')
        await expect(create_fork_button).toBeHidden()

        await sleep(100)

        // click fork #1 to cancel the provisional fork
        await fork_buttons.nth(0).click()
        await expect(forks_container).toBeHidden()
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)   
        await expect(create_fork_button).toBeVisible()
    })
})
