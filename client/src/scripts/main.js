// SELECTORS
const cellElements = document.querySelectorAll("[data-cell]");
const pointers = document.querySelectorAll(".pointer-cell");

const waitingMessage = document.getElementById("waitingMessage");
const waitingText = document.querySelector("[data-message-text]");

const winningText = document.querySelector("[data-winning-message-text]");
const winningElement = document.getElementById("winningMessage");
const restartButton = document.getElementById("restartButton");

const bar = document.getElementById("turn-bar");

// VARIABLES
const RED = "#e91e63";
const YELLOW = "#ffeb3b";
let active;
let userColor;

// get name and room from url
const { name, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

/* EVENT LISTENERS */
/* MAKE MOVE */
const makeMove = (e) => {
  const cell = e.target;
  const move = active[cell.dataset.col];

  if (move >= 0) {
    socket.emit("makeMove", move);
  } else {
    waitingText.innerHTML = "Invalid Move";
    waitingMessage.classList.add("show");
    setTimeout(() => {
      waitingMessage.classList.remove("show");
    }, 1000);
  }
};

/* POINTER OVER */
const pointerOver = (e) => {
  const cell = e.target;
  const column = cell.dataset.col;
  pointers[column].classList.add(`${userColor}`);
};

/* POINTER LEAVE */
const pointerLeave = (e) => {
  const cell = e.target;
  const column = cell.dataset.col;
  pointers[column].classList.remove("red");
  pointers[column].classList.remove("yellow");
};

/* SOCKET FUNCTIONS */
// initialize socket
const socket = io();

// join chatroom
socket.emit("joinRoom", { name, room });

// initialize color
socket.on("color", (color) => {
  userColor = color;
});

// for receiving messages
socket.on("message", (message) => {
  winningElement.classList.remove("show");

  waitingMessage.classList.add("show");
  waitingText.innerHTML = message;
});

restartButton.addEventListener("click", () => {
  socket.emit("restart");
});

// start game
socket.on("startGame", (turn) => {
  active = [35, 36, 37, 38, 39, 40, 41];

  bar.style.background = userColor == "red" ? RED : YELLOW;
  winningElement.classList.remove("show");

  cellElements.forEach((cell) => {
    cell.addEventListener("click", makeMove);
    cell.addEventListener("mouseover", pointerOver);
    cell.addEventListener("mouseout", pointerLeave);

    cell.dataset.peice = " ";
    cell.classList.remove("yellow");
    cell.classList.remove("red");
  });

  waitingMessage.classList.add("show");

  turn === userColor
    ? waitingMessage.classList.remove("show")
    : (waitingText.innerHTML = "Opponent's move");
});

// place move
socket.on("placeMove", ({ player, color, move }) => {
  const cell = cellElements[move];
  console.log(cell);

  cell.classList.add(color);
  cell.dataset.peice = player;

  const column = cell.dataset.col;
  active[column] -= 7;

  const cells = document.querySelectorAll(`[data-col='${column}']`);

  if (active[column] <= 0) {
    cells.forEach((cell) => {
      cell.removeEventListener("click", (cell) => {
        makeMove(cell);
      });
      cell.classList.add("empty");
    });
  }

  if (player === name) {
    waitingText.innerHTML = "Opponent's move...";
    waitingMessage.classList.add("show");
  } else {
    waitingMessage.classList.remove("show");
  }

  if (checkWin()) {
    endGame(player);
  }

  if (isFull()) {
    endGame(null);
  }
});

/* WIN FUNCTIONS*/
function checkWin() {
  return horizontalCheck() || verticalCheck() || diagonalCheck();
}

function colorMatch(one, two, three, four) {
  return (
    cellElements[one].dataset.peice == cellElements[two].dataset.peice &&
    cellElements[one].dataset.peice == cellElements[three].dataset.peice &&
    cellElements[one].dataset.peice == cellElements[four].dataset.peice &&
    cellElements[one].dataset.peice != " "
  );
}

function horizontalCheck() {
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 4; j++) {
      let spot = i * 7 + j;
      if (colorMatch(spot, spot + 1, spot + 2, spot + 3)) {
        return true;
      }
    }
  }
}

function verticalCheck() {
  for (let i = 0; i < 21; i++) {
    if (colorMatch(i, i + 7, i + 14, i + 21)) {
      return true;
    }
  }
}

function diagonalCheck() {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      let spot = i * 7 + j;
      if (colorMatch(spot, spot + 8, spot + 16, spot + 24)) {
        return true;
      }
    }
  }
  for (let i = 0; i < 3; i++) {
    for (let j = 3; j < 7; j++) {
      let spot = i * 7 + j;
      if (colorMatch(spot, spot + 6, spot + 12, spot + 18)) {
        return true;
      }
    }
  }
}

/* CHECK FULL BOARD */
function isFull() {
  for (let i = 0; i < 42; i++) {
    if (cellElements[i].dataset.peice == " ") {
      return false;
    }
  }
  return true;
}

function endGame(player) {
  waitingMessage.classList.remove("show");

  player != null
    ? (winningText.innerHTML = `${player} wins!`)
    : (winningText.innerHTML = "Draw");

  winningElement.classList.add("show");

  cellElements.forEach((cell) => {
    cell.removeEventListener("click", makeMove);
    cell.removeEventListener("mouseover", pointerOver);
    cell.removeEventListener("mouseout", pointerLeave);
  });
}
