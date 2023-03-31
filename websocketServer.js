const WebSocket = require("ws");
const audio = require("win-audio").speaker;
const server = new WebSocket.Server({ port: 8080 });

const startWebsocketServer = () => {
  server.on("connection", (socket) => {
    global.ws = socket;

    audio.polling(200);

    audio.events.on("change", (volume) => {
      socket.send(
        JSON.stringify({ type: "system_volume", data: { volume: volume.new } })
      );
    });
    audio.events.on("toggle", (status) => {
      socket.send(
        JSON.stringify({ type: "system_volume", data: { muted: status.new } })
      );
    });
    socket.on("message", (message) => {
      messageHandler(JSON.parse(message));
    });

    // Set interval to ping client every 10 seconds to indicate that the server is still alive
    const interval = setInterval(() => {
      socket.send("ping");
    }, 5000);

    socket.on("close", () => {
      console.log("Client disconnected");
    });
  });
};

const messageHandler = (message) => {
  if (!message.type) {
    return;
  }
  switch (message.type) {
    case "system_volume":
      if (message.data.volume) {
        audio.set(message.data.volume);
        global.ws?.send(
          JSON.stringify({
            type: "system_volume",
            data: { volume: message.data.volume }
          })
        );
      }
      if (message.data.muted) {
        audio.mute();
        global.ws?.send(
          JSON.stringify({
            type: "system_volume",
            data: { muted: true }
          })
        );
      } else {
        audio.unmute();
        global.ws?.send(
          JSON.stringify({
            type: "system_volume",
            data: { muted: false }
          })
        );
      }
    default:
      break;
  }
};

module.exports = {
  startWebsocketServer
};
