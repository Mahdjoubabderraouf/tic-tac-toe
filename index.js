const cellType = {
  x: "x",
  o: "o",
};

const createPlayer = (cellType) => {
  const type = cellType;
  const getType = () => {
    return type;
  };
  return { getType };
};

const createHumanPlayer = (type) => {
  const player = createPlayer(type);

  const nextPlay = (row, col) => {
    return Gameboard.setNewPlay(row, col, type);
  };
  return { ...player, nextPlay };
};

const createCell = () => {
  let value = "";
  const getValue = () => {
    return value;
  };

  const isEmpty = () => {
    return value === "";
  };

  const setValue = (newValue) => {
    if (isEmpty()) {
      value = newValue;
      return true;
    } else {
      console.log("this cell is already used you can't chang its value");
      return false;
    }
  };
  return {
    getValue,
    isEmpty,
    setValue,
  };
};

const Gameboard = (() => {
  let counterMoves = 0;

  const createGameboard = (numberOfRows, numberOfColumns) => {
    const gameboard = [];
    for (let i = 0; i < numberOfRows; i++) {
      gameboard.push([]);
      for (let j = 0; j < numberOfColumns; j++) {
        gameboard[i].push(createCell());
      }
    }
    return gameboard;
  };

  let gameboard = createGameboard(3, 3);

  const getGameboard = () => {
    return gameboard;
  };

  const getCellGenral = (row, col) => {
    return gameboard[row][col].getValue();
  };

  const setNewPlay = (row, col, value) => {
    if (gameboard[row][col].setValue(value)) {
      counterMoves++;
      return true;
    }
    return false;
  };

  const deacreseCounter = () => {
    counterMoves--;
  };

  const checkDraw = () => {
    return counterMoves === 9;
  };

  const checkLine = (getCelle, index, length, value) => {
    if (index < 0)
      throw new Error("Index range error: i must be great or equal to 0");
    if (index + 1 < length) {
      if (getCelle(index + 1) === value) {
        if (index + 2 < length) {
          return getCelle(index + 2) === value;
        }
        if (index > 0) return getCelle(index - 1) === value;
      }
      return false;
    }
    return getCelle(index - 1) === value && getCelle(index - 2) === value;
  };

  const checkRowNeighbors = (row, col, value) => {
    const getCelle = (index) => {
      return getCellGenral(row, index);
    };
    return checkLine(getCelle, col, gameboard[row].length, value);
  };

  const checkColNeighbors = (row, col, value) => {
    const getCelle = (index) => {
      return getCellGenral(index, col);
    };
    return checkLine(getCelle, row, gameboard.length, value);
  };

  const checkDiagonalNeighbors = (row, col, value) => {
    const getCell1 = (index) => {
      return getCellGenral(index, index);
    };
    const getCell2 = (index) => {
      return getCellGenral(index, gameboard.length - 1 - index);
    };
    let firstCheck, secondCheck;

    if (row === col) {
      firstCheck = checkLine(getCell1, row, gameboard.length, value);
      if (firstCheck) return firstCheck;
    }
    if (row + col === gameboard.length - 1) {
      secondCheck = checkLine(getCell2, row, gameboard.length, value);
      if (secondCheck) return secondCheck;
    }
    return false;
  };

  const checkWinner = (row, col) => {
    if (counterMoves < 5) return false;
    if (!gameboard[row][col].isEmpty()) {
      const valueOfTheMove = gameboard[row][col].getValue();
      if (checkRowNeighbors(row, col, valueOfTheMove)) return true;
      if (checkColNeighbors(row, col, valueOfTheMove)) return true;
      return checkDiagonalNeighbors(row, col, valueOfTheMove);
    }
    throw new Error("The cell is empty");
  };

  const roundStatus = (row, col) => {
    if (checkDraw()) return "draw";
    if (checkWinner(row, col)) return "winner";
    return "continue";
  };

  // for testing in the console
  const printGameboard = () => {
    gameboard.forEach((row) => {
      console.log(row.map((cell) => cell.getValue()).join(" | "));
    });
    console.log(" ");
  };

  const resetGameboard = () => {
    gameboard = createGameboard(3, 3);
    Game.resetPlayers();
    counterMoves = 0;
  };

  const setGameboard = (newGameboard) => {
    gameboard = newGameboard.map((row) => row.map((cell) => ({ ...cell })));
  };

  const copyGameboard = () => {
    return gameboard.map((row) =>
      row.map((cell) => {
        const newCell = createCell();
        newCell.setValue(cell.getValue());
        return newCell;
      })
    );
  };

  return {
    setGameboard,
    resetGameboard,
    getCellGenral,
    printGameboard,
    roundStatus,
    getGameboard,
    setNewPlay,
    copyGameboard,
    deacreseCounter,
  };
})();

