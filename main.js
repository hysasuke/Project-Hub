const { app, Tray, Menu, nativeImage } = require("electron");
const { open } = require("./Controllers/application-controller");
const { exec } = require("child_process");
const sqlite3 = require("sqlite3");
const fs = require("fs");
const { startExpressServer } = require("./expressServer");
const { startWebsocketServer } = require("./websocketServer");
const path = require("path");
const { openUrl } = require("./Controllers/system-controller");

if (require("electron-squirrel-startup")) app.quit();
const dbFileName = app.isPackaged ? "database.db" : "database_dev.db";
const db = new sqlite3.Database(
  path.join(__dirname + "/database/" + dbFileName)
);
const sql = fs
  .readFileSync(path.join(__dirname + "/database/data.sql"))
  .toString();
let tray;

db.exec(sql, function (err) {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Queries executed successfully.");
  }
});

global.db = db;

app.whenReady().then(() => {
  const icon = nativeImage.createFromPath(
    path.join(__dirname + "/assets/Images/icon.ico")
  );
  tray = new Tray(icon);

  const loginItemSettings = app.getLoginItemSettings();
  const appFolder = path.dirname(process.execPath);
  const updateExe = path.resolve(appFolder, "..", "Update.exe");
  const exeName = path.basename(process.execPath);
  // note: your contextMenu, Tooltip and Title code will go here!
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Auto Start",
      type: "checkbox",
      checked: loginItemSettings.openAtLogin,
      click: () => {
        app.setLoginItemSettings({
          openAtLogin: !loginItemSettings.openAtLogin,
          path: updateExe,
          args: [
            "--processStart",
            `"${exeName}"`,
            "--process-start-args",
            `"--hidden"`
          ]
        });
      }
    },
    {
      label: "Open Project Hub",
      click: () => {
        openUrl("http://localhost:9153");
      }
    },
    {
      type: "separator"
    },
    {
      label: "Exit",
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip("Project Hub");
  tray.setTitle("Project Hub");

  startExpressServer();
  startWebsocketServer();
});
