async function getGroups(req, res) {
  global.db.all(`SELECT * FROM 'group';`, (err, rows) => {
    if (err) {
      console.error(err.message);
    } else {
      res.send({
        error: 0,
        data: rows ? rows : []
      });
      res.status(200);
    }
  });
}

async function addGroup(req, res) {
  const { name } = req.body;
  global.db.run(
    `INSERT INTO 'group' (name) VALUES ('${name}');`,
    (err, rows) => {
      if (err) {
        console.error(err.message);
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

async function getGroupItems(req, res) {
  const { groupId } = req.params;
  global.db.all(
    `SELECT * FROM 'group_item' WHERE group_id = ${groupId} ORDER BY [order];`,
    (err, rows) => {
      if (err) {
        console.error(err.message);
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

async function createGroupItem(req, res) {
  const { groupId } = req.params;
  const { name, type, selectedFile, url, keybind } = req.body;
  let getFavicons = require("get-website-favicon");
  let icon = "";
  if (type === "link") {
    let data = await getFavicons(url);
    icon = data.icons[0].src;
  } else if (type === "file") {
    icon = selectedFile.icon;
  }
  global.db.run(
    `INSERT INTO 'group_item' (group_id, name, type, path, url, icon, keybind) VALUES (?,?,?,?,?,?,?);`,
    [
      groupId,
      name,
      type,
      selectedFile?.path,
      url ? url : "",
      icon,
      keybind ? keybind : ""
    ],
    (err, rows) => {
      if (err) {
        console.error(err.message);
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

async function deleteGroupItem(req, res) {
  const { id } = req.params;
  global.db.run(`DELETE FROM 'group_item' WHERE id = ?;`, [id], (err, rows) => {
    if (err) {
      console.error(err.message);
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
  });
}

async function renameGroup(req, res) {
  const { id } = req.params;
  const { name } = req.body;

  global.db.run(
    `UPDATE 'group' SET name = ? WHERE id = ?;`,
    [name, id],
    (err, rows) => {
      if (err) {
        console.error(err.message);
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

async function deleteGroup(req, res) {
  const { id } = req.params;
  global.db.run(`DELETE FROM 'group' WHERE id = ?;`, [id], (err, rows) => {
    if (err) {
      console.error(err.message);
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
  });
}

async function renameGroupItem(req, res) {
  const { id } = req.params;
  const { name } = req.body;

  global.db.run(
    `UPDATE 'group_item' SET name = ? WHERE id = ?;`,
    [name, id],
    (err, rows) => {
      if (err) {
        console.error(err.message);
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

async function reorderGroupItems(req, res) {
  const { groupItems } = req.body;
  let i = 0;
  const output = { success: [], error: [] };
  groupItems.forEach((item) => {
    global.db.run(
      `UPDATE 'group_item' SET [order] = ? WHERE id = ?;`,
      [i, item.id],
      (err, rows) => {
        if (err) {
          console.error(err.message);
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

module.exports = {
  getGroups,
  addGroup,
  getGroupItems,
  createGroupItem,
  deleteGroupItem,
  renameGroup,
  deleteGroup,
  renameGroupItem,
  reorderGroupItems
};
