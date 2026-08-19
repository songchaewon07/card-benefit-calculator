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
    // 재확인 결과: robots.txt에 "User-agent: *" 규칙 자체가 없고, 특정
    // 검색엔진/AI봇들만 하나의 그룹으로 묶여 Allow 되어 있다. robots.txt
    // 명세상 어떤 그룹에도 매칭되지 않는 User-Agent는 규칙이 적용되지
    // 않아(=제한 없음) 사실상 허용으로 판정된다 (robots-parser로 실제
    // 후보 URL에 대해 검증 완료). 다만 서버가 구식 TLS 재협상을 요구해
    // Node 기본 fetch가 실패하므로 http-fetch.ts의 폴백을 통해 접속한다.
    sampleUrl: "https://www.hyundaicard.com/cpc/ma/CPCMA0101_01.hc",
    status: "allowed",
    note: "robots.txt에 User-agent: * 없음(지정 봇 그룹만 존재) → 미지정 봇은 규칙 미적용으로 허용 판정. 서버가 구식 TLS 재협상을 요구해 별도 폴백 필요.",
  },
  {
    issuerId: "hana",
    issuerName: "하나카드",
    robotsTxtUrl: "https://www.hanacard.co.kr/robots.txt",
    // 재확인 결과: Googlebot/Yeti/Yetibot 그룹만 있고 "User-agent: *"가
    // 없다 → 현대카드와 같은 이유로 허용 판정 (robots-parser로 실제
    // 카드 상세페이지 URL에 대해 검증 완료).
    sampleUrl:
      "https://www.hanacard.co.kr/OPI41000000D.web?schID=pcd&mID=PI41016947P&CD_PD_SEQ=16947",
    status: "allowed",
    note: "robots.txt에 User-agent: * 없음(Googlebot/Yeti 그룹만 존재) → 미지정 봇은 규칙 미적용으로 허용 판정.",
  },
  {
    issuerId: "woori",
    issuerName: "우리카드",
    robotsTxtUrl: "https://pc.wooricard.com/robots.txt",
    // 재확인 결과: "User-agent: *" 규칙이 있고 /dcmw/ 전체를 Disallow하지만,
    // 카드 관련 페이지 다수(/dcmw/yh1/crd/... 등)를 명시적으로 다시 Allow
    // 해뒀다. GPTBot/ClaudeBot/Google-Extended만 별도로 완전 차단하는데,
    // 우리 크롤러는 그 이름들에 해당하지 않으므로 "*" 규칙이 적용되어
    // 카드 상세페이지 경로는 허용된다 (robots-parser로 검증 완료).
    sampleUrl: "https://pc.wooricard.com/dcmw/yh1/crd/crd01/M1CRD201S00.do",
    status: "allowed",
    note: "User-agent: * 기준 /dcmw/는 기본 차단이지만 카드 관련 페이지가 명시적으로 재허용됨. GPTBot/ClaudeBot 등 특정 AI 학습봇만 별도로 완전 차단.",
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
