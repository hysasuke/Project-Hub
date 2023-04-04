const { app } = require("electron");
const fs = require("fs");
const path = require("path");

async function checkForUpdate(url) {
  const response = await fetch(url);
  const data = await response.json();
  const latestRelease = data[0];

  // Check if the tag_name is started with v
  const validRelease = latestRelease.tag_name.startsWith("v");

  if (!validRelease) {
    return {
      updateAvailable: false
    };
  }
  const changeLog = latestRelease.body;
  const latestVersion = latestRelease.tag_name.replace("v", "");
  const currentVersion = app.getVersion();
  const updateAvailable = latestVersion !== currentVersion;

  const assets = latestRelease.assets;
  const nupkg = assets.find((asset) => asset.name.endsWith(".nupkg"));
  const releaseFile = assets.find((asset) => asset.name === "RELEASES");
  const nupkgDownloadUrl = nupkg.browser_download_url;
  const releaseFileDownloadUrl = releaseFile.browser_download_url;

  return {
    updateAvailable,
    latestVersion,
    currentVersion,
    changeLog,
    downloadUrls: {
      nupkg: {
        name: nupkg.name,
        url: nupkgDownloadUrl
      },
      releases: {
        name: releaseFile.name,
        url: releaseFileDownloadUrl
      }
    }
  };
}

const downloadLatestRelease = async (downloadUrls) => {
  const { nupkg, releases } = downloadUrls;
  const appDataPath = path.join(
    app.getPath("appData"),
    "ProjectHub",
    "packages"
  );
  const nupkgPath = path.join(appDataPath, nupkg.name);
  const releaseFilePath = path.join(appDataPath, "RELEASES");

  const nupkgResponse = await fetch(nupkg.url);
  const releaseFileResponse = await fetch(releases.url);

  const nupkgBuffer = await nupkgResponse.buffer();
  const releaseFileBuffer = await releaseFileResponse.buffer();

  fs.writeFileSync(nupkgPath, nupkgBuffer);
  fs.writeFileSync(releaseFilePath, releaseFileBuffer);
};

module.exports = {
  checkForUpdate,
  downloadLatestRelease
};
