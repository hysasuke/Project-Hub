const { shell } = require("electron");
async function open(path) {
  await shell.openPath(path);
}

module.exports = {
  open
};
