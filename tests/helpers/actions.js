import { expect } from '@playwright/test'
import { cssSanitised } from '../../src/lib/utils/helpers'

export const switchModel = async (page, model) => {
    const model_list_button = page.locator('.active-model-button'),
          model_list        = page.locator('.models-by-family'),
          model_button      = model_list.locator(`#model-button-${cssSanitised(model.id)}`),
          active_model_icon = model_list_button.locator('.icon')

    await model_list_button.click()
    await expect(model_list).toBeVisible()
    await expect(model_button).toBeVisible()

    await model_button.click()
    await expect(model_list).toBeHidden()
    await expect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${model.icon}`)
}
