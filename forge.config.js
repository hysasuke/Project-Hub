const os = require("os");

const platform = os.platform();

if (platform === "darwin") {
  module.exports = {
    packagerConfig: {
      icon: "./assets/Images/icon"
    },
    makers: [
      {
        name: "@electron-forge/maker-dmg",
        config: {
          format: "ULFO",
          icon: "./assets/Images/icon.icns"
        }
      }
    ]
  };
} else if (platform === "win32") {
  module.exports = {
    packagerConfig: {
      icon: "./assets/Images/iconTemplate"
    },
    makers: [
      {
        name: "@electron-forge/maker-squirrel",
        config: {
          name: "ProjectHub",
          authors: "Wenhao Li",
          exe: "ProjectHub.exe",
          setupIcon: "./assets/Images/iconTemplate.ico",
          iconUrl:
            "https://raw.githubusercontent.com/ProjectHub-Team/ProjectHub/master/assets/Images/iconTemplate.ico",
          loadingGif: "./assets/Images/loading.gif",
          noMsi: true
        }
      }
    ]
  };
}
