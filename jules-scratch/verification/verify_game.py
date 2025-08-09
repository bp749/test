import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Get the absolute path of the index.html file
        import os
        absolute_path = os.path.abspath('index.html')

        await page.goto(f'file://{absolute_path}')

        # 1. Initial state
        await page.screenshot(path='jules-scratch/verification/01_initial_state.png')

        # 2. Roll dice
        await page.click('#roll-dice')
        await page.wait_for_timeout(500) # wait for dice to be displayed
        await page.screenshot(path='jules-scratch/verification/02_dice_rolled.png')

        # 3. Make a move
        # For simplicity, we'll just click on a point and then another.
        # A more robust test would check for valid moves.
        await page.click('[data-point="19"]')
        await page.wait_for_timeout(500)
        await page.screenshot(path='jules-scratch/verification/03_checker_selected.png')

        # This part is tricky because the valid moves depend on the dice roll.
        # I will just click on a point that is likely to be a valid move.
        # This is just for visual verification, so it doesn't have to be perfect.

        # Let's assume a roll that allows moving from 19 to 24
        dice1_text = await page.inner_text('#die1')
        dice2_text = await page.inner_text('#die2')
        dice1 = int(dice1_text) if dice1_text else 0
        dice2 = int(dice2_text) if dice2_text else 0

        # A simple move - this will fail if the dice roll doesn't allow it.
        # This is for demonstration purposes.
        if dice1 > 0 and 19 + dice1 <= 24:
            await page.click(f'[data-point="{19 + dice1}"]')
        elif dice2 > 0 and 19 + dice2 <= 24:
            await page.click(f'[data-point="{19 + dice2}"]')

        await page.wait_for_timeout(1000) # wait for animation
        await page.screenshot(path='jules-scratch/verification/04_move_made.png')

        # 4. Test doubling
        await page.click('#double-btn')
        page.on('dialog', lambda dialog: dialog.accept())
        await page.wait_for_timeout(500)
        await page.screenshot(path='jules-scratch/verification/05_doubled.png')

        await browser.close()

asyncio.run(main())
