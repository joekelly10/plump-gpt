import { expect } from '@playwright/test'

export const fastExpect = (locator) => expect(locator, { timeout: 500 })

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const checkInterruption = async () => {
    if (global.isSetupInterrupted) process.exit(130) // exit code for Ctrl+C
}
