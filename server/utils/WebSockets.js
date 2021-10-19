const date = require("date-and-time");

let rooms = [];

let connection = (socket) => {
  socket.on("join", ({ username, room }) => {
    let index = getRoom(room);
    if (index == -1) {
      createRoom(socket.id, room, socket, username);
    } else {
      joinRoom(index, socket.id, socket, username);
    }
  });

  socket.on("message", (text) => {
    socket.to(socket.room).emit("message", {
      id: socket.id,
      username: socket.username,
      text: text,
      time: date.format(new Date(), "hh:mm A"),
    });
  });

  socket.on("kick", ({id, room}) => {
    console.log(id, room)
    kickUser(id, room, socket)
  })

  socket.on("disconnect", () => {
    removeUser(socket.id, socket.room);
    if (getRoom(socket.room) != -1) {
      socket
        .to(socket.room)
        .emit("get users", rooms[getRoom(socket.room)].users);
    }
    socket.to(socket.room).emit("user left", {
      username: socket.username,
      id: socket.id,
    });
  });
};

let removeUser = (id, room) => {
  let indexOfRoom = getRoom(room);
  if (indexOfRoom == -1) {
    return false;
  }
  let users = rooms[indexOfRoom].users;
  let indexOfUser = -1;
  for (let i = 0; i < users.length; ++i) {
    if (users[i].id == id) {
      indexOfUser = i;
      break;
    }
  }
  if (indexOfUser == -1) {
    return false;
  }
  users.splice(indexOfUser, 1);
  if (indexOfUser == 0) {
    rooms.splice(indexOfRoom, 1);
  }
  return true;
};

let getRoom = (roomID) => {
  for (let i = 0; i < rooms.length; ++i) {
    if (rooms[i].roomID == roomID) {
      return i;
    }
  }
  return -1;
};

let getUser = (id, index) => {
  let users = rooms[index].users;
  for (let i = 0; i < users.length; ++i) {
    if (users[i].id == id) {
      return i;
    }
  }
  return -1;
};

let joinRoom = (index, id, socket, username) => {
  if (rooms[index].users.length >= 5) {
    socket.disconnect();
    return;
  }
  socket.admin = false;
  rooms[index].users.push({
    id: id,
    username: username,
  });

  socket.join(rooms[index].roomID);
  socket.room = rooms[index].roomID;
  socket.username = username;
  socket.to(socket.room).emit("user joined", {
    id: socket.id,
    username: socket.username,
  });
  global.io.to(socket.id).emit("get users", rooms[index].users);
};

let createRoom = (id, roomID, socket, username) => {
  socket.join(roomID);
  socket.room = roomID;
  socket.admin = true;
  rooms.push({
    roomID: roomID,
    admin: id,
    users: [
      {
        id: id,
        username: username,
      },
    ],
  });
  global.io.to(roomID).emit("get users", rooms[rooms.length - 1].users);
};

let deleteRoom = (roomID) => {
  let index = getRoom(roomID);
  if (index != -1) {
    rooms.splice(index, 1);
  }
};

let kickUser = (id, room, socket) => {
  if (!socket.admin || socket.id == id) {
    return;
  }
  if (removeUser(id, room)) {
    console.log(id)
    console.log(global.io.sockets.sockets)
    if (io.sockets.sockets.get(id)) {
      io.sockets.sockets.get(id).disconnect();
    }
  }
};

module.exports = connection;
