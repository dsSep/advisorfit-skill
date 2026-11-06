import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "AdvisorFit · 有依据的下一步",
  description: "先看完整案例对照，再用固定虚构材料体验DeepSeek加载AdvisorFit Skill的研究匹配与进组准备方法。",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
