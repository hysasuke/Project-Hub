const { open } = require("./application-controller");
const { openUrl } = require("./system-controller");
const { keyboard, Key } = require("@nut-tree/nut-js");
function handleGroupItem(req, res) {
  const groupItemID = parseInt(req.params.id);
  global.db.get(
    `SELECT * FROM 'group_item' WHERE id = ?;`,
    [groupItemID],
    async (err, row) => {
      if (err) {
        log.error(err.message);
        res.status(500);
        res.send({
          error: 1,
          data: null,
          message: err.message
        });
      } else {
        if (row) {
          switch (row.type) {
            case "file":
              open(row.path);
              break;
            case "link":
              openUrl(row.url);
              break;
            case "keybind":
              const splitted = row.keybind.split(":");
              const modifiers = splitted[0].split("+");
              const keyCodes = modifiers.map((modifier) => {
                let modifierName = "";
                switch (modifier) {
                  case "Control":
                    modifierName = "LeftControl";
                    break;
                  case "Alt":
                    modifierName = "LeftAlt";
                    break;
                  case "Shift":
                    modifierName = "LeftShift";
                    break;
                  case "Command":
                    modifierName = "LeftSuper";
                    break;
                  default:
                    modifierName = modifier;
                    break;
                }
                return Key[modifierName];
              });
              const key = splitted[1];
              keyboard.config.autoDelayMs = 0;
              await keyboard.pressKey(...keyCodes, Key[key]);
              await keyboard.releaseKey(...keyCodes, Key[key]);
              break;
            default:
              break;
          }
        }
        res.send({
          error: 0,
          data: row ? row : []
        });
        res.status(200);
      }
    }
  );
}

module.exports = { handleGroupItem };
