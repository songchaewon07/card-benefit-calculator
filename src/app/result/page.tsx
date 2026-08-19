import { ResultView } from "@/features/calculator/components/result-view";

export default function ResultPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">결과</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        등록한 카드들의 혜택을 비교하고, 카드별 총 혜택 금액을 확인해보세요.
      </p>
      <div className="mt-8">
        <ResultView />
      </div>
    </div>
  );
}
