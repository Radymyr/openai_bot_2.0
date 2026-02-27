import { describe, expect, it } from "vitest";
import { resolveStartWelcomeText } from "../src/services/start-content.js";

describe("start-content service", () => {
  it("returns payload welcome text", () => {
    const result = resolveStartWelcomeText("/start alena");
    expect(result).toContain("Алена");
  });

  it("returns default welcome text without payload", () => {
    const result = resolveStartWelcomeText("/start");
    expect(result).toBe("Привет, давно не общались, как ты?");
  });
});
