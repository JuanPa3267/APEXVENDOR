import bcrypt from "bcryptjs";
import { describe, expect, spyOn, test } from "bun:test";

describe("Reproduction", () => {
  test("spyOn bcrypt.compare", async () => {
    const spy = spyOn(bcrypt, "compare");
    // @ts-expect-error - testing if this causes the 'never' error
    spy.mockResolvedValue(false);

    const result = await bcrypt.compare("pass", "hash");
    expect(result).toBe(false);
  });
});
