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

const handleDatabase = () => {
  // Check if database folder exists
  const databasePath = path.join(app.getPath("appData"), "ProjectHub");

  const dbFileName = "database.db";
  if (!fs.existsSync(databasePath)) {
    fs.mkdirSync(databasePath);
    // Create empty database.db file
    fs.writeFileSync(path.join(databasePath, dbFileName), "");
  }
  const db = new sqlite3.Database(databasePath + "/" + dbFileName);
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
};

app.whenReady().then(() => {
  // Make appData directory
  const appDataPath = path.join(app.getPath("appData"), "ProjectHub");
  if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath);
  }
  handleDatabase();
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
      checked: loginItemSettings.executableWillLaunchAtLogin,
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
