import * as cheerio from "cheerio";
import { parseKoreanWon } from "./korean-number";

export interface RawTable {
  caption: string | null;
  headers: string[];
  rows: string[][];
}

export interface AnnualFeeExtraction {
  sourceText: string;
  won: number | null;
}

export interface CardExtractionDraft {
  issuerId: string;
  sourceUrl: string;
  pageTitle: string | null;
  annualFee: AnnualFeeExtraction | null;
  tables: RawTable[];
  warnings: string[];
}

function extractTables($: cheerio.CheerioAPI): RawTable[] {
  const tables: RawTable[] = [];

  $("table").each((_, tableEl) => {
    const $table = $(tableEl);
    const caption = $table.find("caption").first().text().trim() || null;
    const headers = $table
      .find("thead th")
      .map((_, el) => $(el).text().trim())
      .get()
      .filter((text) => text.length > 0);

    // 주의: cheerio의 .map()은 jQuery와 마찬가지로 콜백이 배열을 반환하면
    // 자동으로 평탄화(flatten)한다. 행(row)마다 셀 배열을 유지해야 하므로
    // 바깥쪽 순회는 반드시 .toArray()로 일반 배열을 얻은 뒤 처리한다.
    const rows = $table
      .find("tbody tr")
      .toArray()
      .map((tr) =>
        $(tr)
          .find("td,th")
          .map((_, cell) => $(cell).text().trim())
          .get()
      )
      .filter((row) => row.length > 0);

    tables.push({ caption, headers, rows });
  });

  return tables;
}

/**
 * caption에 "연회비"가 포함된 표에서 연회비 합계를 찾는다. 표 구조는
 * 카드사/카드마다 다를 수 있으므로, "합계" 헤더가 있으면 그 열의 첫 값을,
 * 없으면 마지막 셀을 사용한다. 그래도 숫자로 해석되지 않으면
 * annualFee.won은 null로 두고(추측하지 않음) sourceText만 남긴다.
 */
function extractAnnualFee(tables: RawTable[]): AnnualFeeExtraction | null {
  const feeTable = tables.find((table) => table.caption?.includes("연회비"));
  if (!feeTable || feeTable.rows.length === 0) {
    return null;
  }

  const totalColumnIndex = feeTable.headers.findIndex((h) => h.includes("합계"));
  const firstRow = feeTable.rows[0];
  const sourceText =
    totalColumnIndex >= 0 && firstRow[totalColumnIndex]
      ? firstRow[totalColumnIndex]
      : firstRow[firstRow.length - 1];

  return {
    sourceText,
    won: parseKoreanWon(sourceText),
  };
}

export function extractCardDraft(
  issuerId: string,
  sourceUrl: string,
  html: string
): CardExtractionDraft {
  const $ = cheerio.load(html);
  const pageTitle = $("title").first().text().trim() || null;
  const tables = extractTables($);
  const annualFee = extractAnnualFee(tables);

  const warnings: string[] = [];
  if (tables.length === 0) {
    warnings.push(
      "페이지에서 <table>을 찾지 못했습니다. 자바스크립트 렌더링에 의존하는 페이지일 수 있습니다."
    );
  }
  if (!annualFee) {
    warnings.push(
      "연회비 표(caption에 '연회비' 포함)를 찾지 못했습니다. 체크카드처럼 연회비가 없거나, 자바스크립트로 렌더링되는 값일 수 있습니다."
    );
  } else if (annualFee.won === null) {
    warnings.push(
      `연회비 표는 찾았지만 숫자로 해석하지 못했습니다: "${annualFee.sourceText}"`
    );
  }

  return { issuerId, sourceUrl, pageTitle, annualFee, tables, warnings };
}
