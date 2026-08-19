import crypto from "node:crypto";
import https from "node:https";

export interface FetchTextResult {
  ok: boolean;
  status: number;
  text: string;
}

/**
 * 일부 카드사 사이트(예: 하나카드)는 여전히 EUC-KR로 응답한다. HTTP 헤더에
 * charset이 없는 경우가 많아, 본문 앞부분의 <meta charset="..."> 태그를
 * 뒤져서 실제 인코딩을 알아낸다. 태그 자체는 항상 ASCII라서 EUC-KR/UTF-8
 * 어느 쪽으로 읽어도 안전하게 찾을 수 있다.
 */
export function detectCharset(
  buffer: Buffer,
  contentTypeHeader: string | null
): string {
  const headerMatch = contentTypeHeader?.match(/charset=([^;]+)/i);
  if (headerMatch) {
    return headerMatch[1].trim().toLowerCase();
  }

  const head = buffer.subarray(0, 2048).toString("latin1");
  const metaMatch = head.match(/<meta[^>]+charset=["']?([a-zA-Z0-9_-]+)/i);
  if (metaMatch) {
    return metaMatch[1].toLowerCase();
  }

  return "utf-8";
}

function decodeBody(buffer: Buffer, contentTypeHeader: string | null): string {
  const charset = detectCharset(buffer, contentTypeHeader);
  try {
    return new TextDecoder(charset).decode(buffer);
  } catch {
    // 알 수 없는/지원하지 않는 charset이면 UTF-8로 폴백한다.
    return new TextDecoder("utf-8").decode(buffer);
  }
}

function legacyHttpsGet(
  url: string,
  headers: Record<string, string>
): Promise<FetchTextResult> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers,
        // 일부 카드사 서버가 요구하는 구식 TLS 재협상을 이 요청에 한해 허용한다.
        // 인증서 검증(rejectUnauthorized)은 그대로 유지되며, 완화하는 것은
        // 재협상 방식뿐이다.
        secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          const status = res.statusCode ?? 0;
          const buffer = Buffer.concat(chunks);
          resolve({
            ok: status >= 200 && status < 300,
            status,
            text: decodeBody(buffer, res.headers["content-type"] ?? null),
          });
        });
      }
    );
    req.on("error", reject);
  });
}

function isLegacyRenegotiationError(error: unknown): boolean {
  const err = error as
    | { code?: string; cause?: { code?: string } }
    | null
    | undefined;
  return (
    err?.code === "ERR_SSL_UNSAFE_LEGACY_RENEGOTIATION_DISABLED" ||
    err?.cause?.code === "ERR_SSL_UNSAFE_LEGACY_RENEGOTIATION_DISABLED"
  );
}

/**
 * 일부 국내 카드사 서버는 오래된 TLS 재협상(legacy renegotiation) 설정을
 * 사용해, Node의 기본 fetch가 `ERR_SSL_UNSAFE_LEGACY_RENEGOTIATION_DISABLED`
 * 오류로 거부한다. 그 오류일 때만 node:https로 재시도하고, 그 외 오류는
 * 그대로 전파한다. 또한 응답 본문은 charset을 감지해 올바르게 디코딩한다
 * (일부 사이트가 여전히 EUC-KR을 사용).
 */
export async function fetchText(
  url: string,
  headers: Record<string, string>
): Promise<FetchTextResult> {
  try {
    const res = await fetch(url, { headers });
    const buffer = Buffer.from(await res.arrayBuffer());
    return {
      ok: res.ok,
      status: res.status,
      text: decodeBody(buffer, res.headers.get("content-type")),
    };
  } catch (error) {
    if (isLegacyRenegotiationError(error)) {
      return legacyHttpsGet(url, headers);
    }
    throw error;
  }
}
