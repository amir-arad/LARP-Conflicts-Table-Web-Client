/* eslint-disable no-undef */
const { toMatchImageSnapshot } = require('jest-image-snapshot');

module.exports = {
  setup() {
    expect.extend({ toMatchImageSnapshot });
  },
  async postRender(page, context) {
    // If this is a visual test story
    if (context.parameters.visualTest) {
      const image = await page.screenshot();
      expect(image).toMatchImageSnapshot({
        customSnapshotsDir: `__image_snapshots__/${context.id}`,
        customDiffDir: `__image_snapshots__/__diff_output__/${context.id}`,
      });
    }

    // If this story has custom assertions
    if (context.parameters.assertions) {
      await context.parameters.assertions(page, context);
    }
  },
};
