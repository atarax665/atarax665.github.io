import { describe, it, expect } from "vitest";
import { resolveTheme } from "../lib/theme";

describe("resolveTheme", () => {
  it("honours an explicit stored light preference over system dark", () => {
    expect(resolveTheme("light", true)).toBe("light");
  });

  it("honours an explicit stored dark preference over system light", () => {
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("falls back to system dark when nothing is stored", () => {
    expect(resolveTheme(null, true)).toBe("dark");
  });

  it("falls back to system light when nothing is stored", () => {
    expect(resolveTheme(null, false)).toBe("light");
  });

  it("ignores a corrupt stored value and uses the system preference", () => {
    expect(resolveTheme("banana", true)).toBe("dark");
    expect(resolveTheme("", false)).toBe("light");
  });
});
