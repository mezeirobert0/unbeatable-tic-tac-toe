function hideSelectionArea() {
    var x = document.getElementById("selection-area");
    x.style.display = "none";
}

function showPlayArea() {
    var x = document.getElementById("play-area");
    x.style.display = "block";
}

// function for displaying the move
function putOnBoard(index) {
    document.getElementById(`space-${index}`).innerHTML = `<img src=\"icons/${game.currentState.turn}.svg\">`
    game.currentState.put(index);
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

    // function that applies the move and checks if someone has won or if it's a draw
    this.put = function (index) {
        this.board[index] = this.turn;
        this.depth++;

        // checking if the state is a terminal one after each move

        // checking horizontally
        for (let i = 0; i < 6; i += 3)
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

        if (this.turn === 'x') {
            let value = -1000;
            let emptySpaces = this.getEmptySpaces();
            for (let index of emptySpaces) {
                let nextState = new State();
                nextState.assign(this);
                nextState.put(index);
                value = Math.max(value, nextState.minimax())
            }

            return value;
        }

        if (this.turn === 'o') {
            let value = 1000;
            let emptySpaces = this.getEmptySpaces();
            for (let index of emptySpaces) {
                let nextState = new State();
                nextState.assign(this);
                nextState.put(index);
                value = Math.min(value, nextState.minimax())
            }

            return value;
        }
    }

    this.getNextBestMove = function () {
        let bestIndex = undefined;
        let bestValue = this.turn === 'x' ? -1000 : 1000;
        let emptySpots = this.getEmptySpaces();

        for (let index of emptySpots) {
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
});

selectOButton.addEventListener('click', function () {
    game.startGame('o');
    setTimeout(function () {
        putOnBoard(game.currentState.getNextBestMove());
    }, 1000);
});

document.querySelectorAll('.space').forEach(function(space) {
    space.addEventListener('click', function () {
        let index = this.id;
        index = Number(index.slice(-1));

        if (game.currentState.turn === game.playerSymbol) {
            putOnBoard(index);
        }

        if (game.currentState.result !== 'none') {
            if (game.currentState.result === game.botSymbol)
                document.getElementById("message").innerHTML = "Bot wins!";
        
            else if (game.currentState.result === game.playerSymbol)
                document.getElementById("message").innerHTML = "Player wins!";
        
            else document.getElementById("message").innerHTML = "It's a draw!";
        }

        // now time for the bot's move
        else {
            setTimeout(function () {
                putOnBoard(game.currentState.getNextBestMove());
            }, 1000);

            if (game.currentState.result !== 'none') {
                if (game.currentState.result === game.botSymbol)
                    document.getElementById("message").innerHTML = "Bot wins!";
            
                else if (game.currentState.result === game.playerSymbol)
                    document.getElementById("message").innerHTML = "Player wins!";
            
                else document.getElementById("message").innerHTML = "It's a draw!";
            }
        }
    });
});
