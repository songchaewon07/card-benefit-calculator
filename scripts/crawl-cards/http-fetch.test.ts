import { describe, expect, it } from "vitest";
import { detectCharset } from "./http-fetch";

describe("detectCharset", () => {
  it("Content-Type 헤더에 charset이 있으면 그것을 우선 사용한다", () => {
    const html = Buffer.from("<html></html>");
    expect(detectCharset(html, "text/html; charset=EUC-KR")).toBe("euc-kr");
  });

  it("헤더에 없으면 <meta charset> 태그에서 찾는다", () => {
    const html = Buffer.from(
      '<!doctype html><head><meta charset="euc-kr"/></head></html>'
    );
    expect(detectCharset(html, null)).toBe("euc-kr");
  });

  it("<meta http-equiv=Content-Type content=...charset=...> 형태도 인식한다", () => {
    const html = Buffer.from(
      '<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head>'
    );
    expect(detectCharset(html, null)).toBe("utf-8");
  });

  it("아무 정보도 없으면 utf-8로 기본값을 사용한다", () => {
    const html = Buffer.from("<html><head></head></html>");
    expect(detectCharset(html, null)).toBe("utf-8");
  });

  it("실제 하나카드 페이지 바이트에서 euc-kr을 정확히 감지한다", () => {
    const html = Buffer.from(
      '<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="euc-kr"/>\n<meta name="viewport" content="width=1450"/>'
    );
    expect(detectCharset(html, null)).toBe("euc-kr");
  });
});
