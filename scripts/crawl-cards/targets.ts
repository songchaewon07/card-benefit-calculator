/**
 * 카드사별 크롤링 대상 레지스트리.
 *
 * status는 2026-08-19 기준 robots.txt를 직접 확인해 판단한 결과다. robots.txt는
 * 언제든 바뀔 수 있으므로 실제 실행 시에는 checkRobotsAllowed()로 매번 다시
 * 확인하고, 이 값은 "사전 필터링" 용도로만 사용한다.
 *
 * - "allowed": 범용(익명) User-Agent에 대해 대상 경로가 명시적으로 허용됨
 * - "blocked": robots.txt에서 범용 User-Agent를 차단하거나(Disallow: /),
 *   봇 차단(WAF 등)으로 정상 접속 자체가 안 됨
 * - "uncertain": robots.txt가 지정 봇(검색엔진/AI봇 등)별로 다르게 허용하고
 *   있어, 우리 크롤러의 User-Agent로는 확신할 수 없음 → 실행 전 재확인 필요
 */
export type CrawlTargetStatus = "allowed" | "blocked" | "uncertain";

export interface CrawlTarget {
  issuerId: string;
  issuerName: string;
  robotsTxtUrl: string;
  /** 카드 목록/혜택 소개 페이지 등 실제로 확인할 샘플 URL */
  sampleUrl: string;
  status: CrawlTargetStatus;
  note: string;
}

export const CRAWL_TARGETS: CrawlTarget[] = [
  {
    issuerId: "shinhan",
    issuerName: "신한카드",
    robotsTxtUrl: "https://www.shinhancard.com/robots.txt",
    // 신한카드 Deep Dream 체크 카드 상세페이지 (검증된 실제 URL). 카드 목록
    // 페이지(main.html)는 링크가 JS 템플릿으로 채워져 정적 크롤링으로는
    // 개별 카드 URL을 찾기 어려워, 개별 카드 상세페이지를 샘플로 사용한다.
    sampleUrl:
      "https://www.shinhancard.com/pconts/html/card/apply/check/1187959_2206.html",
    status: "allowed",
    note: "/pconts/html/benefit/, /card/ 등 카드·혜택 경로가 범용 User-Agent에 명시적으로 Allow 되어 있음.",
  },
  {
    issuerId: "kb",
    issuerName: "KB국민카드",
    robotsTxtUrl: "https://card.kbcard.com/robots.txt",
    // KB국민 Easy all 티타늄카드 상세페이지 (검증된 실제 URL, 연회비 표 포함).
    sampleUrl:
      "https://card.kbcard.com/CRD/DVIEW/HCAMCXPRICAC0076?cooperationcode=09256&mainCC=a",
    status: "allowed",
    note: "User-agent: * 기준 /CRD/, /home, /cards 등 주요 경로가 Allow. 관리자성 경로(/MKB/)만 차단.",
  },
  {
    issuerId: "hyundai",
    issuerName: "현대카드",
    robotsTxtUrl: "https://www.hyundaicard.com/robots.txt",
    sampleUrl: "https://www.hyundaicard.com/",
    status: "uncertain",
    note: "지정된 봇(Yeti/Googlebot/Bingbot/Claude-SearchBot/GPTBot 등)에게만 세부 경로를 허용. 범용 User-Agent 기준 규칙이 불명확해 실행 전 재확인 필요.",
  },
  {
    issuerId: "hana",
    issuerName: "하나카드",
    robotsTxtUrl: "https://www.hanacard.co.kr/robots.txt",
    sampleUrl: "https://www.hanacard.co.kr/",
    status: "uncertain",
    note: "Googlebot/Yeti 등 지정 봇에게만 다수의 .web 페이지를 Allow. 범용 User-Agent에 대한 명시적 규칙이 불명확.",
  },
  {
    issuerId: "woori",
    issuerName: "우리카드",
    robotsTxtUrl: "https://pc.wooricard.com/robots.txt",
    sampleUrl: "https://pc.wooricard.com/",
    status: "uncertain",
    note: "AI 검색봇(OAI-SearchBot 등)은 허용하면서 GPTBot/ClaudeBot/Google-Extended는 Disallow: / 로 명시 차단. 범용 User-Agent 규칙 재확인 필요.",
  },
  {
    issuerId: "samsung",
    issuerName: "삼성카드",
    robotsTxtUrl: "https://www.samsungcard.com/robots.txt",
    sampleUrl: "https://www.samsungcard.com/",
    status: "blocked",
    note: "User-agent: * → Disallow: / 로 지정 봇 외 전체 차단.",
  },
  {
    issuerId: "lotte",
    issuerName: "롯데카드",
    robotsTxtUrl: "https://www.lottecard.co.kr/robots.txt",
    sampleUrl: "https://www.lottecard.co.kr/",
    status: "blocked",
    note: "자동화 요청 시 연결이 반복적으로 끊김(봇 차단 추정). 우회 시도는 하지 않음.",
  },
];
