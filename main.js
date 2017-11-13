const symbols = document.querySelector('#symbol-select');
const gameField = document.querySelector('#cells');
let playerSymbol = '';
let computerSymbol = '';
let opening = '';
let lastMoveSymbol = '';
let winner = '';
let moves = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const combinations = [[0, 1, 2], [3, 4, 5], [6, 7, 8],
                      [0, 3, 6], [1, 4, 7], [2, 5, 8],
                      [0, 4, 8], [2, 4, 6]];

const markCell = function markCell(target, symbol) {
  if (lastMoveSymbol !== symbol
  && /\d/.test(moves[target])) {
    const cellToMark = document.querySelector(`#c${target}`);
    cellToMark.innerHTML = `<span>${symbol}</span>`;
    moves[target] = symbol;
    lastMoveSymbol = symbol;
  }
};

const randomSelect = function randomSelect(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
};

// strategy for the following function from here https://en.wikipedia.org/wiki/Tic-tac-toe#Strategy
const computerMove = function computerMove() {
  const corners = [0, 2, 6, 8];
  const cornerPairs = [[0, 8], [2, 6]];
  const edges = [1, 3, 5, 7];
  const edgePairs = [[1, 3], [1, 5], [3, 7], [5, 7]];
  const center = 4;
  const targetCorner = randomSelect(randomSelect(cornerPairs));

  // Opening
  if (computerSymbol === 'X'
  && moves.indexOf(computerSymbol) < 0
  && !opening) {
    markCell(targetCorner, computerSymbol);
    opening = 'done';
    return;
  } else if (moves.indexOf(playerSymbol) >= 0
  && moves.indexOf(playerSymbol, moves.indexOf(playerSymbol) + 1) === -1
  && !opening) {
    const firstX = moves.indexOf('X');
    if (firstX === center) {
      markCell(targetCorner, computerSymbol);
    } else if (corners.indexOf(firstX) >= 0) {
      markCell(center, computerSymbol);
    } else {
      markCell(center, computerSymbol);
    }
    opening = 'done';
  }
  if (opening && !winner) {

    // Win
    for (let three of combinations) {
      let [x, y, z] = three;
      let line = [moves[x], moves[y], moves[z]].filter((el, ind, arr) => {
        return ind === arr.indexOf(el);
      });
      let re = new RegExp(`^\\d,${computerSymbol}$`);
      if (re.test(line.sort().toString())) {
        markCell(line.sort().toString().match(/\d/)[0], computerSymbol);
      }
    }

    // Block
    for (let three of combinations) {
      let [x, y, z] = three;
      let line = [moves[x], moves[y], moves[z]].filter((el, ind, arr) => {
        return ind === arr.indexOf(el);
      });
      let re = new RegExp(`^\\d,${playerSymbol}$`);
      if (re.test(line.sort().toString())) {
        markCell(line.sort().toString().match(/\d/)[0], computerSymbol);
      }
    }

    // Fork
    for (let two of cornerPairs) {
      let [x, y] = two;
      let oppositCorners = [moves[x], moves[y]].filter((el) => {
        return el !== computerSymbol;
      });
      if (oppositCorners.length === 1 && /\d/.test(oppositCorners)) {
        markCell(oppositCorners[0], computerSymbol);
      }
    }
    for (const two of edgePairs) {
      let [x, y] = two;
      if (moves[x] === moves[y]
      && moves[x] === playerSymbol) {
        for (const [ind, pair] of edgePairs.entries()) {
          if (pair.indexOf(x) >= 0
          && pair.indexOf(y) >= 0) {
            markCell(corners[ind], computerSymbol);
          }
        }
      }
    }

    // Blocking an opponent's fork
    for (let three of combinations.slice(-2)) {
      let [x, y, z] = three;
      let oneInLine = [moves[x], moves[y], moves[z]];
      let re = new RegExp(`^${computerSymbol},${playerSymbol},${playerSymbol}$`);
      if (re.test(oneInLine.sort().toString())
      && moves[y] === playerSymbol) {
        const ind = trio[oneInLine.indexOf(`${computerSymbol}`)];
        if (cornerPairs[0].indexOf(ind) >= 0) {
          const corner = randomSelect(cornerPairs[1]);
          if (/\d/.test(moves[corner])) {
            markCell(corner, computerSymbol);
          }
        } else if (cornerPairs[1].indexOf(ind) >= 0) {
          const corner = randomSelect(cornerPairs[0]);
          if (/\d/.test(moves[corner])) {
            markCell(randomSelect(cornerPairs[0]), computerSymbol);
          }
        }
      }
    }

    // Empty side
    for (const cell of edges) {
      if (/\d/.test(moves[cell])) {
        markCell(cell, computerSymbol);
      }
    }
  }
  winDetector();
};

const chooseSymbol = function chooseSymbol(e) {
  if (e.target !== e.currentTarget) {
    const choice = e.target.textContent;
    e.target.style.backgroundColor = 'grey';
    playerSymbol = (choice === 'X') ? 'X' : 'O';
    computerSymbol = (playerSymbol === 'X') ? 'O' : 'X';
    symbols.removeEventListener('click', chooseSymbol, false);
  }
  e.stopPropagation();
  computerMove();
};

const resetGame = function resetGame() {
  playerSymbol = '';
  computerSymbol = '';
  opening = '';
  lastMoveSymbol = '';
  winner = '';
  moves = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  for (const child of gameField.children) {
    child.style = 'none';
    child.innerHTML = '<span></span>';
  }
  for (const symbol of symbols.children) {
    symbol.style.backgroundColor = '';
  }
  symbols.addEventListener('click', chooseSymbol, false);
};

const winDetector = function winDetector() {
  for (const three of combinations) {
    const [x, y, z] = three;
    if ((moves[x] === moves[y]) && (moves[y] === moves[z])) {
      winner = moves[x];
      // change background for the winning line
      for (const child of gameField.children) {
        if ((+child.id[1] === x) || (+child.id[1] === y) || (+child.id[1] === z))
          child.style.backgroundColor = 'red';
        $('.cell').css('pointer-events', 'none')
      }
      break;
    }
  }
  if (winner || !/\d/.test(moves.toString())) {
    setTimeout(resetGame, 3000);
  }
};

const playerMove = function playerMove(e) {
  if ((e.target !== e.currentTarget)
  && /\d/.test(moves[e.target.id[1]])
  && playerSymbol) {
    markCell(e.target.id[1], playerSymbol);
  }
  e.stopPropagation();
  winDetector();
  computerMove();
};

symbols.addEventListener('click', chooseSymbol, false);
gameField.addEventListener('click', playerMove, false);
