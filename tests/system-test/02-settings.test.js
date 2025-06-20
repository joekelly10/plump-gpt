import { test, expect } from '@playwright/test'
import defaults from '../../src/lib/fixtures/defaults'

test.describe('Settings', () => {

    test('top_p controls should work', async ({ page }) => {
        await page.goto('/')

        const _default     = defaults.top_p,
              min          = 0.05,
              stringFormat = (value) => value.toFixed((value * 10 % 1 === 0) ? 1 : 2)

        // default value
        const top_p_button = page.locator('.top_p-button')
        await expect(top_p_button).toContainText(stringFormat(_default))

        if (_default !== 1) {
            // left click: +0.05
            await top_p_button.click()
            await expect(top_p_button).toContainText(stringFormat(_default + 0.05))

            // right click: -0.05
            await top_p_button.click({ button: 'right' })
            await expect(top_p_button).toContainText(stringFormat(_default))

            // up to max
            const number_of_times_to_click = (1 - _default) * 20
            for (let i = 0; i < number_of_times_to_click; i++) {
                await top_p_button.click()
            }
            await expect(top_p_button).toContainText(stringFormat(1))
        } else {
            // right click: -0.05
            await top_p_button.click({ button: 'right' })
            await expect(top_p_button).toContainText(stringFormat(_default - 0.05))

            // left click: +0.05
            await top_p_button.click()
            await expect(top_p_button).toContainText(stringFormat(_default))
        }

        // left click @ max -> loops to min (0.05)
        await top_p_button.click()
        await expect(top_p_button).toContainText(stringFormat(min))
        
        // right click @ min -> loops to max (1)
        await top_p_button.click({ button: 'right' })
        await expect(top_p_button).toContainText(stringFormat(1))

        // check persistence
        await page.reload()
        await expect(top_p_button).toContainText(stringFormat(1))
    })

    test('temperature controls should work', async ({ page }) => {
        await page.goto('/')

        const _default = defaults.temperature,
              max      = 1.2

        // default value
        const temperature_button = page.locator('.temperature-button')
        await expect(temperature_button).toContainText(_default.toFixed(1))

        if (_default !== max) {
            // left click: +0.1
            await temperature_button.click()
            await expect(temperature_button).toContainText((_default + 0.1).toFixed(1))

            // right click: -0.1
            await temperature_button.click({ button: 'right' })
            await expect(temperature_button).toContainText(_default.toFixed(1))

            // up to max
            const number_of_times_to_click = (max - _default) * 10
            for (let i = 0; i < number_of_times_to_click; i++) {
                await temperature_button.click()
            }
            await expect(temperature_button).toContainText(max.toFixed(1))
        } else {
            // right click: -0.1
            await temperature_button.click({ button: 'right' })
            await expect(temperature_button).toContainText((_default - 0.1).toFixed(1))

            // left click: +0.1
            await temperature_button.click()
            await expect(temperature_button).toContainText(_default.toFixed(1))
        }

        // left click @ max -> loops to min (0)
        await temperature_button.click()
        await expect(temperature_button).toContainText('0.0')

        // right click @ min -> loops to max (1.2)
        await temperature_button.click({ button: 'right' })
        await expect(temperature_button).toContainText(max.toFixed(1))

        // check persistence
        await page.reload()
        await expect(temperature_button).toContainText(max.toFixed(1))
    })

    test('we should be able to change our avatar', async ({ page }) => {
        await page.goto('/')

        const user_settings   = page.locator('.user-settings'),
              settings_button = user_settings.locator('.user-settings-button'),
              settings_list   = user_settings.locator('.settings-list'),
              avatar_setter   = user_settings.locator('.avatar-setter'),
              avatar_img      = avatar_setter.locator('.avatar'),
              file_input      = avatar_setter.locator('#avatar-file-input')

        await expect(settings_button).toBeVisible()

        await settings_button.click()
        await expect(settings_list).toBeVisible()
        await expect(avatar_setter).toBeVisible()

        let avatar_img_src = await avatar_img.getAttribute('src')
        expect(avatar_img_src).toContain('default_avatar.png')

        // = SHA256 hash of user_avatar.png
        await file_input.setInputFiles('tests/fixtures/user_avatar.png')
        await expect(avatar_img).toHaveAttribute('src', '/uploads/avatars/2528da765c92ad2dd7c1c719b213eb81ae275a17179dbfd3753f02e15cf403e8.png')

        // check persistence
        await page.reload()
        await settings_button.click()
        await expect(avatar_img).toHaveAttribute('src', '/uploads/avatars/2528da765c92ad2dd7c1c719b213eb81ae275a17179dbfd3753f02e15cf403e8.png')
    })

    // test('smooth output switch should work', async ({ page }) => {
    //     await page.goto('/')

    //     // ...
    // })
})
