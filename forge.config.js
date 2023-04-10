const fs = require("fs");

const path = require("path");
module.exports = {
  packagerConfig: {
    icon: "./assets/Images/icon"
  },
  makers: [
    {
      name: "@electron-forge/maker-dmg",
      config: {
        format: "ULFO"
      }
    }
  ]
};
