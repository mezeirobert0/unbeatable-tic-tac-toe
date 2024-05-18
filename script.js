function shuffleArray(arr) {
    for(let i = arr.length-1; i > 0; i--){
        let j = Math.floor(Math.random() * (i+1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function hideSelectionArea() {
    var selectionArea = document.getElementById("selection-area");
    selectionArea.style.display = "none";
}

function showPlayArea() {
    var playArea = document.getElementById("play-area");
    playArea.style.display = "block";
}

function showSelectionArea() {
    var selectionArea = document.getElementById("selection-area");
    selectionArea.style.display = "block";
}

function hideMessageArea() {
    var messageArea = document.getElementById("message-area");
    messageArea.style.display = "none";
    document.getElementById("message").innerHTML = "";
}

function changeBoardAccess(access) {
    var board = document.getElementById("board");
    board.style.pointerEvents = access;
}

// function for displaying the move
function putOnBoard(index) {
    var x = document.getElementById(`space-${index}`);
    x.innerHTML = `<img src=\"icons/${game.currentState.turn}.svg\">`
    game.currentState.put(index);
    
    // make spot inaccessible
    x.style.pointerEvents = "none";
}

let State = function () {

    // initializing an empty board
    this.board = [0, 0, 0, 0, 0, 0, 0, 0, 0];

    // X makes the first move
    this.turn = 'x';

    // the state can be imagined as being part of the game tree;
    // the depth represents essentially the number of total moves
    this.depth = 0;

    // result can be:
    // 'x' if X has won
    // 'o' if O has won
    // 'draw'
    // 'none' if no one has won yet, nor is it a draw
    this.result = 'none';


    // assignment operation function, where other is a State object
    // copies all attributes of other
    this.assign = function (other) {
        for (let i = 0; i < 9; i++)
            this.board[i] = other.board[i];

        this.turn = other.turn;

        this.depth = other.depth;

        this.result = other.result;
    }

    // function to return indexes of empty spots on the board
    this.getEmptySpaces = function () {
        let emptySpaces = [];
        for (let i = 0; i < 9; i++)
            if (this.board[i] === 0)
                emptySpaces.push(i);

        return emptySpaces;
    }

    // for debugging purposes
    this.printBoard = function () {
        console.log(this.board[0], this.board[1], this.board[2]);
        console.log(this.board[3], this.board[4], this.board[5]);
        console.log(this.board[6], this.board[7], this.board[8]);
        console.log(this.result);
    }

    // function that applies the move and checks if someone has won or if it's a draw
    this.put = function (index) {
        this.board[index] = this.turn;
        this.depth++;

        // checking horizontally
        for (let i = 0; i <= 6; i += 3)
            if (this.board[i] === this.board[i + 1] && this.board[i + 1] === this.board[i + 2] && this.board[i] !== 0) {
                this.result = this.turn;
                return;
            }

        // checking vertically
        for (let i = 0; i < 3; i++)
            if (this.board[i] === this.board[i + 3] && this.board[i + 3] === this.board[i + 6] && this.board[i] !== 0) {
                this.result = this.turn;
                return;
            }

        // checking first diagonal
        if (this.board[0] === this.board[4] && this.board[4] === this.board[8] && this.board[0] !== 0) {
            this.result = this.turn;
            return;
        }

        // checking second diagonal
        if (this.board[2] === this.board[4] && this.board[4] === this.board[6] && this.board[2] !== 0) {
            this.result = this.turn;
            return;
        }

        // if the function hasn't returned anything yet and if the depth is 9,
        // it means all spots are occupied and there is no winner,
        // so it's a draw;
        if (this.depth === 9) {
            this.result = 'draw';
            return;
        }

        // here the state isn't a terminal one
        // so change the turn
        this.turn = this.turn === 'x' ? 'o' : 'x';
    }

    // minimax function to return the value of the current state
    this.minimax = function () {
        // cases for terminal states
        if (this.result === 'x')
            return 10 - this.depth;

        if (this.result === 'o')
            return -10 + this.depth;

        if (this.result === 'draw')
            return 0;

        let value = this.turn === 'x' ? -1000 : 1000;
        let emptySpaces = this.getEmptySpaces();
        shuffleArray(emptySpaces);

        for (let index of emptySpaces) {
            let nextState = new State();
            nextState.assign(this);
            nextState.put(index);

            value = this.turn === 'x' ? Math.max(value, nextState.minimax()) : Math.min(value, nextState.minimax());
        }

        return value;
    }

    this.getNextBestMove = function () {
        let bestIndex = undefined;
        let bestValue = this.turn === 'x' ? -1000 : 1000;
        let emptySpaces = this.getEmptySpaces();
        shuffleArray(emptySpaces);

        for (let index of emptySpaces) {
            let nextState = new State();
            nextState.assign(this);
            nextState.put(index);
            let value = nextState.minimax();

            if (this.turn === 'x') {
                if (value > bestValue) {
                    bestValue = value;
                    bestIndex = index;
                }
            }

            else {
                if (value < bestValue) {
                    bestValue = value;
                    bestIndex = index;
                }
            }
        }

        return bestIndex;
    }
}

let Game = function () {
    this.currentState = new State();
    this.playerSymbol = '';
    this.botSymbol = '';

    this.startGame = function (playerSymbol) {
        this.playerSymbol = playerSymbol;
        this.botSymbol = this.playerSymbol === 'x' ? 'o' : 'x';
    }
}

let game = new Game();

// Get the buttons
let selectXButton = document.getElementById('select-x');
let selectOButton = document.getElementById('select-o');

// Add event listeners for the player symbol selectors
selectXButton.addEventListener('click', function () {
    game.startGame('x');
    changeBoardAccess("auto");
});

selectOButton.addEventListener('click', function () {
    changeBoardAccess("none"); // board in now disabled for the player
    game.startGame('o');

    setTimeout(function () {
        putOnBoard(game.currentState.getNextBestMove());
        changeBoardAccess("auto"); // board is now accessible again
    }, 1000);
});

document.querySelectorAll('td').forEach(function (space) { 
    space.addEventListener('click', function () {
        let index = this.id;
        index = Number(index.slice(-1));

        putOnBoard(index);

        if (game.currentState.result !== 'none') {
            if (game.currentState.result === game.botSymbol)
                document.getElementById("message").innerHTML = "Bot wins!";

            else if (game.currentState.result === game.playerSymbol)
                document.getElementById("message").innerHTML = "Player wins!";

            else document.getElementById("message").innerHTML = "It's a draw!";
        }

        // now time for the bot's move
        else {
            changeBoardAccess("none");
            setTimeout(function () {
                putOnBoard(game.currentState.getNextBestMove());

                if (game.currentState.result !== 'none') {
                    if (game.currentState.result === game.botSymbol)
                        document.getElementById("message").innerHTML = "Bot wins!";

                    else if (game.currentState.result === game.playerSymbol)
                        document.getElementById("message").innerHTML = "Player wins!";

                    else document.getElementById("message").innerHTML = "It's a draw!";
                }

                else changeBoardAccess("auto");
            }, 1000);
        }
    });
});