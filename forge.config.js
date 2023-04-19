const fs = require("fs");

const path = require("path");
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
