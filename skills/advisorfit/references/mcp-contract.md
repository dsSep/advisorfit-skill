# MCP 可用时的调用契约

仅在本轮实际有相应工具、且任务需要调用时读取。本页中的全套交付模板不适用于仅比较、仅写邮件或后续带做；任务范围以SKILL.md和用户本轮请求为准。以下是既有接口约定，不是服务已连接的证明；实际工具公布的参数为准。无工具时完成同样的研究与人工核对，不为了执行本页虚构调用。


研究内容就绪后再组织工具输入。优先一次prepare_advisor_workflow，已有字段不反复整理；下面的格式与边界是工具参考，不应占据最终报告。MCP未连接时可按本Skill完成搜索和写作，明确“仅Skill模式，未运行项目工具检查”，不能谎称已调用工具或已通过检查。

## 调用格式速查

工具使用其公布的参数格式，不自行改名。`preferences` 的最小示例：

```json
{
  "future_directions": ["检索效果评估"],
  "plan_days": 7,
  "daily_hours": 1,
  "hard_constraints": [
    {"field": "institution", "value": "目标大学"},
    {"field": "department", "value": "目标学院"}
  ]
}
```

`hard_constraints` 是上述对象的列表，不是字符串列表或字典。天数用 `plan_days`，每天时间用小时 `daily_hours`，未来方向用复数列表 `future_directions`。`host_analysis` 示例：

```json
{
  "advisor_id": "当前导师编号",
  "dimensions": [
    {
      "key": "research_fit",
      "label": "现有经历的研究交集",
      "level": "PARTIAL",
      "summary": "已有项目能够支持哪项研究切入点，以及仍需补什么",
      "student_fact_ids": ["已确认项目编号"],
      "professor_evidence_ids": ["当前导师研究来源编号"]
    }
  ]
}
```

`dimensions` 是带key/label/level的对象列表，不是以维度名为键的字典。多导师用 `host_analyses` 列表。示例中的编号是格式占位，调用时换成实际存在的编号。未来兴趣不是当前技能，planned/unknown项不引用为已有经历；future_directions用于potential_fit。已确认interest/future_interest意向可在potential_fit或interest_fit引用，即使它指向未来；不得据此支持research_fit/method_fit/background_fit，计划中的项目仍不是已有能力。导师偏好背景没有原文时，background_fit保持UNKNOWN，不能先说PARTIAL再承认没有资料。

学生事实的 `user_confirmed=true` 仅用于用户明确确认、status=FACT的输入。未提供或未知项使用status=UNKNOWN、user_confirmed=false，不能因为“用户确认其他输入准确”就把所有未知项勾成确认。已完成项目用completed，正在做用ongoing，未来意向用planned；未来意向的FACT表示用户确实表达过，不表示已经完成研究。

身份中的 `department` 填已经核实的目标院系名称。下属系或机构信息在来源中保留，避免把“学院（下属系）”混写后误判为不同学院；别名和更名仍需原文核对，不通过去掉文字来掩盖任职冲突。工具拒绝输入时按错误指出的字段或编号修正，不能用空画像规避检查，也不把多次失败称为成功调用。

## 核对当前任职

每位导师的 `current_affiliation` 单独记录目标学校/院系截至本次任务日期的任职核验。`identity_confirmed` 确认是哪一位人，不能替代当前单位核验。默认截至今天；历史任务在 `preferences.as_of`（候选整理时用 `as_of`）及 `current_affiliation.as_of` 显式指定同一截至日期。`checked_on` 与 `retrieved_at` 始终记录实际核验/读取日期，不改成历史截至日期。历史判断须有截至当时的直接材料支持，不能以今天的职位倒推过去任职。

| 原文支持的情况 | status | 用户看到的处理 |
|---|---|---|
| 当前目标单位官方师资、任命或当前目录直接支持 | CONFIRMED | 可继续检查目标范围与匹配 |
| 仅旧名单、论文署名、合作报道，或资料不足 | UNKNOWN | 待核实，保留研究交集 |
| 当前目标任职材料与另一学校现职材料冲突，未解决 | CONFLICTED | 待核实，保留双方来源与日期 |
| 官方明确目标任职已经结束 | NOT_CURRENT | 明确不符合当前目标任职条件 |

