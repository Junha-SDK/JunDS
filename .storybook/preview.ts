import type { Preview } from "@storybook/react";
import "../app/globals.css";

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    layout: "centered",
    a11y: {
      // axe-core options — matches `npm run audit:a11y`
      config: { rules: [{ id: "color-contrast", enabled: true }] },
    },
  },
};

export default preview;
