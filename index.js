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
    console.log();
  };

  const resetGameboard = () => {
    gameboard = createGameboard(3, 3);
    Game.resetPlayers();
    counterMoves = 0;
  };

  return {
    resetGameboard,
    getCellGenral,
    printGameboard,
    roundStatus,
    getGameboard,
    setNewPlay,
  };
})();

const Game = (() => {
  let currentPlayer = createHumanPlayer(cellType.x);
  let nextPlayer = createHumanPlayer(cellType.o);

  const resetPlayers = () => {
    currentPlayer = createHumanPlayer(cellType.x);
    nextPlayer = createHumanPlayer(cellType.o);
  };

  const getLastPlayValue = () => {
    return nextPlayer.getType();
  };

  const getNextPlayer = () => {
    return currentPlayer.getType();
  };

  const switchPlayers = () => {
    const temp = currentPlayer;
    currentPlayer = nextPlayer;
    nextPlayer = temp;
  };

  const play = (row, col) => {
    if (currentPlayer.nextPlay(row, col)) {
      const roundStatus = Gameboard.roundStatus(row, col);
      Gameboard.printGameboard();
      switchPlayers();
      return roundStatus;
    }
  };

  return { resetPlayers, play, getLastPlayValue, getNextPlayer };
})();

const displayController = (() => {
  const gameboardUI = document.getElementById("gameboard");
  const main = document.querySelector("main");
  const dialoge = document.createElement("dialog");
  const h4 = document.createElement("h4");

  main.appendChild(h4);

  const createCell = (row, col) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.setAttribute("data-row", row);
    cell.setAttribute("data-col", col);
    return cell;
  };

  const setH4 = (text) => {
    h4.textContent = text;
  };

  const addEventListeners = () => {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => {
      cell.addEventListener("click", (e) => {
        const row = parseInt(e.target.getAttribute("data-row"));
        const col = parseInt(e.target.getAttribute("data-col"));
        const roundStatus = Game.play(row, col);
        e.target.textContent = Gameboard.getCellGenral(row, col);
        if (roundStatus === "winner") {
          createDialoge({
            roundStatus,
            winnerType: Game.getLastPlayValue(),
          });
        } else if (roundStatus === "draw") {
          createDialoge({ roundStatus });
        } else if (roundStatus === "continue") {
          setH4(`Next Player: ${Game.getNextPlayer()}`);
        }
      });
    });
  };

  const createDialoge = ({ roundStatus, winnerType }) => {
    // create dialoge in the main
    dialoge.classList.add("dialoge");

    // create a div in the dialoge
    const dialogContent = document.createElement("div");
    dialogContent.classList.add("container");
    dialoge.appendChild(dialogContent);

    // create a h3 in the div
    const roundStatusDiv = document.createElement("h3");
    dialogContent.appendChild(roundStatusDiv);

    // create a button in the div
    const newGameButton = document.createElement("button");
    newGameButton.textContent = "Start New Game";
    dialogContent.appendChild(newGameButton);
    newGameButton.addEventListener("click", reset);
    // set the text of the h3
    if (roundStatus === "draw") roundStatusDiv.textContent = "Draw";
    else roundStatusDiv.textContent = `The winner is ${winnerType}`;
    main.appendChild(dialoge);
  };

  const fillCells = (board) => {
    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellElement = createCell(rowIndex, colIndex);
        gameboardUI.appendChild(cellElement);
      });
    });
  };

  const renderGameboard = () => {
    Gameboard.resetGameboard();
    fillCells(Gameboard.getGameboard());
    setH4(`First Player : ${Game.getNextPlayer()}`);
    addEventListeners();
  };

  const reset = () => {
    dialoge.remove();
    dialoge.innerHTML = "";
    gameboardUI.innerHTML = "";
    renderGameboard();
  };
  return { renderGameboard };
})();

displayController.renderGameboard();