仅另一学校现职，结论是“目标任职待核实”，不是“不符合”或“已离职”。出现冲突后，当前目标单位直接材料或明确双聘材料可解决；填写 `conflict_evidence_ids` 保留冲突，以 `resolution_evidence_ids` 引用解决依据。

```json
{
  "current_affiliation": {
    "status": "CONFIRMED",
    "institution": "目标大学",
    "department": "目标学院",
    "checked_on": "2026-10-05",
    "as_of": "2026-10-05",
    "evidence_ids": ["任职直接来源编号"],
    "conflict_evidence_ids": [],
    "resolution_evidence_ids": [],
    "note": "当前官方师资页明确给出姓名、学校和院系"
  }
}
```

示例日期替换为实际任务日期。先阅读原文，按其实际性质标记来源：当前官方师资页 `official_faculty`、当前有效任命 `official_appointment`、当前官方师资目录 `official_current_directory`；任职明确结束的官方材料用 `official_affiliation_end`。这些来源的 `source_tier=1`，`retrieved_at` 为本次实际读取时间，正文与链接完整。已确认任职的证据编号同时放在画像 `institution` / `department` 的 `evidence_ids` 中。历史名单、论文和合作新闻保留其实际类型，不因核验需要改成师资页。`checked_on` 记录宿主核验日期，不是来源发布日期。

MCP仅核对这些提交字段、日期和来源类型，不能独立证明网页含义。未知、未解决冲突、缺核验记录或直接引用时，目标任职约束保持UNKNOWN、进入 `comparison.pending_group`；研究分析可以继续。不要通过修改状态或来源标签换取PASS，补查原文或如实展示缺口。

## 交付前检查引用

Evidence与recent_publications的author_resolution_status使用CONFIRMED（核对原文及导师归属）、UNCERTAIN（未确定）、REJECTED（不匹配）或UNKNOWN（未知）；不要使用RESOLVED。发现网页或标题不等于已核对。状态字段出错时按提示只修正对应标签，不能把未核实来源一律改成CONFIRMED，也不用重新调用画像工具修复一个拼写问题。

在第一次调用整合入口前，检查每个分析中的编号；`evidence`里存在一条来源，不等于它已经属于某位导师的某个分析维度。先核对原文，再将来源编号关联到这位导师的对应画像字段：

| 分析维度 | 导师画像中的来源入口 |
|---|---|
| research_fit、potential_fit、interest_fit | declared_interests、observed_recent_topics的evidence_ids，或已确认归属的recent_publications的source_ids |
| method_fit | methods的evidence_ids |
| background_fit | preferred_background的evidence_ids |
| career_fit | career_context的evidence_ids |

例如论文来源e4只放在总evidence列表时，不能直接用于potential_fit。原文确实支持研究方向且归属已核对后，将e4关联到相应研究主题或论文；无法核实时保留未知。关联编号只解决引用归属，不能代替原文支持性判断。

计划行动的student_fact_ids只引用已确认、已完成或正在开展的实际经历。行动“学习查询改写”可以由未来兴趣提出，但未来兴趣编号不填进这里当作已会查询改写的证据；没有当前能力依据时该列表留空，仍保留导师研究来源、具体成果和完成标准。未来意向在host_analyses的potential_fit/interest_fit中单独表达。

## 默认采用整合入口

Codex先读懂简历、核对用户背景并搜索导师原文，再优先调用 `prepare_advisor_workflow`：把student、advisors列表、evidence、preferences一次传入；需要保留深度解释时传host_analyses列表。只为用户选中的导师填写selected_advisor_ids；指定一位导师时可填该导师编号，自动推荐尚未选择时留空，先展示比较。

