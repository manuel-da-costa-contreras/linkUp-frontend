import { cn } from "@utils/cn";

describe("cn", () => {
  it("joins only truthy class names", () => {
    expect(cn("a", false, undefined, "b", null, "c")).toBe("a b c");
  });

  it("returns empty string when no valid classes are passed", () => {
    expect(cn(false, undefined, null)).toBe("");
  });
});

