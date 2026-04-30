import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../ds/**/*.stories.@(tsx|mdx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
};

export default config;
