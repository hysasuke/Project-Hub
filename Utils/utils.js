function getIpAddress() {
  var os = require("os");

  var interfaces = os.networkInterfaces();
  var addresses = [];
  for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
      var address = interfaces[k][k2];
      if (address.family === "IPv4" && !address.internal) {
        addresses.push(address.address);
      }
    }
  }
  return addresses;
}

async function getLatestRelease() {
  //url:  https://api.github.com/repos/OWNER/REPO/releases/latest
  let url = "https://api.github.com/repos/hysasuke/Project-Hub/releases/latest";
  const result = await fetch(url);
  const latestRelease = await result.json();
  return latestRelease;
}

module.exports = {
  getIpAddress,
  getLatestRelease
};
