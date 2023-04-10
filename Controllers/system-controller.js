const { dialog, BrowserWindow, app } = require("electron");
const path = require("path");
const { exec } = require("child_process");
const audio = require("win-audio").speaker;
const fs = require("fs");
async function selectFile(req, res) {
  // Set window icon
  const win = new BrowserWindow({
    icon: path.join(__dirname, "/../assets/Images/icon.ico")
  });
  win.moveTop();
  win.setOpacity(0);
  let selectedFiles = await dialog
    .showOpenDialog(win, {
      properties: ["openFile"],
      setIcon: path.join(__dirname, "/../assets/Images/icon.ico")
    })
    .finally(() => {
      win.close();
    });
  if (!selectedFiles.canceled) {
    let filePath = selectedFiles.filePaths[0].toString();
    let fileName = filePath.split("\\").pop();
    let splittedFileName = fileName.split(".");
    splittedFileName.pop();
    let fileNameWithoutExtension = splittedFileName.join(".");

    const fileIcon = await app.getFileIcon(
      selectedFiles.filePaths[0].toString(),
      {
        size: "large"
      }
    );
    // Save icon to appData
    const iconPath = path.join(__dirname, "/../public/icons");
    // Check if icon folder exists
    if (!fs.existsSync(iconPath)) {
      fs.mkdirSync(iconPath);
    }

    let iconName = fileNameWithoutExtension + ".png";
    fs.writeFileSync(iconPath + "/" + iconName, fileIcon.toPNG());

    res.status(200);
    res.send({
      error: 0,
      data: {
        name: fileNameWithoutExtension,
        nameWithExtension: fileName,
        path: filePath,
        icon: iconName
      }
    });
  } else {
    res.status(400);
    res.send({
      error: 1,
      data: null,
      message: "No file selected"
    });
  }
}

function openUrl(url) {
  exec(`start ${url}`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
  });
}

function shutdown() {
  exec(`shutdown -s -t 0`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
  });
}

function restart() {
  exec(`shutdown -r -t 0`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
  });
}

function setVolume(req, res) {
  if (req.body.muted === undefined) {
    audio.set(req.body.volume);
  } else {
    if (req.body.muted) {
      audio.mute();
    } else {
      audio.set(req.body.volume);
    }
  }
  res.status(200);
  res.send({
    error: 0,
    data: {
      volume: req.body.volume
    }
  });
}

function getVolume(req, res) {
  let volume = audio.get();
  let isMuted = audio.isMuted();
  res.status(200);
  res.send({
    error: 0,
    data: {
      volume: volume,
      muted: isMuted
    }
  });
}

module.exports = {
  selectFile,
  openUrl,
  shutdown,
  restart,
  setVolume,
  getVolume
};
