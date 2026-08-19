import { chromium, type Browser } from "playwright";
import { CRAWLER_USER_AGENT } from "./robots";

let browserPromise: Promise<Browser> | null = null;

function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium.launch({ headless: true });
  }
  return browserPromise;
}

/**
 * 현대카드/우리카드처럼 카드 상세 정보가 자바스크립트로 렌더링되는
 * 페이지를 위한 헤드리스 브라우저 fetch. robots.txt 허용 여부는 이 함수
 * 호출 전에 이미 확인됐다는 전제이며, 여기서는 동일한 User-Agent로 실제
 * 브라우저처럼 페이지를 열어 렌더링이 끝난 뒤의 HTML을 반환한다.
 */
export async function fetchRenderedHtml(
  url: string,
  timeoutMs = 30000
): Promise<string> {
  const browser = await getBrowser();
  const context = await browser.newContext({ userAgent: CRAWLER_USER_AGENT });
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: timeoutMs });
    return await page.content();
  } finally {
    await context.close();
  }
}

/** 크롤러 실행 종료 시 브라우저 프로세스를 정리한다. */
export async function closeBrowser(): Promise<void> {
  if (!browserPromise) return;
  const browser = await browserPromise;
  await browser.close();
  browserPromise = null;
}
