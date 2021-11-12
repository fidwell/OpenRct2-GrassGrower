import * as Environment from "../environment";

export default class MainWindow {
  onUpdate?: () => void;

  onClose?: () => void;

  private window?: Window;

  private createWindow(): Window {
    const window = ui.openWindow({
      classification: Environment.namespace,
      title: `${Environment.pluginName} (v${Environment.pluginVersion})`,
      width: 100,
      height: 200,
      maxHeight: 10000,
      maxWidth: 10000,
      minHeight: 0,
      minWidth: 200,
      widgets: [
      ],
      onUpdate: () => {
        if (this.onUpdate) {
          this.onUpdate();
        }
      },
      onClose: () => {
        if (this.onClose) {
          this.onClose();
        }
      }
    });

    return window;
  }

  show(): void {
    if (this.window) {
      this.window.bringToFront();
    } else {
      this.window = this.createWindow();
    }
  }

  static close(): void {
    ui.closeWindows(Environment.namespace);
  }
}
