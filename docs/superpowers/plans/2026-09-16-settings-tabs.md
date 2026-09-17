# 设置页 Tabs 重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将设置弹窗改造成按下载、文件目录、视频分类的 tabs 页面，同时保持现有设置读写和防抖提交行为。

**Architecture:** 保留 `SettingModal` 作为状态编排层，新增本地 `SettingRow` 展示组件和分类配置，使用 Semi UI Tabs 承载内容。现有 `getSetting`、`changeSetting`、`useSetting` 和 `handleClose` 继续作为唯一数据更新路径；CSS 只补充弹窗内容的布局、导航和移动端规则。

**Tech Stack:** React 19, TypeScript, `@douyinfe/semi-ui-19`, Tailwind CSS v4（`dd:` 前缀）, Vite。

**Spec:** `docs/superpowers/specs/2026-09-16-settings-tabs-design.md`

## Global Constraints

- 不修改 `SettingKey`、`SETTING_DEFAULTS`、Dexie schema 或 `SettingContext` 契约。
- 三个 tabs 固定为：下载行为、文件与目录、视频；默认打开下载行为。
- Tabs 颜色和选中态使用 Semi Design 默认主题，不添加自定义颜色覆盖。
- 文本模板和并发数输入在关闭弹窗时必须继续 flush。
- 桌面端使用左侧导航视觉，窄屏自动转为顶部横向滚动 tabs。
- 完成后必须运行 `pnpm build`。

---

### Task 1: 抽出设置行展示组件与 tabs 分组骨架

**Files:**
- Modify: `src/components/SettingModal.tsx`

**Interfaces:**
- `SettingRow` 接收 `{ label?: string; description?: string; control: ReactNode }`，只负责标签、说明和控件布局。
- 分类内容通过 `Tabs`/`TabPane` 组合，所有控件仍调用已有 `changeSetting` 或 `useSetting` 返回的 `onChange`。

- [ ] **Step 1: 先确认 Semi UI tabs 导出与当前版本类型**

运行：

```powershell
rg "Tabs|TabPane" node_modules/@douyinfe/semi-ui-19 -g "*.d.ts" -g "*.js" | Select-Object -First 40
```

记录当前包支持的导入方式，避免凭旧版本 API 编写。

- [ ] **Step 2: 在 `SettingModal.tsx` 顶部新增 `SettingRow` 类型和组件**

实现以下结构，保证控件区域可收缩、标签区域固定最小宽度：

```tsx
function SettingRow({ label, description, control }: SettingRowProps) {
  return (
    <div className="dd:flex dd:items-center dd:justify-between dd:gap-4 dd:border-b dd:border-slate-100 dd:py-3 last:dd:border-b-0">
      <div className="dd:min-w-0 dd:flex-1">
        <div className="dd:text-sm dd:font-medium dd:text-slate-800">{label}</div>
        {description && <div className="dd:mt-1 dd:text-xs dd:text-slate-400">{description}</div>}
      </div>
      <div className="dd:flex dd:w-auto dd:max-w-[58%] dd:shrink-0 dd:items-center dd:justify-end">{control}</div>
    </div>
  );
}
```

- [ ] **Step 3: 使用 `Tabs`/`TabPane` 建立三个分类并迁移现有控件**

将设置项按 spec 分组：下载行为放 4 项，文件与目录放 2 项，视频放 1 项。为所有 tab 内容添加 `dd:space-y-0` 容器，默认 key 为下载行为。

- [ ] **Step 4: 保持关闭生命周期与输入控件行为不变**

保留 `handleClose` 中的 `customFilenameTemplateLocal.flush()` 和 `downloadConcurrencyLocal.flush()`；模板输入保留原 placeholder，并将输入宽度限制为 `min(260px, 58vw)`；并发数输入保留 `min={1}`、`max={32}`、`hideButtons`。

- [ ] **Step 5: 运行 TypeScript 检查并修复类型错误**

运行：

```powershell
pnpm exec tsc --noEmit
```

预期：命令成功退出；若 tabs API 的类型与步骤 1 结果不同，只调整导入和 props，不改变分组或数据流。

- [ ] **Step 6: 提交骨架变更**

```powershell
git add src/components/SettingModal.tsx
git commit -m "feat: organize settings modal with tabs"
```

### Task 2: 增加弹窗 tabs 的视觉层级与响应式样式

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- 通过 `.dd-setting-modal`、`.dd-setting-tabs`、`.dd-setting-content` 等稳定 class 与 Semi UI 生成结构连接；不改变任何设置逻辑。

- [ ] **Step 1: 给 `Modal` 内容根节点和 tabs 容器添加稳定 class**

在 `SettingModal.tsx` 的弹窗内容根节点加 `dd-setting-modal`，tabs 外层加 `dd-setting-tabs`，内容面板加 `dd-setting-content`，便于只作用于本弹窗。

- [ ] **Step 2: 在 `src/index.css` 添加桌面端布局规则**

只设置 tabs 导航的尺寸、间距和内容区 padding、最小高度；不覆盖 Semi UI 默认颜色或 active 状态，使用 `.dd-setting-tabs` 范围选择器避免影响项目其它弹窗。

- [ ] **Step 3: 添加窄屏响应式规则**

在 `@media (max-width: 560px)` 下让 tabs 导航横向滚动、tab label 不换行、设置行改为上下结构、控件宽度为 100% 或 `min(100%, 320px)`，确保没有横向溢出。

- [ ] **Step 4: 运行构建验证样式引用和生产打包**

运行：

```powershell
pnpm build
```

预期：TypeScript 和 Vite 均成功完成，无未解析 class 或导入错误。

- [ ] **Step 5: 提交样式变更**

```powershell
git add src/components/SettingModal.tsx src/index.css
git commit -m "style: refine tabbed settings layout"
```

### Task 3: 手动交互回归检查

**Files:**
- Verify: `src/components/SettingModal.tsx`, `src/index.css`

- [ ] **Step 1: 启动本地预览并打开设置弹窗**

运行 `pnpm dev`，打开扩展 popup，进入“设置”。

- [ ] **Step 2: 验证 tabs 与默认状态**

确认首次打开默认显示“下载行为”；三个 tab 均可切换，页面不显示关于 tab，切换不会清空输入。

- [ ] **Step 3: 验证持久化与关闭 flush**

切换一个开关后关闭并重新打开，状态应保持；修改文件名模板和并发数后立即关闭，再次打开应显示最新值。

- [ ] **Step 4: 验证窄屏布局**

将窗口缩窄至约 360px，确认 tabs 可横向滚动、设置行不溢出、输入控件可编辑、关闭按钮可用。

- [ ] **Step 5: 重新运行最终构建**

运行 `pnpm build`，确认最终工作区可交付。
