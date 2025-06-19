import { test, expect } from '@playwright/test'
import { fastExpect, slowExpect } from '../helpers/tools'
import { cssSanitised } from '../../src/lib/utils/helpers'
import { scroll_reasoning_prompt, scroll_reasoning_content, scroll_reasoning_reply } from '../mock/prompts/scroll_reasoning'

import defaults from '../../src/lib/fixtures/defaults'
import models from '../../src/lib/fixtures/models'

// test.describe('Messages', () => {
//     test('the message should have words in it', async ({ page }) => {
//         await page.goto('/')


//     })
// })
