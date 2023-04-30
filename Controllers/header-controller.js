const log = require("electron-log");
const os = require("os");
const { keyboard, Key } = require("@nut-tree/nut-js");
const { exec } = require("child_process");
const platform = os.platform();
async function getHeaderComponents(req, res) {
  global.db.all(
    `SELECT * FROM header_component ORDER BY [order];`,
    (err, rows) => {
      if (err) {
        log.error(err.message);
        res.status(500);
        res.send({
          error: 1,
          data: null,
          message: err.message
        });
      } else {
        res.send({
          error: 0,
          data: rows ? rows : []
        });
        res.status(200);
      }
    }
  );
}

async function addHeaderComponent(req, res) {
  const { type, order, customInfo, bondType, bondInfo } = req.body;
  if (!type) {
    res.status(400);
    res.send({
      error: 1,
      data: null,
      message: "Type is required"
    });
    return;
  }
  global.db.run(
    `INSERT INTO header_component (type, [order], customInfo, bondType, bondInfo) VALUES (?,?,?,?,?);`,
    [type, order ? order : 0, customInfo, bondType, bondInfo],
    function (err, rows) {
      if (err) {
        log.error(err.message);
        res.status(500);
        res.send({
          error: 1,
          data: null,
          message: err.message
        });
      } else {
        // Get the last inserted id
        res.send({
          error: 0,
          data: { id: this.lastID, type, order, customInfo, bondType, bondInfo }
        });
        res.status(200);
      }
    }
  );
}

async function removeHeaderComponent(req, res) {
  const { id } = req.params;
  global.db.run(
    `DELETE FROM header_component WHERE id = ?;`,
    [id],
    (err, rows) => {
      if (err) {
        log.error(err.message);
        res.status(500);
        res.send({
          error: 1,
          data: null,
          message: err.message
        });
      } else {
        res.send({
          error: 0,
          data: rows ? rows : []
        });
        res.status(200);
      }
    }
  );
}

async function reorderHeaderComponents(req, res) {
  const { components } = req.body;
  let i = 0;
  const output = { success: [], error: [] };
  components.forEach((item) => {
    global.db.run(
      `UPDATE 'header_component' SET [order] = ? WHERE type = ?;`,
      [i, item.type],
      (err, rows) => {
        if (err) {
          log.error(err.message);
          output.error.push(rows);
        } else {
          output.success.push(rows);
        }
      }
    );
    i++;
  });
  res.send({
    error: 0,
    data: output
  });
  res.status(200);
}

async function handleHeaderComponent(req, res) {
  const type = req.body.type;
  switch (type) {
    case "screenSwitcher":
      handleScreenSwitcherAction(req, res);
      break;
    case "missionControl":
      handleMissionControlAction(req, res);
      break;
    case "volume":
      handleVolumeAction(req, res);
      break;
    case "mediaControl":
      handleMediaControlAction(req, res);
      break;
    case "screenShot":
      handleScreenshotAction(req, res);
      break;
    default:
      break;
  }
}

async function handleScreenshotAction(req, res) {
  const body = req.body;
  if (!body.region) {
    res.status(400);
    res.send({
      error: 1,
      data: null,
      message: "Region is required"
    });
    return;
  }
  let modifier = [];
  let key = null;
  switch (body.region) {
    case "custom":
      if (platform === "darwin") {
        modifier = [Key.LeftSuper, Key.LeftShift];
        key = Key.Num4;
        await keyboard.pressKey(...modifier, key);
        await keyboard.releaseKey(...modifier, key);
      } else if (platform === "win32") {
        exec("snippingtool /clip");
      }
      res.status(200);
      res.send({
        error: 0,
        data: null,
        message: "Success"
      });
      break;
    case "fullScreen":
      if (platform === "darwin") {
        modifier = [Key.LeftSuper, Key.LeftShift];
        key = Key.Num3;
        await keyboard.pressKey(...modifier, key);
        await keyboard.releaseKey(...modifier, key);
      } else if (platform === "win32") {
        exec("snippingtool");
      }
      res.status(200);
      res.send({
        error: 0,
        data: null,
        message: "Success"
      });
      break;
    default:
      res.status(400);
      res.send({
        error: 1,
        data: null,
        message: "Direction is invalid"
      });
  }
}

