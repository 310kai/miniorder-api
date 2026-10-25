
import { describe, expect, it } from "vitest";
import { parseId } from "../src/utils/parse-id.js";

describe("parseId", () => {
  it("正常なIDを数値に変換できる", () => {
    expect(parseId("1")).toBe(1);
    expect(parseId("100")).toBe(100);
  });

  it("文字列のIDを拒否する", () => {
    expect(parseId("abc")).toBeNull();
  });

  it("0と負のIDを拒否する", () => {
    expect(parseId("0")).toBeNull();
    expect(parseId("-1")).toBeNull();
  });

  it("小数のIDを拒否する", () => {
    expect(parseId("1.5")).toBeNull();
  });

  it("DBの上限を超えるIDを拒否する", () => {
    expect(parseId("2147483648")).toBeNull();
  });
});
