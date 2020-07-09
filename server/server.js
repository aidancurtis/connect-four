const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const formatMove = require("./utils/move.js");
const {
  userJoin,
  userLeave,
  getCurrentUser,
  getUsersInRoom,
} = require("./utils/users.js");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = 3000 || process.env.PORT;

const { disconnect } = require("process");

server.listen(PORT, () => console.log(`server running on port ${PORT}`));

// set static folder
app.use(express.static("../client/src"));

// run when a client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ name, room }) => {
    const population = getUsersInRoom(room);

    if (population > 1) {
      socket.emit("message", "This game room is full...");
    } else {
      let color = "red";
      if (population == 1) {
        color = "yellow";
      }

      const user = userJoin(socket.id, name, room, color);

      socket.join(user.room);
      socket.emit("color", user.color);

      io.to(user.room).emit(
        "message",
        `Waiting for another player to join room...`
      );

      if (population == 1) {
        const turn = Math.floor(Math.random() * 2);

        turn === 0
          ? io.to(user.room).emit("startGame", "red")
          : io.to(user.room).emit("startGame", "yellow");
      }
    }
  });

  socket.on("makeMove", (move) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("placeMove", formatMove(user.name, user.color, move));
  });

  socket.on("restart", () => {
    const user = getCurrentUser(socket.id);
    const turn = Math.floor(Math.random() * 2);

    turn === 0
      ? io.to(user.room).emit("startGame", "red")
      : io.to(user.room).emit("startGame", "yellow");
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit("message", `${user.name} has left the game`);
    }
  });
});
