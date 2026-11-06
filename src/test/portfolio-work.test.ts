import { describe, expect, it } from "vitest";
import { portfolioWork } from "@/lib/portfolio-work";

describe("Keeley's landing page portfolio", () => {
  it("includes exactly the five supplied websites with HTTPS links", () => {
    expect(portfolioWork.map((project) => project.url).sort()).toEqual([
      "https://butterbase.ai",
      "https://butterkey.ai",
      "https://krystolab.com",
      "https://saroutt.com",
      "https://withnira.com",
    ]);
  });
});