希望准备计划时，由Codex结合研究问题先拟定具体行动，按AlignmentPlan格式放入proposed_plans列表，工具检查时间、成果与引用。未提供具体计划时返回framework，须明确它是框架，不把它冒充已细化建议。只写邮件设include_plan=false，不传proposed_plans。用户同时要计划和即时邮件时可提供计划，但未经认可的项目承诺不写进邮件。

多位导师共用用户每天总时间，不能给每位重复分配整个预算。先按优先级分配时间、缩小任务，再拟定计划；整合入口会检查每天合计。分别调用build_alignment_plan时，交付前将所有选中计划一同传给 `validate_preparation_schedule`，发现超时须减少实际工作量或错开任务，不仅把预计分钟数调小。用户明确只想看择一执行的备选方案时，标注不可同时执行并分别检查；不要默认用户愿意增加时间。

制定具体行动前先检查输入材料、资源与工作量。优先复用用户已有项目、文本和检索器；新数据接口、模型安装或大规模标注不是一周练习的默认前提。外部资源需给可访问入口，说明缺摘要、无额度或安装失败时如何缩小任务、用已有材料继续。

检索比较的完整标注、Precision@k区间与分母规则见 [检索评测](retrieval-evaluation.md)，仅涉及该方法时读取。

所有学科的验收记录实际观察，不强求出现固定数量的成功/失败案例、指标提升或显著结果；案例仅从真实观察中选择，没有发现就明确记录未观察到。交付未执行的计划时用“完成后可展示/检验”，不写“这份计划证明你已经完成/掌握”；工具检查通过也不代表用户已执行。工具检查与方法提醒不证明安排科学有效，最终计划须据用户基础与可投入时间复核。

整合调用通常设置compact=true，省略画像空字段，避免重新回传宿主已持有的长来源正文。comparison用于统一比较，preparations中每位导师的plan和outreach用于准备与写作；profiles保留整理后的画像与UNKNOWN状态。来源本来较短时仍在sources；长正文精简确实减少内容时改为source_index，保留编号、链接、时间、归属状态及短摘录。excerpt_truncated=true表示截断，核对仍用本次传入的evidence原文；需要完整返回设compact=false。两种返回的比较、计划和邮件边界相同。

整合返回delivery_contract提供固定栏目、中文标签、照片和资源入口规则；无需再读取同一份约定。单项使用或只需查看规则时可调用get_delivery_contract。outreach.missing_required_information非空时先补问；final_email_ready只表示必需输入齐全，不是质量证明。按outreach写最终邮件后调用validate_outreach，传完整正文、context及subject主题；修正缺项、占位符和申请目的偏移后再交付。扫描只提示常见风险，不证明全文正确；宿主搜索和阅读过的材料不能写成申请者已读，单项否定如“未做RAG”不能扩成“没有科研经历”。整合入口不搜索、不调用第二套模型，不自动发送邮件。

整合入口已完成的步骤不再分别调用build_advisor_profile、compare_advisors、build_alignment_plan或prepare_outreach_context，也不重复传同一份资料。下方共用步骤说明业务顺序；其中单项工具用于局部修正或需要单独结果时。用户已明确确认背景时，可由Codex直接整理StudentProfile，简历规则解析不是必经关卡。

下面是整合入口的选择参数示例（student、advisors、evidence使用本次实际资料）：

```json
{
  "selected_advisor_ids": ["已核对的目标导师编号"],
  "include_plan": false,
  "preferences": {
    "future_directions": ["检索效果评估"],
    "hard_constraints": [
      {"field": "institution", "value": "目标大学"},
      {"field": "department", "value": "目标学院"}
    ]
  }
}
```

不用为每位导师编写全部六个host_analyses维度。只提交需要保留的、有引用依据的深度解释；其余维度按资料组织，缺乏证据时未知，不为了填满结果捏造理由。

## 局部工具与事实映射

整合入口不满足局部需求时，才选下表的单项工具；不重复整合已完成的工作。

