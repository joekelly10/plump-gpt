import { test, expect } from '@playwright/test'
import { fastExpect } from '../helpers/tools'
import defaults from '../../src/lib/fixtures/defaults'
import models from '../../src/lib/fixtures/models'

test.describe('Init', () => {

    test('page should have title "Plump GPT"', async ({ page }) => {
        await page.goto('/')
        await expect(page).toHaveTitle('Plump GPT')
    })

    test('system prompt should be set to the personalised seed prompt', async ({ page }) => {
        await page.goto('/')

        const system_prompt_button = page.locator('.system-prompt-button')
        await expect(system_prompt_button).toContainText('Assistant')

        await system_prompt_button.click()
        const prompt_editor = page.locator('.prompt-editor')
        await fastExpect(prompt_editor).toBeVisible()

        const prompt_input = prompt_editor.locator('.prompt-input')
        await fastExpect(prompt_input).toHaveValue(/You are a good friend and mentor to the user, who is called Conrad Poohs/)
    })

    test('chat history should be empty', async ({ page }) => {
        await page.goto('/')

        const load_button = page.locator('.load-button')
        await load_button.click()

        const loader = page.locator('.loader')
        await fastExpect(loader).toBeVisible()

        const no_chats_message = loader.locator('.chats .no-chats')
        await fastExpect(no_chats_message).toBeVisible()
    })

    test('model, temperature, and top_p should be set to the default values', async ({ page }) => {
        await page.goto('/')

        const model_button       = page.locator('.active-model-button'),
              temperature_button = page.locator('.temperature-button'),
              top_p_button       = page.locator('.top_p-button'),
              default_model      = models.find(m => m.id === defaults.model),
              icon               = model_button.locator('.icon')

        await fastExpect(icon).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)
        await fastExpect(temperature_button).toContainText(String(defaults.temperature))
        await fastExpect(top_p_button).toContainText(String(defaults.top_p))
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
