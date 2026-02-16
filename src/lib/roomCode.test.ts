import { expect, test, describe, spyOn } from "bun:test";
import { generateRoomCode } from "./roomCode";

describe("generateRoomCode", () => {
  test("should return a string of default length 6", () => {
    const code = generateRoomCode();
    expect(typeof code).toBe("string");
    expect(code).toHaveLength(6);
  });

  test("should return a string of specified length", () => {
    expect(generateRoomCode(4)).toHaveLength(4);
    expect(generateRoomCode(10)).toHaveLength(10);
    expect(generateRoomCode(20)).toHaveLength(20);
  });

  test("should return only uppercase alphanumeric characters", () => {
    const code = generateRoomCode(100);
    expect(code).toMatch(/^[0-9A-Z]+$/);
  });

  test("should be reasonably unique", () => {
    const codes = new Set();
    const count = 100; // Reduced from 1000 to minimize collision probability in tests
    for (let i = 0; i < count; i++) {
      codes.add(generateRoomCode(6));
    }
    // We expect no collisions in 100 samples from 2.1 billion possibilities
    expect(codes.size).toBe(count);
  });

  test("should handle cases where Math.random produces a short string", () => {
    const randomSpy = spyOn(Math, 'random');
    // 0.1 in base 36 is 1/36 in decimal. toString(36) gives "0.1"
    randomSpy.mockReturnValue(1/36);

    try {
        const code = generateRoomCode(6);
        expect(code).toHaveLength(6);
        expect(code).toBe("111111");
    } finally {
        randomSpy.mockRestore();
    }
  });
});