| 任务 | 工具与边界 |
|---|---|
| 简历初次整理 | analyze_student_profile；结合用户原文核对。用户纠错优先，学生事实显式保留experience_state：completed/ongoing/planned/unknown |
| 候选整理 | organize_candidates；只整理宿主已找到的候选，不搜索、不抓取。保留学校/院系硬约束与当前任职记录 |
| 导师画像 | build_advisor_profile(profile, evidence)；identity_confirmed只确认哪一位人，current_affiliation另核当前任职。来源编号完整不证明原文支持 |
| 匹配与比较 | compare_advisors或analyze_fit；host_analyses/host_analysis保留有双侧依据的推理。工具不得覆盖身份与约束状态 |
| 局部计划 | build_alignment_plan；先拟具体proposed_plan再检查，导师与天数一致，行动有成果、验收、导师来源与真实学生事实。framework不是个性化计划 |
| 邮件上下文 | prepare_outreach_context；传同一host_analysis。只写信时不传plan，不自动生成项目承诺 |
| 最终邮件 | validate_outreach(text, context, subject)；有告警先核对语境和原文，修正后再检查，不由PASS推断全部事实正确 |

MCP字段与正文状态保持一致：当前学校身份用current_program，申请阶段用application_stage，目标学位用target_degree，意向年份用entry_year，联系目的用contact_goal；name放StudentProfile.name。可选application_route/exam_results/academic_record不因缺失阻塞。future_directions的意向FACT只是用户确实表达过，不等于已完成经历。

导师方法、背景要求、职业合作信息分别放methods、preferred_background、career_context，并为各自原文引用。没有背景要求原文时background_fit为UNKNOWN；不能从研究标签推断招生偏好、指导方式或就业保障。当前招生独立核实，年度公告仅支持对应年份；必须确认在招的硬约束下，未知候选单列待核实。

## 最终展示与工具一致性


交付前逐项核对两类一致性：

对最终导师分析与计划说明调用 `validate_student_statements`，传text和本次student，检查未知经历被断言没有的常见表述；邮件另用validate_outreach。遇到告警先检查主语和语境：计划限定“这次不使用生成模型”不等于用户从未用过；用户未明确确认时，写“尚未提供该经历，需确认”。工具仅扫描常见模式，不证明全文事实、导师判断或计划科学有效；告警修正后再核对。

展示当前经历／未来方向推荐分组时，调用 `validate_recommendations`，传入最新comparison及最终准备展示的current_advisor_ids、future_advisor_ids。根据告警改名单或补充有原文依据的host_analyses，再核对；不要自动把未来兴趣升为已有基础。允许只展示部分候选，同一导师两组均有依据时可同时出现。只分析指定导师或只写邮件、没有分组名单时无需调用。通过仅表示传入名单与比较结果一致，最终文字、来源与招生未知仍须独立核对。

- **用户经历**：每一句“没有、尚无、缺少某项经验”对应用户明确说过的否定事实。简历没写、工具未找到匹配或准备计划建议补学时，写“尚未提供这方面经历，需要确认”，并把建议表述为“可以补充/学习”。例如用户只确认未做RAG复现时，可以说未做RAG复现；对统计检验、用户访谈等未提及项只说待确认。把明确否定与未知分开，保留用户纠错。
- **推荐分组**：先对照comparison.current_group/future_group逐个核对导师编号与理由。宿主发现更合适的分组时，将有原文依据的判断通过host_analyses更新，再使用更新后的结果；资料尚不足时可另列“待深入核实的可能交集”，解释它不是已确认推荐。输出顺序可按用户重点解释，但组内资格、硬约束与当前/未来能力区别保持一致。
- **当前任职与准入**：符合组仅使用已通过约束的候选；`pending_group` 单列“待核实”，说明缺口与下一步，仍可讨论有依据的研究交集。明确不符合须有目标任职结束等直接依据；另一学校现职本身只支持待核实。工具PASS表示提交字段通过检查，最终任职结论仍由Codex核对原文。

