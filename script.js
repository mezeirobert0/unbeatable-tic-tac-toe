// Knuth shuffle function
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

function showSelectionArea() {
    var selectionArea = document.getElementById("selection-area");
    selectionArea.style.display = "block";
}

function showPlayArea() {
    var playArea = document.getElementById("play-area");
    playArea.style.display = "flex";
}

// function to prevent the player from making a move while the bot's "thinking"
function changeBoardAccess(access) {
    var board = document.getElementById("board");
    board.style.pointerEvents = access;
}

// function for displaying the move
function putOnBoard(index) {
    var space = document.getElementById(`space-${index}`);
    space.innerHTML = `<img src=\"icons/${game.currentState.turn}.svg\">`
    game.currentState.put(index);
    
    // make spot inaccessible
    space.style.pointerEvents = "none";
}

// function for resetting the board on the screen
function resetGame() {
    changeBoardAccess('auto');

    for (let i = 0; i < 9; i++) {
        document.getElementById(`space-${i}`).innerHTML = '';
        document.getElementById(`space-${i}`).style.pointerEvents = 'inherit';
    }

    document.getElementById("message").innerHTML = '';
}

// moving selection area after the board and message, for when the player wants to play again
function moveSelectionArea() {
    var selectionArea = document.getElementById("selection-area");
    var rootDiv = document.getElementById("root");

    rootDiv.appendChild(selectionArea);
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

        // intializing the value of the state depending on the turn
        let value = this.turn === 'x' ? -1000 : 1000;

        let emptySpaces = this.getEmptySpaces();
        shuffleArray(emptySpaces); // shuffling array in order to make the Bot's moves less predictable

        // loop that goes through each available moves
        for (let index of emptySpaces) {
            let nextState = new State();
            nextState.assign(this);
            nextState.put(index);
            
            // recursive call; X is the maximizing player, so it wants the state with the highest score
            //                 O is the minimizing player, so it will choose the state with the least score
            value = this.turn === 'x' ? Math.max(value, nextState.minimax()) : Math.min(value, nextState.minimax());
        }

        return value;
    }

    // function for getting the index of the spot which would make for the next best move
    this.getNextBestMove = function () {
        let bestIndex = undefined;

        // intializing the best value depending on the turn
        let bestValue = this.turn === 'x' ? -1000 : 1000;

        let emptySpaces = this.getEmptySpaces();
        shuffleArray(emptySpaces); //  shuffling array (again) in order to make the Bot's moves less predictable

        // loop that goes through each available moves
        for (let index of emptySpaces) {
            let nextState = new State();
            nextState.assign(this);
            nextState.put(index);

            // getting the value of each of the next possible states
            let value = nextState.minimax();
            
            // X will choose the move which yields the state with the highest value
            if (this.turn === 'x' && value > bestValue) {
                bestValue = value;
                bestIndex = index;
            }

            // X will choose the move which yields the state with the minimum value
            else if (this.turn === 'o' && value < bestValue) {
                bestValue = value;
                bestIndex = index;
            }
        }

        return bestIndex;
    }
}

let Game = function () {
    this.currentState = undefined;
    this.playerSymbol = '';
    this.botSymbol = '';
    this.timesPlayed = 0;

    // function for setting up the player's and the bot's symbols
    this.startGame = function (playerSymbol) {
        this.playerSymbol = playerSymbol;
        this.botSymbol = this.playerSymbol === 'x' ? 'o' : 'x';
    }
}

// the instance of Game used by the script
let game = new Game();

// Get the buttons
let selectXButton = document.getElementById('select-x');
let selectOButton = document.getElementById('select-o');

// Add event listeners for the player symbol selectors
selectXButton.addEventListener('click', function () {
    hideSelectionArea();

    game.timesPlayed++;
    // some actions that only need to be executed once
    if (game.timesPlayed === 1) {
        document.getElementById('welcome-message').style.display = 'none'; // we don't need the welcome message anymore
        showPlayArea();
        moveSelectionArea();
    }

    resetGame(); // emptying the board and making spaces accessible
    game.currentState = new State();
    game.startGame('x'); // player's symbol is X
    
    changeBoardAccess("auto");
});

selectOButton.addEventListener('click', function () {
    hideSelectionArea();

    game.timesPlayed++;
    // some actions that only need to be executed once
    if (game.timesPlayed === 1) {
        document.getElementById('welcome-message').style.display = 'none'; // we don't need the welcome message anymore
        showPlayArea();
        moveSelectionArea();
    }

    resetGame(); // emptying the board and making spaces accessible
    game.currentState = new State();
    game.startGame('o'); // player's symbol is X
    
    changeBoardAccess("none"); // board is now disabled for the player

    setTimeout(function () {
        putOnBoard(game.currentState.getNextBestMove());
        changeBoardAccess("auto"); // board is now accessible again
    }, 1000);
});

// event listeners for all spaces of the board
// player makes the move first (on successful click) and then the bot follows
document.querySelectorAll('td').forEach(function (space) { 
    space.addEventListener('click', function () {
        let index = this.id;
        index = Number(index.slice(-1));

        putOnBoard(index); // player's move

        // checking for a result
        if (game.currentState.result !== 'none') {
            let message = document.getElementById("message");

            if (game.currentState.result === game.botSymbol)
                message.innerHTML = "Bot wins!";

            else if (game.currentState.result === game.playerSymbol)
                message.innerHTML = "Player wins!";

            else message.innerHTML = "It's a draw!";

            showSelectionArea(); // enable the user to play again
            document.getElementById("selection-prompt").innerHTML = 'Play again as:';
        }

        // now time for the bot's move
        else {
            changeBoardAccess("none"); // board is now disabled for the player

            // setting a 1 second delay to simulate the bot's thinking
            setTimeout(function () {
                putOnBoard(game.currentState.getNextBestMove()); // bot's move

                if (game.currentState.result !== 'none') {
                    let message = document.getElementById("message");

                    if (game.currentState.result === game.botSymbol)
                        message.innerHTML = "Bot wins!";

                    else if (game.currentState.result === game.playerSymbol)
                        message.innerHTML = "Player wins!";

                    else message.innerHTML = "It's a draw!";

                    showSelectionArea(); // enable the user to play again
                    document.getElementById("selection-prompt").innerHTML = 'Play again as:';
                }

                else changeBoardAccess("auto"); // board is accessible again
            }, 1000);
        }
    });
});