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

const db = new sqlite3.Database(path.join(__dirname + "/database/database.db"));
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

  // note: your contextMenu, Tooltip and Title code will go here!
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open Project Hub",
      click: () => {
        openUrl("http://localhost:3001");
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
