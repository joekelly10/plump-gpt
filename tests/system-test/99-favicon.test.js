// import { test, expect } from '@playwright/test'
// import { basic_prompt, basic_reply } from '../mock/prompts/basic_reply'

// import defaults from '../../src/lib/fixtures/defaults'
// import models from '../../src/lib/fixtures/models'

// test.describe('Favicon', () => {
//     test('favicon should change to the model icon after a reply is received', async ({ page }) => {
//         if (!defaults.change_favicon) test.skip()

//         await page.goto('/')

//         const favicon       = page.locator('link[rel="icon"]'),
//               default_model = models.find(m => m.id === defaults.model),
//               input         = page.locator('.primary-input-section .input'),
//               user_message  = page.locator('.chat .messages .message.user'),
//               ai_message    = page.locator('.chat .messages .message.assistant')

//         await expect(favicon).toHaveAttribute('href', `/img/favicon.png`)

//         await input.fill(basic_prompt)
//         await page.keyboard.press('Enter')

//         await expect(input).toHaveText('')
//         await expect(user_message).toHaveCount(1)
//         await expect(user_message.locator('.message-content')).toHaveText(basic_prompt)
//         await expect(ai_message).toHaveCount(1)
//         await expect(ai_message.locator('.message-content')).toHaveText(basic_reply)
//         await expect(favicon).toHaveAttribute('href', `/img/icons/models/${default_model.icon}`)
//     })
// })