const Game = (() => {
  let historyStack = [];
  let currentPlayer = createHumanPlayer(cellType.x);
  let nextPlayer = createHumanPlayer(cellType.o);

  const resetPlayers = () => {
    currentPlayer = createHumanPlayer(cellType.x);
    nextPlayer = createHumanPlayer(cellType.o);
  };

  const setPlayers = (currentPlayer1, nextPlayer1) => {
    currentPlayer = currentPlayer1;
    nextPlayer = nextPlayer1;
  };

  const getLastPlayValue = () => {
    return nextPlayer.getType();
  };

  const getNextPlayer = () => {
    return currentPlayer.getType();
  };

  const getLastMove = () => {
    if (historyStack.length === 0) return false;
    return historyStack.pop();
  };

  const switchPlayers = () => {
    [currentPlayer, nextPlayer] = [nextPlayer, currentPlayer];
  };

  const toSaveInHistory = () => {
    const currentPlayerCopy = createHumanPlayer(currentPlayer.getType());
    const nextPlayerCopy = createHumanPlayer(nextPlayer.getType());
    const gameboardCopy = Gameboard.copyGameboard();
    return {
      currentPlayerCopy,
      nextPlayerCopy,
      gameboardCopy,
    };
  };

  const play = (row, col) => {
    const previousMove = toSaveInHistory();
    if (currentPlayer.nextPlay(row, col)) {
      historyStack.push(previousMove);
      const roundStatus = Gameboard.roundStatus(row, col);
      Gameboard.printGameboard();
      switchPlayers();
      return roundStatus;
    }
  };

  const backStep = () => {
    const lastMove = getLastMove();
    if (lastMove) {
      Gameboard.setGameboard(lastMove.gameboardCopy);
      setPlayers(lastMove.currentPlayerCopy, lastMove.nextPlayerCopy);
      Gameboard.deacreseCounter();
      return true;
    }
    return false;
  };

  return {
    backStep,
    setPlayers,
    getLastMove,
    resetPlayers,
    play,
    getLastPlayValue,
    getNextPlayer,
  };
})();

