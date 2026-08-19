import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { extractCardDraft } from "./extract";

function loadFixture(name: string): string {
  return readFileSync(
    path.join(__dirname, "__fixtures__", name),
    "utf-8"
  );
}

describe("extractCardDraft", () => {
  it("KB 카드 페이지에서 연회비 표와 서비스 표를 추출한다", () => {
    const html = loadFixture("kb-sample.html");
    const draft = extractCardDraft("kb", "https://card.kbcard.com/example", html);

    expect(draft.pageTitle).toContain("Easy all 티타늄카드");
    expect(draft.tables).toHaveLength(2);
    expect(draft.tables[0].caption).toContain("서비스 요약");
    expect(draft.tables[1].caption).toBe("연회비");

    expect(draft.annualFee).not.toBeNull();
    expect(draft.annualFee?.sourceText).toBe("3만원");
    expect(draft.annualFee?.won).toBe(30_000);
    expect(draft.warnings).toHaveLength(0);
  });

  it("연회비 표가 없는 체크카드 페이지는 annualFee가 null이고 경고를 남긴다", () => {
    const html = loadFixture("shinhan-sample.html");
    const draft = extractCardDraft(
      "shinhan",
      "https://www.shinhancard.com/example",
      html
    );

    expect(draft.pageTitle).toContain("Deep Dream");
    expect(draft.tables).toHaveLength(1);
    expect(draft.tables[0].rows).toHaveLength(3);
    expect(draft.tables[0].rows[2]).toEqual(["80만원 이상", "3만 포인트"]);

    expect(draft.annualFee).toBeNull();
    expect(
      draft.warnings.some((w) => w.includes("연회비 표"))
    ).toBe(true);
  });

  it("표가 전혀 없으면 경고를 남긴다", () => {
    const draft = extractCardDraft(
      "test",
      "https://example.com",
      "<html><head><title>빈 페이지</title></head><body>내용 없음</body></html>"
    );

    expect(draft.tables).toHaveLength(0);
    expect(draft.warnings.some((w) => w.includes("<table>"))).toBe(true);
  });
});
