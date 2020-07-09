const users = [];

function getUsersInRoom(room) {
  return users.map((user) => user.room == room).length;
}

function userJoin(id, name, room, color) {
  const user = { id, name, room, color };

  users.push(user);

  return user;
}

function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) return users.splice(index, 1)[0];
}

module.exports = {
  userJoin,
  getCurrentUser,
  getUsersInRoom,
  userLeave,
};
