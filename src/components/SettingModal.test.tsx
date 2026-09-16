import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { SettingContext } from "@/context/SettingContext";
import type { Setting } from "@/types";
import SettingModal from "./SettingModal";

vi.mock("@douyinfe/semi-ui-19", () => ({
  Input: ({ onChange, value }: { onChange?: (value: string) => void; value?: string }) => (
    <input onChange={(event) => onChange?.(event.target.value)} value={value} />
  ),
  InputNumber: ({ value }: { value?: number }) => <input value={value} readOnly />,
  Modal: ({ children, onCancel, visible }: { children: React.ReactNode; onCancel?: () => void; visible: boolean }) =>
    visible ? (
      <div>
        <button onClick={onCancel} type="button">关闭设置</button>
        {children}
      </div>
    ) : null,
  Switch: ({ checked }: { checked?: boolean }) => <input checked={checked} readOnly type="checkbox" />,
  Tabs: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TabPane: ({ children, tab }: { children: ReactNode; tab: ReactNode }) => (
    <section>
      <div>{tab}</div>
      {children}
    </section>
  ),
  Toast: { error: vi.fn() },
}));

const settings: Setting[] = [
  { key: "show_raw", value: true, label: "对话列表显示无水印原图" },
  { key: "skip_downloaded", value: true, label: "跳过已下载的图片" },
  { key: "download_concurrency", value: 5, label: "下载图片并发数" },
  { key: "custom_filename_template", value: "template", label: "自定义图片文件名" },
  { key: "create_folder", value: false, label: "为会话创建文件夹" },
  { key: "enable_15s_video", value: true, label: "开启15秒视频" },
  { key: "download_by_display_order", value: false, label: "按展示顺序下载" },
];

describe("SettingModal", () => {
  it("groups settings into four tabs", () => {
    render(
      <SettingContext.Provider value={{ setting: settings, updateSetting: vi.fn() }}>
        <SettingModal isOpenSetting onCloseSetting={vi.fn()} />
      </SettingContext.Provider>,
    );

    expect(screen.getByText("下载行为")).toBeTruthy();
    expect(screen.getByText("文件与目录")).toBeTruthy();
    expect(screen.getByText("视频")).toBeTruthy();
    expect(screen.queryByText("关于")).toBeNull();
  });

  it("flushes text input changes before closing", () => {
    const updateSetting = vi.fn();

    render(
      <SettingContext.Provider value={{ setting: settings, updateSetting }}>
        <SettingModal isOpenSetting onCloseSetting={vi.fn()} />
      </SettingContext.Provider>,
    );

    fireEvent.change(screen.getByDisplayValue("template"), { target: { value: "updated-template" } });
    fireEvent.click(screen.getByRole("button", { name: "关闭设置" }));

    expect(updateSetting).toHaveBeenCalledWith(
      expect.objectContaining({ key: "custom_filename_template", value: "updated-template" }),
    );
  });
});