async function handleScreenSwitcherAction(req, res) {
  const body = req.body;
  if (!body.direction) {
    res.status(400);
    res.send({
      error: 1,
      data: null,
      message: "Direction is required"
    });
    return;
  }
  switch (body.direction) {
    case "right":
      await keyboard.pressKey(Key.LeftControl, Key.Right);
      await keyboard.releaseKey(Key.LeftControl, Key.Right);
      res.status(200);
      res.send({
        error: 0,
        data: null,
        message: "Success"
      });
      break;
    case "left":
      await keyboard.pressKey(Key.LeftControl, Key.Left);
      await keyboard.releaseKey(Key.LeftControl, Key.Left);
      res.status(200);
      res.send({
        error: 0,
        data: null,
        message: "Success"
      });
      break;
    default:
      res.status(400);
      res.send({
        error: 1,
        data: null,
        message: "Direction is invalid"
      });
  }
}

async function handleMissionControlAction(req, res) {
  await keyboard.pressKey(Key.LeftControl);
  await keyboard.pressKey(Key.Up);
  await keyboard.releaseKey(Key.LeftControl);
  await keyboard.releaseKey(Key.Up);

  res.status(200);
  res.send({
    error: 0,
    data: null,
    message: "Success"
  });
}

async function handleVolumeAction(req, res) {
  const body = req.body;
  if (!body.action) {
    res.status(400);
    res.send({
      error: 1,
      data: null,
      message: "Action is required"
    });
    return;
  }
  switch (body.action) {
    case "up":
      await keyboard.pressKey(Key.AudioVolUp);
      await keyboard.releaseKey(Key.AudioVolUp);
      res.status(200);
      res.send({
        error: 0,
        data: null,
        message: "Success"
      });
      break;
    case "down":
      await keyboard.pressKey(Key.AudioVolDown);
      await keyboard.releaseKey(Key.AudioVolDown);
      res.status(200);
      res.send({
        error: 0,
        data: null,
        message: "Success"
      });
      break;
    case "mute":
      await keyboard.pressKey(Key.AudioMute);
      await keyboard.releaseKey(Key.AudioMute);
      res.status(200);
      res.send({
        error: 0,
        data: null,
        message: "Success"
      });
      break;
    default:
      res.status(400);
      res.send({
        error: 1,
        data: null,
        message: "Direction is invalid"
      });
      break;
  }
}

async function handleMediaControlAction(req, res) {
  const body = req.body;
  if (!body.action) {
    res.status(400);
    res.send({
      error: 1,
      data: null,
      message: "Action is required"
    });
    return;
  }
  switch (body.action) {
    case "play":
      await keyboard.pressKey(Key.AudioPlay);
      await keyboard.releaseKey(Key.AudioPlay);
      res.status(200);
      res.send({
        error: 0,
        data: null,
        message: "Success"
      });
      break;
    case "pause":
      await keyboard.pressKey(Key.AudioPause);
      await keyboard.releaseKey(Key.AudioPause);
      res.status(200);
      res.send({
        error: 0,
        data: null,
        message: "Success"
      });
      break;
    case "next":
      await keyboard.pressKey(Key.AudioNext);
      await keyboard.releaseKey(Key.AudioNext);
      res.status(200);
      res.send({
        error: 0,
        data: null,
        message: "Success"
      });
      break;
    case "previous":
      await keyboard.pressKey(Key.AudioPrev);
      await keyboard.releaseKey(Key.AudioPrev);
      res.status(200);
      res.send({
        error: 0,
        data: null,
        message: "Success"
      });
      break;

    default:
      res.status(400);
      res.send({
        error: 1,
        data: null,
        message: "Direction is invalid"
      });
  }
}

module.exports = {
  getHeaderComponents,
  addHeaderComponent,
  removeHeaderComponent,
  reorderHeaderComponents,
  handleHeaderComponent
};
