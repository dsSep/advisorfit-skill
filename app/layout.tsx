import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "AdvisorFit · 有依据的下一步",
  description: "用三个虚构案例，体验 AdvisorFit 如何整理导师匹配、研究准备与联系思路。",
  other: { "codex-preview": "development" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
