import { test, expect } from '@playwright/test'
import defaults from '../../src/lib/fixtures/defaults'
import models from '../../src/lib/fixtures/models'

test.describe('Init', () => {

    test('page should have title "Plump GPT"', async ({ page }) => {
        await page.goto('/')
        await expect(page).toHaveTitle('Plump GPT')
    })

    test('system prompt should be set to the personalised seed prompt', async ({ page }) => {
        await page.goto('/')

        const system_prompt_button = page.locator('.system-prompt-button'),
              prompt_editor        = page.locator('.prompt-editor'),
              prompt_input         = prompt_editor.locator('.prompt-input')

        await expect(system_prompt_button).toContainText('Assistant')

        await system_prompt_button.click()
        await expect(prompt_editor).toBeVisible()
        await expect(prompt_input).toHaveValue(/You are a good friend and mentor to the user, who is called Conrad Poohs/)
    })

    test('chat history should be empty', async ({ page }) => {
        await page.goto('/')

        const menu_button      = page.locator('.main-menu-button'),
              load_button      = page.locator('.main-menu .load-button'),
              loader           = page.locator('.loader'),
              no_chats_message = loader.locator('.chats .no-chats')

        await menu_button.click()
        await expect(load_button).toBeVisible()

        await load_button.click()
        await expect(loader).toBeVisible()
        await expect(no_chats_message).toBeVisible()
    })

    test('model and temperature should be set to the default values', async ({ page }) => {
        await page.goto('/')

        const model_button       = page.locator('.active-model-button'),
              temperature_button = page.locator('.temperature-button'),
              default_model      = models.find(m => m.id === defaults.model),
              icon               = model_button.locator('.icon')

        await expect(icon).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)
        await expect(temperature_button).toContainText(String(defaults.temperature))
    })

    test('we should be automatically focused on the primary input field', async ({ page }) => {
        await page.goto('/')

        const input_element = page.locator('.input')
        await expect(input_element).toBeVisible()
        await expect(input_element).toBeEnabled()
        await expect(input_element).toBeEditable()
        await expect(input_element).toBeFocused()
    })
})
