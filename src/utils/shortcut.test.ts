import { describe, expect, it } from "vitest";
import { matchesShortcut } from "./shortcut";

describe("matchesShortcut", () => {
  it("matches a case-insensitive Alt+D shortcut", () => {
    expect(
      matchesShortcut(
        { key: "d", altKey: true, ctrlKey: false, shiftKey: false, metaKey: false, repeat: false },
        "Alt + D",
      ),
    ).toBe(true);
  });

  it("requires the configured modifier combination exactly", () => {
    expect(
      matchesShortcut(
        { key: "d", altKey: true, ctrlKey: true, shiftKey: false, metaKey: false, repeat: false },
        "Alt + D",
      ),
    ).toBe(false);
    expect(
      matchesShortcut(
        { key: "d", altKey: false, ctrlKey: true, shiftKey: true, metaKey: false, repeat: false },
        "Ctrl + Shift + D",
      ),
    ).toBe(true);
  });

  it("rejects empty shortcuts and repeated keydown events", () => {
    expect(
      matchesShortcut(
        { key: "d", altKey: true, ctrlKey: false, shiftKey: false, metaKey: false, repeat: false },
        "",
      ),
    ).toBe(false);
    expect(
      matchesShortcut(
        { key: "d", altKey: true, ctrlKey: false, shiftKey: false, metaKey: false, repeat: true },
        "Alt + D",
      ),
    ).toBe(false);
  });
});
