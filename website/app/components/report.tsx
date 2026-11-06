import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Report({ text }: { text: string }) {
  return <div className="report-copy"><Markdown remarkPlugins={[remarkGfm]} skipHtml disallowedElements={["img"]} components={{
    table: ({ children }) => <div className="report-table-scroll" role="region" aria-label="比较表格，可横向滚动" tabIndex={0}><table>{children}</table></div>,
    a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
  }}>{text}</Markdown></div>;
}
