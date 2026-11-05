export interface DemoCase {
  id: "discover" | "analyze" | "compare";
  title: string;
  subtitle: string;
  question: string;
  background: string;
  evidence: { id: string; title: string; text: string }[];
  references: string[];
}
const background = "【虚构申请者】小明，示例U大学数据科学专业本科生，已拟录取本校数据科学硕士，希望申请硕士指导、加入课题组。已完成：在课程小组中负责用 Excel 整理问卷，用 Python 做缺失值处理与描述统计；没有确认过模型训练或论文复现经历。未来兴趣：理解校园服务中的数据偏差。每天可投入约 1 小时，只有普通笔记本，无付费算力预算。尚未开展新的对口研究项目；不应把建议项目写成已完成经历。所有人物、学校与研究材料均为演示虚构。";
const directory = { id: "E1", title: "导师身份 · 虚构目录", text: "示例U大学数据科学学院演示目录：Z.s，研究数据质量与缺失机制；L.s，研究校园服务中的因果推断；W.w，研究图学习与大规模计算。此目录仅用于固定案例，不是真实学校信息，也不证明任何导师正在招生。" };
const shen = { id: "E2", title: "Z.s · 虚构研究摘要", text: "演示研究《校园问卷中的缺失与偏差》关注：不同群体不回答问卷时，统计结论怎样变化。方法包括缺失模式检查、分组描述和敏感性分析。只提供这段虚构摘要，未提供论文原文、真实发表记录或外部链接。可用匿名合成数据做低成本入门，不能将简单描述统计等同于掌握缺失机制。" };
const lu = { id: "E3", title: "L.s · 虚构研究摘要", text: "演示研究《校园服务调整的效果评估》关注服务变化与学生反馈是否存在因果联系。采用对照思路、混杂因素分析与观察数据研究。入门可先画因果关系草图，学习相关与因果的区别；申请者的因果推断经验未知。摘要没有支持指导风格、录取难度或招生名额的结论。" };
const cheng = { id: "E4", title: "W.w · 方法与资源约束", text: "演示研究关注校园关系网络上的图学习，大规模训练是研究的一种工作方式。申请者对图方法、深度学习的实际经验未知，其普通笔记本与无付费算力预算需要纳入准备安排。可提出小规模合成图的入门，但不能假定完成大规模训练。" };
const unknown = { id: "E5", title: "共同边界 · 招生与指导未知", text: "没有真实导师主页、招生公告、论文全文或指导评价。招生名额、具体招生条件、日常指导方式和联系地址全部未知，不能由研究匹配推出录取概率。所有匹配只基于固定的虚构材料，未来行动与已完成经历必须分开。" };
export const CASES: DemoCase[] = [
  { id: "discover", title: "还没有目标导师", subtitle: "从背景出发，找到值得了解的人", question: "根据我的背景，帮我找一下合适的导师。", background, evidence: [directory, shen, lu, cheng, unknown], references: ["references/research.md"] },
  { id: "analyze", title: "想深入了解一位", subtitle: "连接研究问题、已有基础与下一步", question: "帮我分析Z.s老师，看看适不适合我，再写封进组邮件。", background, evidence: [directory, shen, unknown, { id: "E6", title: "联系材料 · 虚构信息已确认", text: "姓名小明，本科就读示例U大学数据科学专业，已拟录取该校数据科学硕士，计划于 2027 年入学。联系目的为申请Z.s的硕士指导、加入课题组。邮箱和成绩未提供；不编造联系方式、成绩，也不宣称附件已附。可以在邮件中如实写课程小组的整理与描述统计经历；新的对口项目尚未开始。邮件为演示草稿，由用户审阅自行发送。" }], references: ["references/research.md", "references/preparation.md", "references/outreach.md"] },
  { id: "compare", title: "在几位导师间选择", subtitle: "看清差异，解释联系的先后顺序", question: "帮我比较一下Z.s、L.s和W.w，我应该先联系谁？", background, evidence: [directory, shen, lu, cheng, unknown], references: ["references/research.md"] },
];

