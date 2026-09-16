import { Modal, Switch, Toast, Input, InputNumber, Tabs, TabPane } from "@douyinfe/semi-ui-19";
import { useCallback, useContext, type ReactNode } from "react";
import { SettingContext } from "@/context/SettingContext";
import { Setting, SettingKey } from "@/types";
import { SETTING_DEFAULTS } from "@/db";
import useSetting from "@/hooks/use-setting";

interface SettingModalProps {
  isOpenSetting: boolean;
  onCloseSetting: () => void;
}

interface SettingRowProps {
  label?: string;
  description?: string;
  control: ReactNode;
}

function SettingRow({ label, description, control }: SettingRowProps) {
  return (
    <div className="dd:flex dd:items-center dd:justify-between dd:gap-4 dd:border-b dd:border-slate-100 dd:py-3 dd:last:border-b-0">
      <div className="dd:min-w-0 dd:flex-1">
        <div className="dd:text-sm dd:font-medium dd:text-slate-800">{label}</div>
        {description && <div className="dd:mt-1 dd:text-xs dd:text-slate-400">{description}</div>}
      </div>
      <div className="dd:flex dd:max-w-[58%] dd:shrink-0 dd:items-center dd:justify-end">{control}</div>
    </div>
  );
}

function SettingModal({ isOpenSetting, onCloseSetting }: SettingModalProps) {
  const { setting, updateSetting } = useContext(SettingContext);

  const getSetting = (key: SettingKey): Setting => {
    const found = setting.find(item => item.key === key);
    if (found) return found;
    const defaultItem = SETTING_DEFAULTS.find(item => item.key === key);
    if (defaultItem) return defaultItem as Setting;
    return { key, label: key, value: null } as Setting;
  };

  const changeSetting = useCallback((item: Setting, value: any) => {
    if (!item) {
      Toast.error("无法获取到设置项");
      return;
    }
    updateSetting({ ...item, value });
  }, [updateSetting]);


  const showRaw = getSetting("show_raw");
  const skipDownloaded = getSetting("skip_downloaded");
  const downloadConcurrency = getSetting("download_concurrency");
  const customFilenameTemplate = getSetting("custom_filename_template");
  const createFolder = getSetting("create_folder");
  const enable15sVideo = getSetting("enable_15s_video");
  const downloadByDisplayOrder = getSetting("download_by_display_order");

  const customFilenameTemplateLocal = useSetting(customFilenameTemplate, changeSetting);
  const downloadConcurrencyLocal = useSetting(downloadConcurrency, changeSetting);


  const handleClose = () => {
    customFilenameTemplateLocal.flush();
    downloadConcurrencyLocal.flush();
    onCloseSetting();
  };


  return (
    <Modal
      title="设置"
      visible={isOpenSetting}
      onCancel={handleClose}
      footer={null}
      getPopupContainer={() =>
        document.getElementById("dd-modal-popup-container") || document.body
      }
    >
      <div className="dd-setting-modal">
        <Tabs
          className="dd-setting-tabs"
          defaultActiveKey="download"
          tabBarClassName="dd-setting-tabs-nav"
          tabPosition="left"
          type="button"
        >
          <TabPane itemKey="download" tab="下载行为">
            <div className="dd-setting-content">
              <SettingRow
                control={<Switch checked={showRaw.value} onChange={(checked) => changeSetting(showRaw, checked)} />}
                description="优先展示可直接保存的原始图片"
                label={showRaw.label}
              />
              <SettingRow
                control={<Switch checked={skipDownloaded.value} onChange={(checked) => changeSetting(skipDownloaded, checked)} />}
                description="避免重复处理已经保存过的图片"
                label={skipDownloaded.label}
              />
              <SettingRow
                control={<Switch checked={downloadByDisplayOrder.value} onChange={(checked) => changeSetting(downloadByDisplayOrder, checked)} />}
                description="按当前列表从上到下的顺序写入文件"
                label={downloadByDisplayOrder.label}
              />
              <SettingRow
                control={
                  <InputNumber
                    className="dd-setting-number-input"
                    hideButtons
                    max={32}
                    min={1}
                    value={downloadConcurrencyLocal.value as number}
                    onChange={downloadConcurrencyLocal.onChange}
                  />
                }
                description="同时下载的图片数量，范围为 1 到 32"
                label={downloadConcurrency.label}
              />
            </div>
          </TabPane>

          <TabPane itemKey="files" tab="文件与目录">
            <div className="dd-setting-content">
              <SettingRow
                control={
                  <Input
                    className="dd-setting-template-input"
                    placeholder="请输入自定义文件名模板，为空则使用默认模板"
                    value={customFilenameTemplateLocal.value}
                    onChange={customFilenameTemplateLocal.onChange}
                  />
                }
                description="支持会话、消息和图片索引等变量"
                label={customFilenameTemplate.label}
              />
              <SettingRow
                control={<Switch checked={createFolder.value} onChange={(checked) => changeSetting(createFolder, checked)} />}
                description="以会话为单位整理下载文件"
                label={createFolder.label}
              />
            </div>
          </TabPane>

          <TabPane itemKey="video" tab="视频">
            <div className="dd-setting-content">
              <SettingRow
                control={<Switch checked={enable15sVideo.value} onChange={(checked) => changeSetting(enable15sVideo, checked)} />}
                description="在列表中识别并提供 15 秒视频下载"
                label={enable15sVideo.label}
              />
            </div>
          </TabPane>

          <TabPane itemKey="about" tab="关于">
            <div className="dd-setting-content dd-setting-about">
              <div className="dd:text-sm dd:font-medium dd:text-slate-800">豆包下载器</div>
              <div className="dd:mt-1 dd:text-xs dd:text-slate-400">版本 {__APP_VERSION__}</div>
              <p className="dd:mb-0 dd:mt-4 dd:text-sm dd:leading-6 dd:text-slate-500">
                管理图片和短视频的下载方式，让归档保持清晰有序。
              </p>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </Modal>
  );
}

export default SettingModal;
