const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 8080 });

const { keyboard, Key } = require("@nut-tree/nut-js");
const startWebsocketServer = () => {
  server.on("connection", (socket) => {
    if (global.ws) {
      global.ws.push(socket);
    } else {
      global.ws = [socket];
    }
    socket.on("message", (message) => {
      messageHandler(JSON.parse(message));
    });

    socket.on("close", () => {
      console.log("Client disconnected");
    });
  });
};

const messageHandler = async (message) => {
  if (!message.type) {
    return;
  }
  switch (message.type) {
    case "system_volume":
      if (message.data.volume) {
        global.ws?.forEach((ws) => {
          ws.send(
            JSON.stringify({
              type: "system_volume",
              data: { volume: message.data.volume }
            })
          );
        });
      }
      if (message.data.muted) {
        global.ws?.forEach((ws) => {
          ws.send(
            JSON.stringify({
              type: "system_volume",
              data: { muted: true }
            })
          );
        });
      } else {
        global.ws?.forEach((ws) => {
          ws.send(
            JSON.stringify({
              type: "system_volume",
              data: { muted: false }
            })
          );
        });
      }
    case "keyPress":
      if (message.data.key) {
        await keyboard.pressKey(Key[message.data.key]);
        await keyboard.releaseKey(Key[message.data.key]);
      }
    default:
      break;
  }
};

function stopWebsocketServer() {
  server.close();
}

function postMessage(message) {
  global.ws?.forEach((ws) => {
    ws.send(JSON.stringify(message));
  });
}

module.exports = {
  startWebsocketServer,
  stopWebsocketServer,
  postMessage
};