const displayVue = (() => {
  const createElement = (tag, classList, father) => {
    const vue = document.createElement(tag);
    vue.classList.add(...classList);
    father.appendChild(vue);
    return vue;
  };

  const main = document.querySelector("main");
  const gameboardUI = document.getElementById("gameboard");

  const h4 = createElement("h4", [], main);
  const setH4 = (text) => {
    h4.textContent = text;
  };

  const buttonsContainer = createElement("div", ["buttons-container"], main);

  const newGameBtn = createElement("button", ["white-btn"], buttonsContainer);
  newGameBtn.textContent = "Start New Game";
  newGameBtn.addEventListener("click", () => {
    displayController.reset();
  });

  const icon = createElement("img", ["white-btn", "svg"], buttonsContainer);
  icon.src = "./assets/icons8-left-arrow.svg";
  icon.alt = "back icon";
  icon.addEventListener("click", () => {
    displayController.backStep();
  });

  const createCell = (row, col) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.setAttribute("data-row", row);
    cell.setAttribute("data-col", col);
    return cell;
  };

  const getCell = (row, column) => {
    return document.querySelector(
      `.cell[data-row="${row}"][data-col="${column}"]`
    );
  };

  const setCellText = (cell, text) => {
    cell.textContent = text;
  };

  const createDialoge = ({ roundStatus, winnerType }) => {
    const dialoge = createElement("dialog", ["dialoge"], main);
    const dialogContent = createElement("div", ["container"], dialoge);
    const roundStatusDiv = createElement("h3", ["round-status"], dialogContent);
    const newGameButton = createElement("button", ["new-game"], dialogContent);
    const closeDialogeButton = createElement(
      "button",
      ["close-dialoge"],
      dialogContent
    );
    closeDialogeButton.textContent = "X";
    closeDialogeButton.addEventListener("click", () => {
      removeDialoge();
    });
    newGameButton.textContent = "Start New Game";
    newGameButton.addEventListener("click", () => {
      removeDialoge();
      displayController.reset();
    });
    if (roundStatus === "winner") {
      roundStatusDiv.textContent = `The winner is ${winnerType}`;
    } else if (roundStatus === "draw") {
      roundStatusDiv.textContent = "It's a draw";
    }
  };

  const removeDialoge = () => {
    const dialoge = document.querySelector(".dialoge");
    dialoge.remove();
  };

  const renderGameboard = (gameboardData, nextPlayer) => {
    gameboardUI.innerHTML = ""; // Clear gameboard before rendering
    gameboardData.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellUI = createCell(rowIndex, colIndex);
        cellUI.classList.add("cell");
        gameboardUI.appendChild(cellUI);
      });
    });
    setH4(`First Player: ${nextPlayer}`);
  };

  const resetGameboard = (nextPlayer) => {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => {
      cell.textContent = "";
    });
    setH4(`First Player: ${nextPlayer}`);
  };

  const reRenderGameboard = (gameboardData, nextPlayer) => {
    gameboardUI.innerHTML = "";
    gameboardData.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellUI = createCell(rowIndex, colIndex);
        cellUI.classList.add("cell");
        setCellText(cellUI, cell.getValue());
        gameboardUI.appendChild(cellUI);
      });
    });
    setH4(`Next Player: ${nextPlayer}`);
  };

  return {
    setCellText,
    resetGameboard,
    removeDialoge,
    setH4,
    createDialoge,
    renderGameboard,
    reRenderGameboard,
    getCell,
  };
})();

const displayController = (() => {
  const gameboardData = Gameboard.getGameboard();

  displayVue.renderGameboard(gameboardData, Game.getNextPlayer());

  const addEventListeners = () => {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => {
      cell.addEventListener("click", (e) => {
        const row = parseInt(e.target.getAttribute("data-row"));
        const col = parseInt(e.target.getAttribute("data-col"));
        const roundStatus = Game.play(row, col);

        displayVue.setCellText(e.target, Gameboard.getCellGenral(row, col));
        if (roundStatus === "winner") {
          displayVue.createDialoge({
            roundStatus,
            winnerType: Game.getLastPlayValue(),
          });
        } else if (roundStatus === "draw") {
          displayVue.createDialoge({ roundStatus });
        } else if (roundStatus === "continue") {
          displayVue.setH4(`Next Player: ${Game.getNextPlayer()}`);
        }
      });
    });
  };

  addEventListeners();

  const fillGameboard = (gameboardData, nextPlayer) => {
    gameboardData.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellUI = displayVue.getCell(rowIndex, colIndex);

        displayVue.setCellText(cellUI, cell.getValue());
      });
    });
    displayVue.setH4(`Next Player: ${nextPlayer}`);
  };

  //back step for a move
  const backStep = () => {
    if (Game.backStep()) {
      fillGameboard(Gameboard.getGameboard(), Game.getNextPlayer());
    } else {
      alert("You can't go back more");
    }
  };

  const reset = () => {
    Gameboard.resetGameboard();
    displayVue.resetGameboard(Game.getNextPlayer());
  };

  return { reset, backStep };
})();
