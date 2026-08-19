/**
 * 같은 호스트에 대한 요청 사이 최소 간격을 강제하는 단순한 지연 함수.
 * 반환된 wait()를 매 요청 직전에 호출한다.
 */
export function createRateLimiter(minIntervalMs: number) {
  let lastRequestAt = 0;

  return async function wait(): Promise<void> {
    const elapsed = Date.now() - lastRequestAt;
    const remaining = minIntervalMs - elapsed;
    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining));
    }
    lastRequestAt = Date.now();
  };
}
