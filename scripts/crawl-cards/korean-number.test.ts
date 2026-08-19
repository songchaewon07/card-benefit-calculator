import { describe, expect, it } from "vitest";
import { parseKoreanWon } from "./korean-number";

describe("parseKoreanWon", () => {
  it("만/천 단위가 섞인 표현을 정확히 변환한다", () => {
    expect(parseKoreanWon("3만원")).toBe(30_000);
    expect(parseKoreanWon("2만 3천원")).toBe(23_000);
    expect(parseKoreanWon("1만 6천원")).toBe(16_000);
    expect(parseKoreanWon("4만 8천원")).toBe(48_000);
    expect(parseKoreanWon("1천원")).toBe(1_000);
    expect(parseKoreanWon("7천원")).toBe(7_000);
  });

  it("포인트 단위도 동일하게 처리한다", () => {
    expect(parseKoreanWon("5천 포인트")).toBe(5_000);
    expect(parseKoreanWon("1만 5천 포인트")).toBe(15_000);
    expect(parseKoreanWon("3만 포인트")).toBe(30_000);
  });

  it("이상/이하/미만 등 부가 표현을 제거하고 숫자만 추출한다", () => {
    expect(parseKoreanWon("20만원 이상")).toBe(200_000);
    expect(parseKoreanWon("80만원 이상")).toBe(800_000);
    expect(parseKoreanWon("100만원 이상~150만원 미만")).toBeNull(); // 범위는 단일 값으로 파싱하지 않음
  });

  it("순수 아라비아 숫자도 처리한다", () => {
    expect(parseKoreanWon("500")).toBe(500);
    expect(parseKoreanWon("30000원")).toBe(30_000);
  });

  it("숫자가 아닌 값은 null을 반환한다", () => {
    expect(parseKoreanWon("적립제한 없이")).toBeNull();
    expect(parseKoreanWon("-")).toBeNull();
    expect(parseKoreanWon("무료")).toBeNull();
    expect(parseKoreanWon("")).toBeNull();
  });
});
