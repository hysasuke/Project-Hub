const { dialog, BrowserWindow, app, shell } = require("electron");
const path = require("path");
const fileIcon = require("file-icon");

const fs = require("fs");
async function selectFile(req, res) {
  // Set window icon
  const win = new BrowserWindow({
    icon: path.join(__dirname, "/../assets/Images/iconTemplate.ico")
  });
  win.moveTop();
  win.setOpacity(0);
  let selectedFiles = await dialog
    .showOpenDialog(win, {
      properties: ["openFile"],
      setIcon: path.join(__dirname, "/../assets/Images/iconTemplate.ico")
    })
    .finally(() => {
      win.close();
    });
  if (!selectedFiles.canceled) {
    let filePath = selectedFiles.filePaths[0].toString();
    let fileName = filePath.split("/").pop();
    let splittedFileName = fileName.split(".");
    splittedFileName.pop();
    let fileNameWithoutExtension = splittedFileName.join(".");

    const fileIconMac = await fileIcon.buffer(
      filePath // Path to file
    );

    // Save icon to appData
    const iconPath = path.join(__dirname, "../public", "icons");
    // Check if icon folder exists
    if (!fs.existsSync(iconPath)) {
      fs.mkdirSync(iconPath);
    }

    let iconName = fileNameWithoutExtension + ".png";
    fs.writeFileSync(iconPath + "/" + iconName, fileIconMac);

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

async function openUrl(url) {
  await shell.openExternal(url);
}

/*
   Disabled for Mac OS since it requires sudo, and users don't usually shutdown their Mac
*/
// function shutdown() {
//   exec(`shutdown -h now`, (err, stdout, stderr) => {
//     if (err) {
//       console.error(err);
//       return;
//     }
//   });
// }

// function restart() {
//   exec(`shutdown -r -t 0`, (err, stdout, stderr) => {
//     if (err) {
//       console.error(err);
//       return;
//     }
//   });
// }

// function setVolume(req, res) {
//   if (req.body.muted === undefined) {
//     audio.set(req.body.volume);
//   } else {
//     if (req.body.muted) {
//       audio.mute();
//     } else {
//       audio.set(req.body.volume);
//     }
//   }
//   res.status(200);
//   res.send({
//     error: 0,
//     data: {
//       volume: req.body.volume
//     }
//   });
// }

// function getVolume(req, res) {
//   let volume = audio.get();
//   let isMuted = audio.isMuted();
//   res.status(200);
//   res.send({
//     error: 0,
//     data: {
//       volume: volume,
//       muted: isMuted
//     }
//   });
// }

module.exports = {
  selectFile,
  openUrl
  // shutdown,
  // restart
  // setVolume,
  // getVolume
};
