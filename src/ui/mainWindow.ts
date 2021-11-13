import * as Environment from "../environment";
import { GrassLengths } from "./grassLengths";

export default class MainWindow {
  onUpdate?: () => void;

  onClose?: () => void;

  private window?: Window;

  // Window-building constants
  private margin: number = 10;

  private toolbarHeight: number = 10;

  private windowWidth: number = 200;

  private smallButtonHeight: number = 22;

  private createWindow(): Window {
    const btnMowed: ButtonWidget = {
      type: "button",
      name: "btnMowed",
      x: this.margin,
      y: this.margin + this.toolbarHeight,
      height: this.smallButtonHeight,
      width: this.windowWidth - this.margin * 2,
      border: true,
      text: "Mowed",
      onClick: (): void => {
        this.unPressButtons();
        this.pressButton("btnMowed");
        MainWindow.activateTool(GrassLengths.GRASS_LENGTH_MOWED);
      },
      isPressed: false
    };

    const btnClear: ButtonWidget = {
      type: "button",
      name: "btnClear",
      x: this.margin,
      y: btnMowed.y + btnMowed.height,
      height: this.smallButtonHeight,
      width: this.windowWidth - this.margin * 2,
      border: true,
      text: "Clear",
      onClick: (): void => {
        this.unPressButtons();
        this.pressButton("btnClear");
        MainWindow.activateTool(GrassLengths.GRASS_LENGTH_CLEAR_0);
      },
      isPressed: false
    };

    const btnClumpsShort: ButtonWidget = {
      type: "button",
      name: "btnClumpsShort",
      x: this.margin,
      y: btnClear.y + btnClear.height,
      height: this.smallButtonHeight,
      width: this.windowWidth - this.margin * 2,
      border: true,
      text: "Clumps - Short",
      onClick: (): void => {
        this.unPressButtons();
        this.pressButton("btnClumpsShort");
        MainWindow.activateTool(GrassLengths.GRASS_LENGTH_CLUMPS_0);
      },
      isPressed: false
    };

    const btnClumpsLong: ButtonWidget = {
      type: "button",
      name: "btnClumpsLong",
      x: this.margin,
      y: btnClumpsShort.y + btnClumpsShort.height,
      height: this.smallButtonHeight,
      width: this.windowWidth - this.margin * 2,
      border: true,
      text: "Clumps - Long",
      onClick: (): void => {
        this.unPressButtons();
        this.pressButton("btnClumpsLong");
        MainWindow.activateTool(GrassLengths.GRASS_LENGTH_CLUMPS_2);
      },
      isPressed: false
    };

    const btnClumpsRandom: ButtonWidget = {
      type: "button",
      name: "btnClumpsRandom",
      x: this.margin,
      y: btnClumpsLong.y + btnClumpsLong.height,
      height: this.smallButtonHeight,
      width: this.windowWidth - this.margin * 2,
      border: true,
      text: "Clumps - Random",
      onClick: (): void => {
        this.unPressButtons();
        this.pressButton("btnClumpsRandom");
        MainWindow.activateTool(GrassLengths.GRASS_LENGTH_MOWED, true);
      },
      isPressed: false
    };

    const btnCancel: ButtonWidget = {
      type: "button",
      name: "btnCancel",
      x: this.margin,
      y: btnClumpsRandom.y + btnClumpsRandom.height + this.margin,
      height: this.smallButtonHeight,
      width: this.windowWidth - this.margin * 2,
      border: true,
      text: "Cancel",
      onClick: (): void => {
        this.unPressButtons();
        ui.tool?.cancel();
      },
      isPressed: false
    };

    const window = ui.openWindow({
      classification: Environment.namespace,
      title: `${Environment.pluginName} (v${Environment.pluginVersion})`,
      width: this.windowWidth,
      height: btnCancel.y + btnCancel.height + this.margin,
      widgets: [
        btnMowed,
        btnClear,
        btnClumpsShort,
        btnClumpsLong,
        btnClumpsRandom,
        btnCancel
      ],
      onUpdate: () => {
        if (this.onUpdate) {
          this.onUpdate();
        }
      },
      onClose: () => {
        if (this.onClose) {
          ui.tool?.cancel();
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
    ui.tool?.cancel();
    ui.closeWindows(Environment.namespace);
  }

  static activateTool(selectedLength: GrassLengths, random: boolean = false): void {
    ui.activateTool(<ToolDesc>{
      id: "gg-painter",
      cursor: "dig_down",
      filter: [
        "terrain"
      ],
      onMove: (e: ToolEventArgs) => {
        const tileCoords = MainWindow.worldToTileCoords(e.mapCoords);
        const tile = map.getTile(tileCoords.x, tileCoords.y);
        ui.tileSelection.range = {
          leftTop: e.mapCoords,
          rightBottom: e.mapCoords
        };

        if (!e.isDown) return;

        for (let i = 0; i < tile.elements.length; i += 1) {
          if (tile.elements[i].type === "surface") {
            (tile.elements[i] as SurfaceElement).grassLength = random
              ? MainWindow.randomClump()
              : selectedLength;
          }
        }
      }
    });
  }

  private pressButton(name: string): void {
    (this.window.widgets.filter((w) => w.name === name)[0] as ButtonWidget).isPressed = true;
  }

  private unPressButtons(): void {
    (this.window.widgets.filter((w) => w.type === "button")).forEach((b: ButtonWidget) => { b.isPressed = false; });
  }

  static randomClump(): GrassLengths {
    return Math.random() < 0.5
      ? GrassLengths.GRASS_LENGTH_CLUMPS_0
      : GrassLengths.GRASS_LENGTH_CLUMPS_2;
  }

  static worldToTileCoords(coords: CoordsXY): CoordsXY {
    return { x: coords.x / 32, y: coords.y / 32 };
  }
}
