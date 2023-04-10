const {
  app,
  Tray,
  Menu,
  nativeImage,
  BrowserWindow,
  Notification
} = require("electron");
const sqlite3 = require("sqlite3");
const fs = require("fs");
const { startExpressServer, stopExpressServer } = require("./expressServer");
const {
  startWebsocketServer,
  stopWebsocketServer
} = require("./websocketServer");
const path = require("path");
const { openUrl } = require("./Controllers/system-controller");
const log = require("electron-log");
const { getIpAddress, getLatestRelease } = require("./Utils/utils");
if (require("electron-squirrel-startup")) app.quit();

const handleDatabase = async () => {
  try {
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

    db.exec(sql, function (err) {
      if (err) {
        log.error(err.message);
      } else {
        log.info("Queries executed successfully.");
      }
    });

    global.db = db;
  } catch (error) {
    log.error(error);
  }
};
let tray;
app.whenReady().then(async () => {
  app.dock.hide();
  errorCatcher();
  try {
    // Create the browser window, but don't show it for resisting the process
    let win = new BrowserWindow({
      show: false
    });

    let [address] = getIpAddress();
    setupAutoUpdater();
    // Make appData directory
    const appDataPath = path.join(app.getPath("appData"), "ProjectHub");
    if (!fs.existsSync(appDataPath)) {
      fs.mkdirSync(appDataPath);
    }
    handleDatabase();
    const iconPath = path.join(__dirname + "/assets/Images/iconTemplate.png");
    const icon = nativeImage
      .createFromPath(iconPath)
      .resize({ width: 24, height: 24 });
    icon.setTemplateImage(true);
    tray = new Tray(icon);

    const loginItemSettings = app.getLoginItemSettings({
      openAtLogin: true
    });

    // note: your contextMenu, Tooltip and Title code will go here!
    const contextMenu = Menu.buildFromTemplate([
      { label: "Current Version: " + app.getVersion(), enabled: false },
      {
        label: "Client Address: " + "http://" + address + ":9153",
        enabled: false
      },
      {
        label: "Auto Start",
        type: "checkbox",
        checked: loginItemSettings.openAtLogin,
        click: () => {
          app.setLoginItemSettings({
            openAtLogin: !loginItemSettings.openAtLogin
          });
        }
      },
      {
        label: "Open Project Hub",
        click: () => {
          openUrl(`http://${address}:9153`);
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

    log.info("Starting express server...");
    startExpressServer();
    log.info("Starting websocket server...");
    startWebsocketServer();
  } catch (error) {
    log.error(error);
  }
});

function errorCatcher() {
  process.on("uncaughtException", function (error) {
    // Handle the error
    log.error(error);
  });
}

async function setupAutoUpdater() {
  // Check for update
  let release = await getLatestRelease();
  let currentVersion = app.getVersion();
  let latestVersion = release.tag_name.replace("v", "");

  if (currentVersion === latestVersion) return;

  // Create notification
  const notification = new Notification({
    title: "Update Available",
    body: `New version ${latestVersion} is available.`
  });
  notification.show();

  const handleAction = (event) => {
    switch (event.sender.title) {
      case "Update Available":
        openUrl("https://project-hub.app");
    }
  };

  notification.addListener("action", (event, index) => {
    handleAction(event);
  });

  notification.addListener("click", (event) => {
    handleAction(event);
  });
}
