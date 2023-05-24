const {
  app,
  Tray,
  Menu,
  nativeImage,
  BrowserWindow,
  Notification,
  autoUpdater
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
const { platform } = require("os");

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
  errorCatcher();
  if (platform() === "darwin") {
    app.dock.hide();
  }
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
    const appFolder = path.dirname(process.execPath);
    const updateExe = path.resolve(appFolder, "..", "Update.exe");
    const exeName = path.basename(process.execPath);
    const loginItemSettingArgs =
      platform() === "win32"
        ? {
            openAtLogin: true,
            path: updateExe,
            args: [
              "--processStart",
              `"${exeName}"`,
              "--process-start-args",
              `"--hidden"`
            ]
          }
        : {
            openAtLogin: true
          };
    tray = new Tray(icon);

    const loginItemSettings = app.getLoginItemSettings(loginItemSettingArgs);

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
          app.setLoginItemSettings(loginItemSettingArgs);
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
  if (platform() === "darwin") {
    // Check for update every hour
    setInterval(async () => {
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
    }, 1000 * 60 * 60);
  } else if (platform() === "win32") {
    // Check for update
    autoUpdater.setFeedURL({
      url: "https://github.com/hysasuke/Project-Hub/releases/latest/download/"
    });

    autoUpdater.on("checking-for-update", () => {
      log.info("Checking for update...");
    });
    autoUpdater.on("update-available", (info) => {
      log.info("Update available.");
    });

    autoUpdater.on("update-downloaded", (info) => {
      log.info("Update downloaded");
      autoUpdater.quitAndInstall();
    });

    autoUpdater.on("update-not-available", (info) => {
      log.info("Update not available.");
    });

    autoUpdater.on("error", (err) => {
      log.info("Error in auto-updater. " + err);
    });

    autoUpdater.on("before-quit-for-update", () => {
      log.info("Update downloaded; will install on quit");
      stopExpressServer();
      stopWebsocketServer();
    });

    // Listen to before-quit event
    app.on("before-quit", () => {
      log.info("App is quitting...");
      stopExpressServer();
      stopWebsocketServer();
    });

    // set auto update if in production
    if (app.isPackaged) {
      autoUpdater.checkForUpdates();
    }
  }
}

function clipboardListener() {
  setInterval(() => {
    const clipboard = require("electron").clipboard;
    const text = clipboard.readImage();
    // console.log(text);
  }, 1000);
}
