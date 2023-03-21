const { exec } = require("child_process");
function open(path) {
  exec(`"${path}"`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
  });
}

module.exports = {
  open
};
