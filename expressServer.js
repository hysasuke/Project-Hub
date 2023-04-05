const express = require("express");
const path = require("path");
const cors = require("cors");

const log = require("electron-log");
const {
  getGroups,
  addGroup,
  getGroupItems,
  createGroupItem,
  deleteGroupItem,
  renameGroup,
  deleteGroup,
  renameGroupItem,
  reorderGroupItems
} = require("./Controllers/group-controller");
const {
  selectFile,
  shutdown,
  setVolume,
  getVolume
} = require("./Controllers/system-controller");
const { handleGroupItem } = require("./Controllers/group-item-controller");
const expressApp = express();
let server;
const port = 9153;
function startExpressServer() {
  expressApp.use(cors());
  expressApp.use(express.json());
  expressApp.use(express.static(path.join(__dirname, "public")));

  expressApp.post("/open", (req, res) => {
    open(req.body.path);
    res.send("ok");
    res.status(200);
  });

  expressApp.get("/group", async (req, res) => {
    await getGroups(req, res);
  });

  expressApp.post("/group", async (req, res) => {
    await addGroup(req, res);
  });

  expressApp.delete("/group/:id", async (req, res) => {
    await deleteGroup(req, res);
  });

  expressApp.post("/group/rename/:id", async (req, res) => {
    await renameGroup(req, res);
  });

  expressApp.post("/groupItem/reorder/", async (req, res) => {
    await reorderGroupItems(req, res);
  });

  expressApp.get("/groupItem/:groupId", async (req, res) => {
    await getGroupItems(req, res);
  });

  expressApp.post("/groupItem/:groupId", async (req, res) => {
    await createGroupItem(req, res);
  });

  expressApp.get("/groupItem/execute/:id", async (req, res) => {
    handleGroupItem(req, res);
  });

  expressApp.post("/groupItem/rename/:id", async (req, res) => {
    await renameGroupItem(req, res);
  });

  expressApp.delete("/groupItem/:id", async (req, res) => {
    await deleteGroupItem(req, res);
  });

  expressApp.get("/requestFileSelection", (req, res) => {
    selectFile(req, res);
  });

  expressApp.get("/system/shutdown", (req, res) => {
    shutdown();
    res.send("ok");
    res.status(200);
  });

  expressApp.get("/system/restart", (req, res) => {
    shutdown();
    res.send("ok");
    res.status(200);
  });

  expressApp.post("/system/volume", (req, res) => {
    setVolume(req, res);
  });

  expressApp.get("/system/volume", (req, res) => {
    getVolume(req, res);
  });

  expressApp.get("/serverHealthCheck", (req, res) => {
    res.send("ok");
    res.status(200);
  });

  server = expressApp.listen(port, () => {
    log.info("Express server started on port " + port);
    console.log(`Example app listening on port ${port}`);
  });
}

function stopExpressServer() {
  server.close();
}

module.exports = { startExpressServer, stopExpressServer };
