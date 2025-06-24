import { test, expect } from '@playwright/test'
import { cssSanitised } from '../../src/lib/utils/helpers'
import defaults from '../../src/lib/fixtures/defaults'
import models from '../../src/lib/fixtures/models'

test.describe('Model List', () => {

    test('models should be grouped by family', async ({ page }) => {
        await page.goto('/')

        const model_button = page.locator('.active-model-button'),
              model_list   = page.locator('.models-by-family'),
              family_names = new Set(models.map(m => m.family))

        await model_button.click()
        await expect(model_list).toBeVisible()

        for (const family_name of family_names) {
            const family_element = model_list.locator('.model-family', { has: page.locator('.heading').filter({ hasText: new RegExp(`^${family_name}$`) }) })
            await expect(family_element).toHaveCount(1)

            const model_buttons_count = await family_element.locator('.model-button').count()
            expect(model_buttons_count).toBeGreaterThan(0)
        }
    })

    test('model names and prices should be visible', async ({ page }) => {
        await page.goto('/')

        const model_button = page.locator('.active-model-button'),
              model_list   = page.locator('.models-by-family')

        await model_button.click()
        await expect(model_list).toBeVisible()

        for (const model of models) {
            const model_button = model_list.locator(`#model-button-${cssSanitised(model.id)}`)
            await expect(model_button).toBeVisible()

            const input_price_text = model_button.locator('.input'),
                  output_price_text = model_button.locator('.output')

            if (model.pricing_id === 'free') {
                await expect(input_price_text).toContainText('Free')
                await expect(output_price_text).toContainText('Free')
            } else {
                await expect(input_price_text).toContainText(/^\$\d+\.\d{2}$/)
                await expect(output_price_text).toContainText(/^\$\d+\.\d{2}$/)
            }
        }
    })

    test('active model should be highlighted', async ({ page }) => {
        await page.goto('/')

        const model_list_button    = page.locator('.active-model-button'),
              model_list           = page.locator('.models-by-family'),
              default_model        = models.find(m => m.id === defaults.model),
              default_model_button = model_list.locator(`#model-button-${cssSanitised(default_model.id)}`)

        await model_list_button.click()
        await expect(model_list).toBeVisible()
        await expect(default_model_button).toContainClass('active')
        await expect(model_list.locator('.model-button.active')).toHaveCount(1)
    })

    test('default model should be starred', async ({ page }) => {
        await page.goto('/')

        const model_list_button    = page.locator('.active-model-button'),
              model_list           = page.locator('.models-by-family'),
              default_model        = models.find(m => m.id === defaults.model),
              default_model_button = model_list.locator(`#model-button-${cssSanitised(default_model.id)}`),
              star_icon            = default_model_button.locator('.default-icon')

        await model_list_button.click()
        await expect(model_list).toBeVisible()
        await expect(star_icon).toBeVisible()
    })

    test('clicking on a model should make it active and close the list', async ({ page }) => {
        await page.goto('/')

        const model_list_button   = page.locator('.active-model-button'),
              model_list          = page.locator('.models-by-family'),
              target_model        = models[0],
              target_model_button = model_list.locator(`#model-button-${cssSanitised(target_model.id)}`),
              active_model_icon   = model_list_button.locator('.icon'),
              active_model_name   = model_list_button.locator('.name')

        await model_list_button.click()
        await expect(model_list).toBeVisible()

        await target_model_button.click()
        await expect(model_list).toBeHidden()
        expect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${target_model.icon}`)

        await model_list_button.hover()
        await expect(active_model_name).toContainText(target_model.name)
    })

    test('long clicking on a model should set it to default', async ({ page }) => {
        await page.goto('/')

        const model_list_button    = page.locator('.active-model-button'),
              model_list           = page.locator('.models-by-family'),
              default_model        = models.find(m => m.id === defaults.model),
              target_model         = models[0],
              default_model_button = model_list.locator(`#model-button-${cssSanitised(default_model.id)}`),
              target_model_button  = model_list.locator(`#model-button-${cssSanitised(target_model.id)}`)

        await model_list_button.click()
        await expect(model_list).toBeVisible()

        await target_model_button.click({ delay: 1200 })

        const new_star_icon = target_model_button.locator('.default-icon'),
              old_star_icon = default_model_button.locator('.default-icon')

        await expect(new_star_icon).toBeVisible()
        await expect(old_star_icon).not.toBeVisible()
    })
})
