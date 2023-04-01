const { exec } = require("child_process");
const { shell } = require("electron");
async function open(path) {
  let result = await shell.openPath(path);
  // exec(`"${path}"`, (err, stdout, stderr) => {
  //   if (err) {
  //     console.error(err);
  //     return;
  //   }
  // });
}

module.exports = {
  open
};
