import { CategorySpendingForm } from "@/features/cards/components/category-spending-form";
import { SpendingSummary } from "@/features/calculator/components/spending-summary";
import { SubscriptionChecklist } from "@/features/subscriptions/components/subscription-checklist";
import { LinkButton } from "@/components/ui/button";

export default function SpendingPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">
        소비 패턴 입력
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        카테고리별 예상 지출 금액과 구독 서비스를 입력해주세요. 입력한 내용은
        등록한 카드들의 혜택을 계산하는 데 사용돼요.
      </p>

      <div className="mt-8 flex flex-col gap-10">
        <CategorySpendingForm />
        <SubscriptionChecklist />
        <SpendingSummary />
      </div>

      <div className="mt-10">
        <LinkButton href="/result" className="px-7 py-3.5 text-base">
          결과 보기
        </LinkButton>
      </div>
    </div>
  );
}
