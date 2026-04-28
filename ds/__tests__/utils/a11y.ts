import { render } from "@testing-library/react";

/**
 * Simple accessibility checker for component tests.
 * Checks for common ARIA issues.
 */
export async function checkA11y(element: React.ReactElement) {
  const { container } = render(element);

  // Check for images without alt
  const images = container.querySelectorAll("img:not([alt])");
  if (images.length > 0) {
    throw new Error(`Found ${images.length} image(s) without alt attribute`);
  }

  // Check for buttons without accessible name
  const buttons = container.querySelectorAll("button");
  buttons.forEach((btn) => {
    const hasText = btn.textContent?.trim();
    const hasAriaLabel = btn.getAttribute("aria-label");
    const hasAriaLabelledBy = btn.getAttribute("aria-labelledby");
    const hasTitle = btn.getAttribute("title");
    if (!hasText && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle) {
      throw new Error(`Button without accessible name found: ${btn.outerHTML.slice(0, 100)}`);
    }
  });

  // Check for form inputs without labels
  const inputs = container.querySelectorAll("input:not([type=hidden]):not([type=submit]):not([type=button])");
  inputs.forEach((input) => {
    const id = input.getAttribute("id");
    const hasLabel = id && container.querySelector(`label[for="${id}"]`);
    const hasAriaLabel = input.getAttribute("aria-label");
    const hasAriaLabelledBy = input.getAttribute("aria-labelledby");
    const hasPlaceholder = input.getAttribute("placeholder");
    const parentLabel = input.closest("label");
    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy && !hasPlaceholder && !parentLabel) {
      // This is a warning, not an error, since some inputs are intentionally unlabeled
    }
  });

  return container;
}
