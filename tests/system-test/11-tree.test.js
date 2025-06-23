import { test, expect } from '@playwright/test'
import { sleep } from '../helpers/tools'
import { switchModel } from '../helpers/actions'
import { short_reply_prompt, short_reply, medium_reply_prompt, medium_reply, long_reply_prompt, long_reply } from '../mock/prompts/messages'

import models from '../../src/lib/fixtures/models'
import defaults from '../../src/lib/fixtures/defaults'

test.describe('Tree', () => {
    test('tree button should initially be hidden', async ({ page }) => {
        await page.goto('/')

        const tree_button = page.locator('.header .right .tree-button')
        await expect(tree_button).toBeHidden()
    })

    test('tree button should be visible when the chat has messages', async ({ page }) => {
        await page.goto('/')

        const tree_button = page.locator('.header .right .tree-button'),
              input       = page.locator('.primary-input-section .input')

        await expect(tree_button).toBeHidden()

        await input.fill(short_reply_prompt)
        await page.keyboard.press('Enter')
        await expect(tree_button).toBeVisible()
    })

    test('we should be able to see a birds-eye view of a simple chat', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              chat          = page.locator('.chat'),
              user_message  = chat.locator('.messages .message.user'),
              ai_message    = chat.locator('.messages .message.assistant')

        // send first message
        await input.fill(short_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        await sleep(50)

        // add second message
        await input.fill(medium_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(2)
        await expect(user_message.nth(1).locator('.message-content')).toHaveText(medium_reply_prompt)
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        await sleep(50)

        // add third message
        await input.fill(short_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(3)
        await expect(user_message.nth(2).locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(ai_message).toHaveCount(3)
        await expect(ai_message.nth(2).locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.nth(2).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        await sleep(50)

        const tree_button        = page.locator('.header .right .tree-button'),
              tree_view          = page.locator('.tree'),
              system_prompt_node = tree_view.locator('.system-prompt'),
              nodes              = tree_view.locator('.node'),
              user_nodes         = tree_view.locator('.node.user'),
              assistant_nodes    = tree_view.locator('.node.assistant'),
              you_are_here       = tree_view.locator('.you-are-here')

        // open tree view
        await tree_button.click()
        await expect(tree_view).toBeVisible()

        // check that the tree view is correct
        await expect(system_prompt_node).toBeVisible()
        await expect(nodes).toHaveCount(6)
        await expect(user_nodes).toHaveCount(3)
        await expect(assistant_nodes).toHaveCount(3)
        for (let i = 0; i < 3; i++) {
            await expect(assistant_nodes.nth(i).locator('.model-icon')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)
        }
        await expect(you_are_here).toBeVisible()
        await expect(you_are_here).toHaveText('YOU ARE HERE')
    })

    test('we should be able to see a birds-eye view of a complex chat with many forks', async ({ page }) => {
        await page.goto('/')

        const default_model          = models.find(m => m.id === defaults.model),
              input                  = page.locator('.primary-input-section .input'),
              chat                   = page.locator('.chat'),
              user_message           = chat.locator('.messages .message.user'),
              ai_message             = chat.locator('.messages .message.assistant'),
              create_fork_button     = ai_message.locator('.message-controls-right .fork'),
              add_reply_button       = ai_message.locator('.message-controls-right .add'),
              prompt_forks_container = page.locator('.prompt-forks-container'),
              prompt_fork_buttons    = prompt_forks_container.locator('.prompt-fork-button'),
              reply_forks_container  = page.locator('.reply-forks-container'),
              reply_fork_buttons     = reply_forks_container.locator('.reply-fork-button')

        // send first message
        await input.fill(short_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        await sleep(50)

        // add second message
        await input.fill(medium_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(2)
        await expect(user_message.nth(1).locator('.message-content')).toHaveText(medium_reply_prompt)
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        await sleep(50)

        // add third message
        await input.fill(short_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(3)
        await expect(user_message.nth(2).locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(ai_message).toHaveCount(3)
        await expect(ai_message.nth(2).locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.nth(2).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)
        await expect(create_fork_button).toHaveCount(2)

        await sleep(50)

        // create a fork from the first message
        await create_fork_button.nth(0).click()
        await expect(reply_forks_container).toBeVisible()
        await expect(reply_fork_buttons).toHaveCount(2)
        await expect(reply_fork_buttons.nth(0)).not.toContainClass('active')
        await expect(reply_fork_buttons.nth(1)).toContainClass('active')
        await expect(reply_fork_buttons.nth(1)).toContainClass('provisional')

        // add message to fork #2
        const second_model = models.find(m => m.id !== default_model.id)
        await switchModel(page, second_model)

        await input.fill(medium_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(2)
        await expect(user_message.nth(1).locator('.message-content')).toHaveText(medium_reply_prompt)
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)
        await expect(reply_fork_buttons).toHaveCount(2)
        await expect(reply_fork_buttons.nth(0)).not.toContainClass('active')
        await expect(reply_fork_buttons.nth(1)).toContainClass('active')
        await expect(reply_fork_buttons.nth(1)).not.toContainClass('provisional')

        await sleep(50)

        // add another reply to fork #2
        const third_model = models.find(m => m.id !== default_model.id && m.id !== second_model.id)
        await switchModel(page, third_model)

        await add_reply_button.click()
        await expect(prompt_forks_container).toBeVisible()
        await expect(prompt_fork_buttons).toHaveCount(2)
        await expect(prompt_fork_buttons.nth(0)).not.toContainClass('active')
        await expect(prompt_fork_buttons.nth(1)).toContainClass('active')
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${third_model.icon}`)

        await sleep(50)

        // create another fork from the first message
        await create_fork_button.click()
        await expect(reply_forks_container).toBeVisible()
        await expect(reply_fork_buttons).toHaveCount(3)
        await expect(reply_fork_buttons.nth(0)).not.toContainClass('active')
        await expect(reply_fork_buttons.nth(1)).not.toContainClass('active')
        await expect(reply_fork_buttons.nth(2)).toContainClass('active')
        await expect(reply_fork_buttons.nth(2)).toContainClass('provisional')

        // add message to fork #3
        const fourth_model = models.find(m => ![default_model.id, second_model.id, third_model.id].includes(m.id))
        await switchModel(page, fourth_model)

        await input.fill(medium_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(2)
        await expect(user_message.nth(1).locator('.message-content')).toHaveText(medium_reply_prompt)
        await expect(ai_message).toHaveCount(2)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(medium_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${fourth_model.icon}`)
        await expect(reply_fork_buttons).toHaveCount(3)
        await expect(reply_fork_buttons.nth(0)).not.toContainClass('active')
        await expect(reply_fork_buttons.nth(1)).not.toContainClass('active')
        await expect(reply_fork_buttons.nth(2)).toContainClass('active')
        await expect(reply_fork_buttons.nth(2)).not.toContainClass('provisional')

        await sleep(50)

        // add another message to fork #3
        await input.fill(short_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(3)
        await expect(user_message.nth(2).locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(ai_message).toHaveCount(3)
        await expect(ai_message.nth(2).locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.nth(2).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${fourth_model.icon}`)

        await sleep(50)

        // open tree view
        const tree_button        = page.locator('.header .right .tree-button'),
              tree_view          = page.locator('.tree'),
              system_prompt_node = tree_view.locator('.system-prompt'),
              nodes              = tree_view.locator('.node'),
              user_nodes         = tree_view.locator('.node.user'),
              assistant_nodes    = tree_view.locator('.node.assistant'),
              you_are_here       = tree_view.locator('.you-are-here')

        await tree_button.click()
        await expect(tree_view).toBeVisible()

        // check that the tree view is correct
        await expect(system_prompt_node).toBeVisible()
        await expect(nodes).toHaveCount(13)
        await expect(user_nodes).toHaveCount(6)
        await expect(assistant_nodes).toHaveCount(7)

        for (let i = 0; i < 13; i++) {
            if ([0,1,9,10,11,12].includes(i)) {
                await expect(nodes.nth(i)).toContainClass('active')
            } else {
                await expect(nodes.nth(i)).not.toContainClass('active')
            }
        }

        await expect(assistant_nodes.nth(0).locator('.model-icon')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)
        await expect(assistant_nodes.nth(1).locator('.model-icon')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)
        await expect(assistant_nodes.nth(2).locator('.model-icon')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)
        await expect(assistant_nodes.nth(3).locator('.model-icon')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)
        await expect(assistant_nodes.nth(4).locator('.model-icon')).toHaveAttribute('src', `/img/icons/models/${third_model.icon}`)
        await expect(assistant_nodes.nth(5).locator('.model-icon')).toHaveAttribute('src', `/img/icons/models/${fourth_model.icon}`)
        await expect(assistant_nodes.nth(6).locator('.model-icon')).toHaveAttribute('src', `/img/icons/models/${fourth_model.icon}`)

        // node positioning (relative to each other)
        const node_boxes = []
        
        for (let i = 0; i < 13; i++) {
            node_boxes[i] = await tree_view.locator(`[data-node-id="${i + 1}"]`).boundingBox()
        }

        // nodes 1 + 2 (first message pair) should be together in the center
        expect(Math.abs(node_boxes[0].x - node_boxes[1].x)).toBeLessThan(1)
        expect(node_boxes[1].y).toBeGreaterThan(node_boxes[0].y)

        // nodes 3-6 should be in a straight line down, furthest on the left, lower than node 2
        expect(node_boxes[2].x).toBeLessThan(node_boxes[1].x)
        expect(Math.abs(node_boxes[3].x - node_boxes[2].x)).toBeLessThan(1)
        expect(Math.abs(node_boxes[4].x - node_boxes[3].x)).toBeLessThan(1)
        expect(Math.abs(node_boxes[5].x - node_boxes[4].x)).toBeLessThan(1)
        expect(node_boxes[2].y).toBeGreaterThan(node_boxes[1].y)
        expect(node_boxes[3].y).toBeGreaterThan(node_boxes[2].y)
        expect(node_boxes[4].y).toBeGreaterThan(node_boxes[3].y)
        expect(node_boxes[5].y).toBeGreaterThan(node_boxes[4].y)

        // node 7 (user) should be in the center, below node 0, same height as node 3
        expect(Math.abs(node_boxes[6].x - node_boxes[0].x)).toBeLessThan(1)
        expect(Math.abs(node_boxes[6].y - node_boxes[2].y)).toBeLessThan(1)

        // node 8 (assistant) should be below node 7, to the left
        expect(node_boxes[7].y).toBeGreaterThan(node_boxes[6].y)
        expect(node_boxes[7].x).toBeLessThan(node_boxes[6].x)

        // node 9 (assistant) should be below node 7, to the right
        expect(node_boxes[8].y).toBeGreaterThan(node_boxes[6].y)
        expect(node_boxes[8].x).toBeGreaterThan(node_boxes[6].x)

        // nodes 10-13 should be in a straight line down, furthest on the right
        expect(node_boxes[9].x).toBeGreaterThan(node_boxes[8].x)
        expect(Math.abs(node_boxes[10].x - node_boxes[9].x)).toBeLessThan(1)
        expect(Math.abs(node_boxes[11].x - node_boxes[10].x)).toBeLessThan(1)
        expect(Math.abs(node_boxes[12].x - node_boxes[11].x)).toBeLessThan(1)
        expect(Math.abs(node_boxes[9].y - node_boxes[2].y)).toBeLessThan(1)
        expect(node_boxes[10].y).toBeGreaterThan(node_boxes[9].y)
        expect(node_boxes[11].y).toBeGreaterThan(node_boxes[10].y)
        expect(node_boxes[12].y).toBeGreaterThan(node_boxes[11].y)

        // "You are here" should be below node 13
        const you_are_here_box = await you_are_here.boundingBox()
        expect(Math.abs(you_are_here_box.x - node_boxes[12].x)).toBeLessThan(1)
        expect(you_are_here_box.y).toBeGreaterThan(node_boxes[12].y)
    })

    test('the tree should automatically scroll down to the active message when it opens', async ({ page }) => {
        await page.goto('/')

        const input      = page.locator('.primary-input-section .input'),
              ai_message = page.locator('.chat .messages .message.assistant')

        for (let i = 0; i < 6; i++) {
            await input.fill(short_reply_prompt)
            await page.keyboard.press('Enter')
            await expect(ai_message).toHaveCount(i + 1)
            await expect(ai_message.nth(i).locator('.message-content')).toHaveText(short_reply)
            await sleep(50)
        }

        const tree_button = page.locator('.header .right .tree-button'),
              tree_view   = page.locator('.tree'),
              nodes       = tree_view.locator('.node')

        await tree_button.click()
        await expect(tree_view).toBeVisible()
        await expect(nodes).toHaveCount(12)

        // allow the scroll animation to finish
        await sleep(1000)

        const tree_container = tree_view.locator('.inner'),
              scroll_top     = await tree_container.evaluate(el => el.scrollTop),
              scroll_height  = await tree_container.evaluate(el => el.scrollHeight),
              client_height  = await tree_container.evaluate(el => el.clientHeight)
        
        // should be scrolled near the bottom (within 100px threshold)
        expect(scroll_top + client_height).toBeGreaterThan(scroll_height - 100)
    })

    test('hovering a node should show a preview of the message in the sidebar', async ({ page }) => {
        await page.goto('/')

        const input      = page.locator('.primary-input-section .input'),
              ai_message = page.locator('.chat .messages .message.assistant')

        for (let i = 0; i < 3; i++) {
            await input.fill(short_reply_prompt)
            await page.keyboard.press('Enter')
            await expect(ai_message).toHaveCount(i + 1)
            await expect(ai_message.nth(i).locator('.message-content')).toHaveText(short_reply)
            await sleep(50)
        }

        const tree_button = page.locator('.header .right .tree-button'),
              tree_view   = page.locator('.tree'),
              sidebar     = tree_view.locator('.tree-sidebar'),
              nodes       = tree_view.locator('.node')

        await tree_button.click()
        await expect(tree_view).toBeVisible()
        await expect(nodes).toHaveCount(6)

        await nodes.nth(5).hover()
        await expect(sidebar).toBeVisible()
        await expect(sidebar.locator('.message-preview')).toHaveText(short_reply)
    })

    test('clicking a node should take us to the message', async ({ page }) => {
        await page.goto('/')

        const default_model          = models.find(m => m.id === defaults.model),
              input                  = page.locator('.primary-input-section .input'),
              chat                   = page.locator('.chat'),
              ai_message             = chat.locator('.messages .message.assistant'),
              create_fork_button     = ai_message.locator('.message-controls-right .fork'),
              reply_forks_container  = page.locator('.reply-forks-container'),
              reply_fork_buttons     = reply_forks_container.locator('.reply-fork-button')

        // send 3 messages
        for (let i = 0; i < 3; i++) {
            await input.fill(short_reply_prompt)
            await page.keyboard.press('Enter')
            await expect(ai_message).toHaveCount(i + 1)
            await expect(ai_message.nth(i).locator('.message-content')).toHaveText(short_reply)
            await sleep(50)
        }

        // create a fork from the first message
        await create_fork_button.nth(0).click()
        await expect(reply_forks_container).toBeVisible()
        await expect(reply_fork_buttons).toHaveCount(2)
        await expect(reply_fork_buttons.nth(0)).not.toContainClass('active')
        await expect(reply_fork_buttons.nth(1)).toContainClass('active')
        await expect(reply_fork_buttons.nth(1)).toContainClass('provisional')

        await sleep(50)

        // add 3 messages to fork #2
        const second_model = models.find(m => m.id !== default_model.id)
        await switchModel(page, second_model)

        for (let i = 0; i < 3; i++) {
            await input.fill(medium_reply_prompt)
            await page.keyboard.press('Enter')
            await expect(ai_message).toHaveCount(i + 2)
            await expect(ai_message.nth(i + 1).locator('.message-content')).toHaveText(medium_reply)
            await sleep(50)
        }

        // open tree view
        const tree_button        = page.locator('.header .right .tree-button'),
              tree_view          = page.locator('.tree'),
              system_prompt_node = tree_view.locator('.system-prompt'),
              nodes              = tree_view.locator('.node'),
              user_nodes         = tree_view.locator('.node.user'),
              assistant_nodes    = tree_view.locator('.node.assistant'),
              you_are_here       = tree_view.locator('.you-are-here')

        await tree_button.click()
        await expect(tree_view).toBeVisible()

        // check that the tree view is correct
        await expect(system_prompt_node).toBeVisible()
        await expect(nodes).toHaveCount(12)
        await expect(user_nodes).toHaveCount(6)
        await expect(assistant_nodes).toHaveCount(6)

        for (let i = 0; i < 12; i++) {
            if ([0,1,6,7,8,9,10,11].includes(i)) {
                await expect(nodes.nth(i)).toContainClass('active')
            } else {
                await expect(nodes.nth(i)).not.toContainClass('active')
            }
        }

        await expect(assistant_nodes.nth(0).locator('.model-icon')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)
        await expect(assistant_nodes.nth(1).locator('.model-icon')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)
        await expect(assistant_nodes.nth(2).locator('.model-icon')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)
        await expect(assistant_nodes.nth(3).locator('.model-icon')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)
        await expect(assistant_nodes.nth(4).locator('.model-icon')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)
        await expect(assistant_nodes.nth(5).locator('.model-icon')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)

        // "You are here" should be below node 12
        const you_are_here_box     = await you_are_here.boundingBox(),
              last_active_node_box = await nodes.nth(11).boundingBox()

        await expect(you_are_here).toBeVisible()
        await expect(you_are_here).toHaveText('YOU ARE HERE')
        expect(Math.abs(you_are_here_box.x - last_active_node_box.x)).toBeLessThan(1)
        expect(you_are_here_box.y).toBeGreaterThan(last_active_node_box.y)

        await nodes.nth(3).click()
        await expect(tree_view).toBeHidden()
        await expect(ai_message).toHaveCount(3)
        await expect(ai_message.nth(1).locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.nth(1).locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)
        await expect(ai_message.nth(1)).toContainClass('temp-highlight')
        await expect(ai_message.nth(1)).toBeInViewport()

        await tree_button.click()
        await expect(tree_view).toBeVisible()

        for (let i = 0; i < 12; i++) {
            if ([0,1,2,3,4,5].includes(i)) {
                await expect(nodes.nth(i)).toContainClass('active')
            } else {
                await expect(nodes.nth(i)).not.toContainClass('active')
            }
        }
    })
})
