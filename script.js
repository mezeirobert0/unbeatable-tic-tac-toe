function hideSelectionArea()
{
    var x = document.getElementById("selection-area");
    x.style.display = "none";
}

function showPlayArea()
{
    var x = document.getElementById("play-area");
    x.style.display = "block";
}

function put0() {
    document.getElementById("space-0").innerHTML = '<img src="icons/o.svg">'
}

function put1() {
    document.getElementById("space-1").innerHTML = '<img src="icons/o.svg">'
}

function put2() {
    document.getElementById("space-2").innerHTML = '<img src="icons/o.svg">'
}

function put3() {
    document.getElementById("space-3").innerHTML = '<img src="icons/o.svg">'
}

function put4() {
    document.getElementById("space-4").innerHTML = '<img src="icons/o.svg">'
}

function put5() {
    document.getElementById("space-5").innerHTML = '<img src="icons/o.svg">'
}

function put6() {
    document.getElementById("space-6").innerHTML = '<img src="icons/o.svg">'
}

function put7() {
    document.getElementById("space-7").innerHTML = '<img src="icons/o.svg">'
}

function put8() {
    document.getElementById("space-8").innerHTML = '<img src="icons/o.svg">'
}

let State = function() {

    // initializing an empty board
    this.board = [0, 0, 0,
                  0, 0, 0,
                  0, 0, 0];

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

    // function to return indexes of empty spots on the board
   this.getEmptySpots = function() {
        let emptySpots = [];
        for (let i = 0; i < 9; i++)
            if (this.board[i] === 0)
                emptySpots.push(i);

        return emptySpots;
    }

    // function that applies the move and checks if someone has won or if it's a draw
    this.put = function(index) {
        this.board[index] = turn;
        this.depth++;

        // checking if the state is a terminal one

        // checking horizontally
        for (let i = 0; i < 6; i += 3)
            if (this.board[i] === this.board[i + 1] && this.board[i + 1] === this.board[i + 2] && this.board[i] !== 0) {
                this.result = turn;
                return;
            }

        // checking vertically
        for (let i = 0; i < 3; i++)
            if (this.board[i] === this.board[i + 3] && this.board[i + 3] === this.board[i + 6] && this.board[i] !== 0) {
                this.result = turn;
                return;
            }

        // checking first diagonal
        if (this.board[0] === this.board[4] && this.board[4] === this.board[8] && this.board[0] !== 0) {
            this.result = turn;
            return;
        }

        // checking second diagonal
        if (this.board[2] === this.board[4] && this.board[4] === this.board[6] && this.board[2] !== 0) {
            this.result = turn;
            return;
        }

        // if the function hasn't returned anything yet and if the depth is 9,
        // it means all spots are occupied and there is no winner,
        // so it's a draw;
        if (this.depth == 9) {
            this.result = 'draw';
            return;
        }

        // here the state isn't a terminal one
        this.turn = this.turn === 'x' ? 'o' : 'x';
    }

    // minimax function to return the value of the current state
    this.minimax = function() {
        // cases for terminal states
        if (this.result === 'x')
            return 10 - this.depth;

        if (this.result === 'o')
            return -10 + this.depth;

        if (this.result === 'draw')
            return 0;

        
        if (this.turn === 'x') {
            let value = -1000;
            emptySpots = this.getEmptySpots();
            for (let index in emptySpots) {
                let nextState = new State();
                nextState.put(index);
                value = Math.max(value, nextState.minimax())
            }
            return value;
        }

        if (this.turn === 'o') {
            let value = 1000;
            emptySpots = this.getEmptySpots();
            for (let index in emptySpots) {
                let nextState = new State();
                nextState.put(index);
                value = Math.min(value, nextState.minimax())
            }
            return value;
        }
    }
}

let Game = function (){
    this.currentState = new State();
    this.playerSymbol = '\0';
    this.botSymbol = '\0';

    this.runGame = function() {
        
    }

}