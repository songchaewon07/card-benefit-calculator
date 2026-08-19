"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/cards", label: "카드 선택" },
  { href: "/spending", label: "소비 패턴 입력" },
  { href: "/result", label: "결과" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/80 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          카드혜택 계산기
        </Link>
        <ul className="flex gap-1 text-sm">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={
                    "rounded-full px-3.5 py-2 font-medium transition-colors " +
                    (isActive
                      ? "bg-primary/10 text-primary"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white")
                  }
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
