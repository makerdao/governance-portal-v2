import { test, expect } from './fixtures/base';
import './forkVnet';

test.describe('Sky Polling Page', () => {
  test.beforeEach(async ({ skyPollingPage, page }) => {
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
              active: true,
              tally: {
                totalSkyParticipation: '1000000',
                totalSkyActiveParticipation: '1000000',
                winningOptionName: 'Yes',
                votesByAddress: [],
                parameters: {},
                results: [
                  {
                    optionId: 0,
                    optionName: 'Yes',
                    skySupport: '600000',
                    winner: true,
                    transfer: '0',
                    transferPct: 0
                  },
                  {
                    optionId: 1,
                    optionName: 'No',
                    skySupport: '300000',
                    winner: false,
                    transfer: '0',
                    transferPct: 0
                  },
                  {
                    optionId: 2,
                    optionName: 'Abstain',
                    skySupport: '100000',
                    winner: false,
                    transfer: '0',
                    transferPct: 0
                  }
                ]
              }
            },
            {
              pollId: 2,
              title: 'Test Sky Poll 2',
              content: 'This is another test poll',
              slug: 'test-sky-poll-2',
              startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
              options: { '0': 'Yes', '1': 'No' },
              type: 'plurality',
              tags: ['technical'],
              discussionLink: 'https://forum.example.com/test-poll-2',
              parameters: {
                inputFormat: 'single-choice',
                winningStrategy: 'plurality',
                resultDisplay: 'single-vote-breakdown'
              },
              active: true
            }
          ],
          tags: [
            { tag: 'governance', count: 1 },
            { tag: 'technical', count: 1 }
          ],
          stats: {
            active: 2,
            finished: 0,
            total: 2
          },
          paginationInfo: {
            totalCount: 2,
            page: 1,
            numPages: 1,
            hasNextPage: false
          }
        })
      });
    });
  });

  test('displays Sky polls notice and navigation', async ({ skyPollingPage }) => {
    await test.step('navigate to polling page', async () => {
      await skyPollingPage.goto();
      await skyPollingPage.waitForPageLoad();
    });

    await test.step('verify notice alert is visible', async () => {
      await skyPollingPage.verifyNoticeAlert();
    });

    await test.step('verify polls are visible', async () => {
      await skyPollingPage.verifyPollsVisible();
      const pollCount = await skyPollingPage.getPollCount();
      test.expect(pollCount).toBe(5);
    });

    await test.step('verify Sky Portal button is visible', async () => {
      // Just check button is visible, don't click external link
      const skyPortalButton = skyPollingPage.page.getByRole('button', { name: 'View on Sky Portal' });
      await expect(skyPortalButton).toBeVisible();
    });
  });

  test('navigates to legacy polls page', async ({ skyPollingPage }) => {
    await test.step('navigate to polling page', async () => {
      await skyPollingPage.goto();
      await skyPollingPage.waitForPageLoad();
    });

    await test.step('click legacy polls button', async () => {
      await skyPollingPage.clickLegacyPollsButton();
    });
  });

  test('handles loading more polls', async ({ skyPollingPage, page }) => {
    // Mock initial response with hasNextPage: true
    await page.route('**/api/sky/polls?pageSize=5&page=1', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          polls: Array(5)
            .fill(null)
            .map((_, i) => ({
              pollId: i + 1,
              title: `Test Poll ${i + 1}`,
              content: 'Test content',
              slug: `test-poll-${i + 1}`,
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              options: { '0': 'Yes', '1': 'No' },
              type: 'plurality',
              tags: [],
              active: true
            })),
          tags: [],
          stats: { active: 10, finished: 0, total: 10 },
          paginationInfo: {
            totalCount: 10,
            page: 1,
            numPages: 2,
            hasNextPage: true
          }
        })
      });
    });

    // Mock second page response
    await page.route('**/api/sky/polls?pageSize=5&page=2', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          polls: Array(5)
            .fill(null)
            .map((_, i) => ({
              pollId: i + 6,
              title: `Test Poll ${i + 6}`,
              content: 'Test content',
              slug: `test-poll-${i + 6}`,
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              options: { '0': 'Yes', '1': 'No' },
              type: 'plurality',
              tags: [],
              active: true
            })),
          tags: [],
          stats: { active: 10, finished: 0, total: 10 },
          paginationInfo: {
            totalCount: 10,
            page: 2,
            numPages: 2,
            hasNextPage: false
          }
        })
      });
    });

    await test.step('navigate to polling page', async () => {
      await skyPollingPage.goto();
      await skyPollingPage.waitForPageLoad();
    });

    await test.step('verify initial polls loaded', async () => {
      await skyPollingPage.verifyPollsVisible();
      const initialCount = await skyPollingPage.getPollCount();
      test.expect(initialCount).toBe(5);
    });

    await test.step('verify load more button is visible', async () => {
      await skyPollingPage.verifyLoadMoreButtonVisible();
    });

    await test.step('load more polls', async () => {
      await skyPollingPage.loadMorePolls();
      const newCount = await skyPollingPage.getPollCount();
      test.expect(newCount).toBe(10);
    });
  });

  test('handles API errors gracefully', async ({ skyPollingPage, page }) => {
    // Mock API error
    await page.route('**/api/sky/polls*', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await test.step('navigate to polling page', async () => {
      await skyPollingPage.goto();
    });

    await test.step('verify error alert is displayed', async () => {
      await skyPollingPage.verifyError();
    });

    await test.step('mock successful retry', async () => {
      await page.route('**/api/sky/polls*', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            polls: [
              {
                pollId: 1,
                title: 'Recovered Poll',
                content: 'Poll after retry',
                slug: 'recovered-poll',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                options: { '0': 'Yes', '1': 'No' },
                type: 'plurality',
                tags: [],
                active: true
              }
            ],
            tags: [],
            stats: { active: 1, finished: 0, total: 1 },
            paginationInfo: {
              totalCount: 1,
              page: 1,
              numPages: 1,
              hasNextPage: false
            }
          })
        });
      });
    });

    await test.step('retry loading', async () => {
      await skyPollingPage.retryLoading();
      await skyPollingPage.verifyPollsVisible();
    });
  });

  test('displays no polls message when empty', async ({ skyPollingPage, page }) => {
    // Mock empty response
    await page.route('**/api/sky/polls*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          polls: [],
          tags: [],
          stats: { active: 0, finished: 0, total: 0 },
          paginationInfo: {
            totalCount: 0,
            page: 1,
            numPages: 0,
            hasNextPage: false
          }
        })
      });
    });

    await test.step('navigate to polling page', async () => {
      await skyPollingPage.goto();
      await skyPollingPage.waitForPageLoad();
    });

    await test.step('verify no polls message', async () => {
      await skyPollingPage.verifyNoPollsMessage();
    });
  });
});
