const express = require("express");
const path = require("path");
const cors = require("cors");

const log = require("electron-log");
const multer = require("multer");

const {
  getGroups,
  addGroup,
  getGroupItems,
  createGroupItem,
  deleteGroupItem,
  renameGroup,
  deleteGroup,
  renameGroupItem,
  reorderGroupItems,
  reorderGroups
} = require("./Controllers/group-controller");
const {
  selectFile,
  shutdown,
  restart
} = require("./Controllers/system-controller");
const { handleGroupItem } = require("./Controllers/group-item-controller");
const {
  getHeaderComponents,
  addHeaderComponent,
  removeHeaderComponent,
  reorderHeaderComponents,
  handleHeaderComponent
} = require("./Controllers/header-controller");
const expressApp = express();
let server;
const upload = multer({ dest: path.join(__dirname, "public", "icons") });

const port = 9153;
function startExpressServer() {
  log.info(path.join(__dirname, "public"));
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

  expressApp.post("/group/reorder/", async (req, res) => {
    await reorderGroups(req, res);
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

  expressApp.get("/headerComponent", async (req, res) => {
    await getHeaderComponents(req, res);
  });

  expressApp.post("/headerComponent", async (req, res) => {
    await addHeaderComponent(req, res);
  });

  expressApp.delete("/headerComponent/:id", async (req, res) => {
    await removeHeaderComponent(req, res);
  });

  expressApp.post("/headerComponent/reorder/", async (req, res) => {
    await reorderHeaderComponents(req, res);
  });

  expressApp.post("/headerComponent/execute/", async (req, res) => {
    await handleHeaderComponent(req, res);
  });

  expressApp.post("/upload/icon", upload.single("file"), (req, res) => {
    // req.file contains information about the uploaded file
    const { originalname, filename } = req.file;
    res.status(200);
    res.send({
      error: 0,
      data: {
        originalname,
        filename
      }
    });
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
