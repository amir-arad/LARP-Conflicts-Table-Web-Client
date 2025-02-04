import "../src/index.css";

import type { Preview, Renderer } from "@storybook/react";

import React from "react";
import { withThemeByClassName } from "@storybook/addon-themes";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "centered",
  },
  decorators: [
    // Theme decorator
    withThemeByClassName<Renderer>({
      themes: {
        light: "",
        dark: "dark",
      },
      defaultTheme: "light",
      // attributeName: "data-mode",
    }),
    // RTL decorator
    (Story) => (
      <div className="min-h-screen bg-background p-8">
        <Story />
      </div>
    ),
  ],
};

export default preview;
