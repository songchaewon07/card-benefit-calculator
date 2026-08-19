import { CardPicker } from "@/features/cards/components/card-picker";

export default function CardsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">카드 선택</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        카드사/카드명을 검색해서 내 카드를 등록해주세요. 등록한 카드는 다음
        단계인 소비 패턴 입력에서 함께 비교됩니다.
      </p>
      <div className="mt-8">
        <CardPicker />
      </div>
    </div>
  );
}
