import { test, expect } from '@playwright/test'
import models from '../../src/lib/fixtures/models'

test.describe('Model Button', () => {

    test('on hover: model name and prices should be visible', async ({ page }) => {
        await page.goto('/')

        const input_section       = page.locator('.primary-input-section'),
              active_model_button = input_section.locator('.active-model-button'),
              name_element        = active_model_button.locator('.name'),
              prices_element      = active_model_button.locator('.prices')

        await expect(active_model_button).toBeVisible()
        await expect(name_element).not.toBeVisible()
        await expect(prices_element).not.toBeVisible()
    
        await active_model_button.hover()
        await expect(name_element).toBeVisible()
        await expect(prices_element).toBeVisible()
    })

    test('on click: model list should show/hide', async ({ page }) => {
        await page.goto('/')

        const model_list          = page.locator('.models-by-family'),
              active_model_button = page.locator('.active-model-button')

        await expect(model_list).not.toBeVisible()

        await active_model_button.click()
        await expect(model_list).toBeVisible()

        await active_model_button.click()
        await expect(model_list).not.toBeVisible() 
    })
    
    test('on mousewheel: next/prev model should be set', async ({ page }) => {
        await page.goto('/')
    
        const active_model_button = page.locator('.active-model-button'),
              name_element        = active_model_button.locator('.name')

        await active_model_button.hover()

        const initial_name  = await name_element.textContent(),
              initial_index = models.findIndex(model => model.name === initial_name),
              next_index    = initial_index === models.length - 1 ? 0 : initial_index + 1,
              prev_index    = initial_index === 0 ? models.length - 1 : initial_index - 1,
              next_name     = models[next_index].name,
              prev_name     = models[prev_index].name
    
        await active_model_button.hover()
        await page.mouse.wheel(0, 10) // down (next)
        expect(name_element).toContainText(next_name)
    
        await active_model_button.hover()
        await page.mouse.wheel(0, -10) // up (prev)
        expect(name_element).toContainText(initial_name)
    
        await active_model_button.hover()
        await page.mouse.wheel(0, -10) // up (prev)
        expect(name_element).toContainText(prev_name)
    })
})
