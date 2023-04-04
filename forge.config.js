module.exports = {
  packagerConfig: {
    icon: "./assets/Images/icon.ico"
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "ProjectHub",
        authors: "Wenhao Li",
        exe: "ProjectHub.exe",
        setupIcon: "./assets/Images/icon.ico",
        iconUrl:
          "https://raw.githubusercontent.com/ProjectHub-Team/ProjectHub/master/assets/Images/icon.ico",
        loadingGif: "./assets/Images/loading.gif",
        noMsi: true
      }
    }
  ]
};
