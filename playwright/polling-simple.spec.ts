import { test, expect } from './fixtures/base';
import './forkVnet';

test.describe('Sky Polling Page Simple', () => {
  test('loads polling page and shows content', async ({ page }) => {
    // Mock the Sky polls API endpoint
    await page.route('**/api/sky/polls*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          polls: [
            {
              pollId: 1,
              title: 'Test Sky Poll 1',
              content: 'This is a test poll',
              slug: 'test-sky-poll-1',
              startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              options: { '0': 'Yes', '1': 'No', '2': 'Abstain' },
              type: 'plurality',
              tags: ['governance'],
              discussionLink: 'https://forum.example.com/test-poll-1',
              parameters: {
                inputFormat: 'single-choice',
                winningStrategy: 'plurality',
                resultDisplay: 'single-vote-breakdown'
              },
              active: true
            }
          ],
          tags: [
            { tag: 'governance', count: 1 }
          ],
          stats: {
            active: 1,
            finished: 0,
            total: 1
          },
          paginationInfo: {
            totalCount: 1,
            page: 1,
            numPages: 1,
            hasNextPage: false
          }
        })
      });
    });

    await page.goto('/polling');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the notice is visible
    const noticeText = page.locator('text=/The community has voted for governance to be migrated/');
    await expect(noticeText).toBeVisible();
    
    // Check if the heading is visible
    const heading = page.getByRole('heading', { name: 'Polls from Sky Governance' });
    await expect(heading).toBeVisible();
    
    // Check if poll cards are rendered
    const pollCards = page.locator('[data-testid="sky-poll-overview-card"]');
    await expect(pollCards).toHaveCount(1);
  });
});