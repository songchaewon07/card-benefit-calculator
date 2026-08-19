import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center gap-6 px-6 py-24">
      <Badge tone="primary">로그인 없이 바로 시작</Badge>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        내 카드, 진짜 혜택은
        <br />
        얼마일까요?
      </h1>
      <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        보유한 카드와 소비 패턴을 입력하면 전월실적 조건과 한도까지 반영해
        카드별 실제 혜택 금액을 계산해드려요.
      </p>
      <LinkButton href="/cards" className="mt-2 px-7 py-3.5 text-base">
        내 카드 등록하기
      </LinkButton>
    </div>
  );
}
