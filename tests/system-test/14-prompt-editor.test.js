import { test, expect } from '@playwright/test'
import { basic_prompt, basic_reply } from '../mock/prompts/basic_reply'
import { custom_prompt_title, custom_prompt_message, custom_prompt_title_2, custom_prompt_message_2 } from '../mock/prompts/system_prompt'

test.describe('Prompt Editor', () => {
    test('the system prompt should be read-only when a chat has messages', async ({ page }) => {
        await page.goto('/')

        const input        = page.locator('.primary-input-section .input'),
              user_message = page.locator('.chat .messages .message.user'),
              ai_message   = page.locator('.chat .messages .message.assistant')

        await input.fill(basic_prompt)
        await page.keyboard.press('Enter')
        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(basic_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(basic_reply)
        
        const system_prompt_button = page.locator('.system-prompt-button'),
              prompt_editor        = page.locator('.prompt-editor'),
              title_input          = prompt_editor.locator('.title-input'),
              prompt_input         = prompt_editor.locator('.prompt-input'),
              close_button         = prompt_editor.locator('.buttons .close-button')

        await system_prompt_button.click()
        await expect(prompt_editor).toBeVisible()
        await expect(prompt_editor).toContainClass('read-only')
        await expect(title_input).toBeDisabled()
        await expect(prompt_input).toBeDisabled()

        await close_button.click()
        await expect(prompt_editor).toBeHidden()
    })

    test('we should be able to copy the read-only prompt', async ({ browser }) => {
        const context = await browser.newContext({
            permissions: ['clipboard-read', 'clipboard-write']
        })
        const page = await context.newPage()

        await page.goto('/')

        const input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')

        await input.fill(basic_prompt)
        await page.keyboard.press('Enter')
        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(basic_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(basic_reply)
        
        const system_prompt_button = page.locator('.system-prompt-button'),
              prompt_editor        = page.locator('.prompt-editor'),
              copy_button          = prompt_editor.locator('.buttons .copy-button')

        await system_prompt_button.click()
        await expect(prompt_editor).toBeVisible()
        await expect(copy_button).toBeVisible()

        await copy_button.click()
        await expect(copy_button).toHaveText('Copied!')

        const clipboard_text = await page.evaluate(() => navigator.clipboard.readText())
        expect(clipboard_text).toContain('Conrad Poohs')
    })
})

test.describe.serial('Prompt Editor (db)', () => {
    test('we should be able to update the current system prompt (🔗 1/3)', async ({ page }) => {
        await page.goto('/')

        const initialiser = page.locator('.initialiser')
        await expect(initialiser).toBeHidden()

        const prompt_editor_button = page.locator('.system-prompt-button'),
            prompt_editor        = page.locator('.prompt-editor'),
            title_input          = prompt_editor.locator('.title-input'),
            prompt_input         = prompt_editor.locator('.prompt-input'),
            cancel_button        = prompt_editor.locator('.buttons .cancel-button'),
            save_button          = prompt_editor.locator('.buttons .save-button'),
            prompt_list_button   = prompt_editor.locator('.prompt-list .prompt-list-button.selected')
        
        await prompt_editor_button.click()
        await expect(prompt_editor).toBeVisible()
        await expect(title_input).toBeVisible()
        await expect(title_input).toBeEditable()
        await expect(prompt_input).toBeVisible()
        await expect(prompt_input).toBeEditable()

        await title_input.fill(custom_prompt_title)
        await expect(prompt_list_button).toContainClass('modified')
        await expect(prompt_list_button.locator('.title')).toHaveText(custom_prompt_title)
        await expect(prompt_list_button.locator('.tag.default-tag')).toBeVisible()
        await expect(prompt_list_button.locator('.tag.active-tag')).toBeVisible()
        await expect(prompt_list_button.locator('.tag.modified-tag')).toBeVisible()

        await cancel_button.click()
        await expect(prompt_editor).toBeHidden()

        await prompt_editor_button.click()
        await expect(prompt_editor).toBeVisible()
        await expect(prompt_list_button).not.toContainClass('modified')

        await prompt_input.fill(custom_prompt_message)
        await expect(prompt_list_button).toContainClass('modified')
        await expect(prompt_list_button.locator('.message')).toContainText(custom_prompt_message)
        await expect(prompt_list_button.locator('.tag.default-tag')).toBeVisible()
        await expect(prompt_list_button.locator('.tag.active-tag')).toBeVisible()
        await expect(prompt_list_button.locator('.tag.modified-tag')).toBeVisible()

        await cancel_button.click()
        await expect(prompt_editor).toBeHidden()

        await prompt_editor_button.click()
        await expect(prompt_editor).toBeVisible()
        await expect(prompt_list_button).not.toContainClass('modified')

        await title_input.fill(custom_prompt_title)
        await prompt_input.fill(custom_prompt_message)
        await expect(prompt_list_button).toContainClass('modified')

        await save_button.click()
        await expect(prompt_editor).toBeHidden()
        await expect(prompt_editor_button).toContainText(custom_prompt_title)

        await prompt_editor_button.click()
        await expect(prompt_editor).toBeVisible()
        await expect(prompt_list_button).not.toContainClass('modified')
        await expect(title_input).toHaveValue(custom_prompt_title)
        await expect(prompt_input).toHaveValue(custom_prompt_message)
    })

    test('we should be able to create a new system prompt (🔗 2/3)', async ({ page }) => {
        await page.goto('/')

        const prompt_editor_button    = page.locator('.system-prompt-button'),
            prompt_editor           = page.locator('.prompt-editor'),
            title_input             = prompt_editor.locator('.title-input'),
            prompt_input            = prompt_editor.locator('.prompt-input'),
            create_button           = prompt_editor.locator('.create-button'),
            save_button             = prompt_editor.locator('.buttons .save-button'),
            all_prompt_list_buttons = prompt_editor.locator('.prompt-list .prompt-list-button'),
            selected_button         = prompt_editor.locator('.prompt-list .prompt-list-button.selected')

        await prompt_editor_button.click()
        await expect(prompt_editor).toBeVisible()
        await expect(create_button).toBeVisible()
        await expect(save_button).toBeVisible()

        await create_button.click()
        await expect(all_prompt_list_buttons).toHaveCount(2)
        await expect(title_input).toBeEmpty()
        await expect(prompt_input).toBeEmpty()
        await expect(selected_button).toContainClass('provisional')

        await title_input.fill(custom_prompt_title_2)
        await prompt_input.fill(custom_prompt_message_2)
        await expect(selected_button.locator('.title')).toHaveText(custom_prompt_title_2)
        await expect(selected_button.locator('.message')).toContainText(custom_prompt_message_2)
        await expect(selected_button.locator('.tag.default-tag')).not.toBeVisible()

        await save_button.click()
        await expect(prompt_editor).toBeHidden()
        await expect(prompt_editor_button).toContainText(custom_prompt_title_2)
    })

    test('we should be able to delete a system prompt (🔗 3/3)', async ({ page }) => {
        await page.goto('/')

        const prompt_editor_button    = page.locator('.primary-input-section .system-prompt-button'),
            prompt_editor           = page.locator('.prompt-editor'),
            title_input             = prompt_editor.locator('.title-input'),
            prompt_input            = prompt_editor.locator('.prompt-input'),
            delete_button           = prompt_editor.locator('.buttons .delete-button'),
            cancel_button           = prompt_editor.locator('.buttons .cancel-button'),
            all_prompt_list_buttons = prompt_editor.locator('.prompt-list .prompt-list-button'),
            selected_button         = prompt_editor.locator('.prompt-list .prompt-list-button.selected')

        await expect(prompt_editor_button).toContainText(custom_prompt_title_2)

        await prompt_editor_button.click()
        await expect(prompt_editor).toBeVisible()
        await expect(delete_button).toBeVisible()
        await expect(title_input).toHaveValue(custom_prompt_title_2)
        await expect(prompt_input).toHaveValue(custom_prompt_message_2)
        await expect(all_prompt_list_buttons).toHaveCount(2)
        await expect(selected_button).not.toContainClass('provisional')

        page.on('dialog', async dialog => { await dialog.accept() })
        await delete_button.click()
        await expect(all_prompt_list_buttons).toHaveCount(1)
        await expect(title_input).toHaveValue(custom_prompt_title)
        await expect(prompt_input).toHaveValue(custom_prompt_message)
        await expect(selected_button).not.toContainClass('provisional')

        await cancel_button.click()
        await expect(prompt_editor).toBeHidden()
        await expect(prompt_editor_button).toContainText(custom_prompt_title)
    })
})
