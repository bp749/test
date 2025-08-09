export class BackgammonGame {
    constructor(ui) {
        this.ui = ui;
        this.board = new Array(25).fill(null).map(() => ({ color: null, count: 0 }));
        this.bar = { white: 0, black: 0 };
        this.home = { white: 0, black: 0 };
        this.currentPlayer = 'white';
        this.dice = [];
        this.movesLeft = [];
        this.selectedPoint = null;
        this.gameActive = true;
        this.doublingCubeValue = 1;
        this.doublingCubeOwner = null;
        this.doublingOffered = false;

        this.initializeBoard();
        this.setupEventListeners();
        this.render();
    }

    initializeBoard() {
        this.board[1] = { color: 'white', count: 2 };
        this.board[6] = { color: 'black', count: 5 };
        this.board[8] = { color: 'black', count: 3 };
        this.board[12] = { color: 'white', count: 5 };
        this.board[13] = { color: 'black', count: 5 };
        this.board[17] = { color: 'white', count: 3 };
        this.board[19] = { color: 'white', count: 5 };
        this.board[24] = { color: 'black', count: 2 };
    }

    setupEventListeners() {
        document.getElementById('roll-dice').addEventListener('click', () => this.rollDice());
        document.getElementById('new-game').addEventListener('click', () => this.resetGame());
        document.getElementById('double-btn').addEventListener('click', () => this.offerDouble());

        document.querySelectorAll('.point').forEach(point => {
            point.addEventListener('click', (e) => this.handlePointClick(e));
        });

        document.getElementById('bar').addEventListener('click', (e) => this.handleBarClick(e));
    }

    rollDice() {
        if (this.dice.length > 0 || !this.gameActive || this.doublingOffered) return;

        const die1 = Math.floor(Math.random() * 6) + 1;
        const die2 = Math.floor(Math.random() * 6) + 1;

        this.dice = [die1, die2];

        if (die1 === die2) {
            this.movesLeft = [die1, die1, die1, die1];
        } else {
            this.movesLeft = [die1, die2];
        }

        this.ui.updateDice(this.dice);
        this.ui.updateMovesDisplay(this.movesLeft);
        this.checkAvailableMoves();
    }

    handlePointClick(e) {
        const pointElement = e.currentTarget;
        const point = parseInt(pointElement.dataset.point);

        if (this.selectedPoint === null) {
            if (this.canSelectPoint(point)) {
                this.selectPoint(point);
            }
        } else {
            if (this.canMoveTo(this.selectedPoint, point)) {
                this.makeMove(this.selectedPoint, point);
            } else if (this.canSelectPoint(point)) {
                this.selectPoint(point);
            } else {
                this.ui.clearSelection();
                this.selectedPoint = null;
            }
        }
    }

    handleBarClick(e) {
        if (this.bar[this.currentPlayer] > 0 && this.selectedPoint === null) {
            this.selectedPoint = 'bar';
            this.ui.highlightPossibleMoves(this.movesLeft, this.selectedPoint, this.currentPlayer);
        }
    }

    canSelectPoint(point) {
        if (this.movesLeft.length === 0) return false;

        if (this.bar[this.currentPlayer] > 0) {
            return false;
        }

        const pointData = this.board[point];
        return pointData.color === this.currentPlayer && pointData.count > 0;
    }

    selectPoint(point) {
        this.ui.clearSelection();
        this.selectedPoint = point;

        if (point !== 'bar') {
            document.querySelector(`[data-point="${point}"]`).classList.add('selected');
        }

        this.ui.highlightPossibleMoves(this.movesLeft, this.selectedPoint, this.currentPlayer);
    }

    canMoveTo(from, to) {
        if (this.movesLeft.length === 0) return false;

        const distance = Math.abs(to - from);

        if (from === 'bar') {
            const expectedPoint = this.currentPlayer === 'white' ? to : 25 - to;
            return this.movesLeft.includes(expectedPoint) && this.isValidMove(from, to);
        }

        return this.movesLeft.includes(distance) && this.isValidMove(from, to);
    }

    isValidMove(from, to) {
        if (this.bar[this.currentPlayer] > 0 && from !== 'bar') {
            return false;
        }

        if (from === 'bar') {
            const homeBoard = this.currentPlayer === 'white' ? [1, 2, 3, 4, 5, 6] : [19, 20, 21, 22, 23, 24];
            if (!homeBoard.includes(to)) return false;
        }

        if (to < 1 || to > 24) {
            if (this.canBearOff()) {
                return this.isValidBearOff(from, to);
            }
            return false;
        }

        const targetPoint = this.board[to];
        if (targetPoint.color && targetPoint.color !== this.currentPlayer && targetPoint.count > 1) {
            return false;
        }

        const direction = this.currentPlayer === 'white' ? 1 : -1;
        const moveDirection = (to - from) * direction;

        return from !== 'bar' ? moveDirection > 0 : true;
    }

    canBearOff() {
        const homeBoard = this.currentPlayer === 'white' ? [19, 20, 21, 22, 23, 24] : [1, 2, 3, 4, 5, 6];

        if (this.bar[this.currentPlayer] > 0) return false;

        for (let i = 1; i <= 24; i++) {
            if (!homeBoard.includes(i) && this.board[i].color === this.currentPlayer && this.board[i].count > 0) {
                return false;
            }
        }

        return true;
    }

    isValidBearOff(from, to) {
        if (!this.canBearOff()) return false;

        const homeBoard = this.currentPlayer === 'white' ? [19, 20, 21, 22, 23, 24] : [1, 2, 3, 4, 5, 6];
        if (!homeBoard.includes(from)) return false;

        const exactDistance = this.currentPlayer === 'white' ? 25 - from : from;

        if (this.movesLeft.includes(exactDistance)) {
            return true;
        }

        const higherDice = Math.max(...this.movesLeft);
        if (higherDice > exactDistance) {
            const furthestPoint = this.currentPlayer === 'white'
                ? Math.max(...homeBoard.filter(p => this.board[p].color === this.currentPlayer && this.board[p].count > 0))
                : Math.min(...homeBoard.filter(p => this.board[p].color === this.currentPlayer && this.board[p].count > 0));

            return from === furthestPoint;
        }

        return false;
    }

    async makeMove(from, to) {
        const fromElement = from === 'bar'
            ? document.getElementById(`bar-${this.currentPlayer}`)
            : document.querySelector(`[data-point="${from}"]`);

        const checkerToMove = fromElement.querySelector(`.checker.${this.currentPlayer}`);

        if (checkerToMove) {
            await this.ui.animateChecker(checkerToMove, from, to, this.currentPlayer);
        }

        if (from === 'bar') {
            this.bar[this.currentPlayer]--;
        } else {
            this.board[from].count--;
            if (this.board[from].count === 0) {
                this.board[from].color = null;
            }
        }

        if (to > 24 || to < 1) {
            this.home[this.currentPlayer]++;
        } else {
            if (this.board[to].color && this.board[to].color !== this.currentPlayer && this.board[to].count === 1) {
                this.bar[this.board[to].color]++;
                this.board[to].color = this.currentPlayer;
                this.board[to].count = 1;
            } else {
                this.board[to].color = this.currentPlayer;
                this.board[to].count++;
            }
        }

        const moveDistance = from === 'bar'
            ? (this.currentPlayer === 'white' ? to : 25 - to)
            : Math.abs(to - from);

        const moveIndex = this.movesLeft.indexOf(moveDistance);
        if (moveIndex === -1 && this.canBearOff()) {
            const exactDistance = this.currentPlayer === 'white' ? 25 - from : from;
            const higherDice = this.movesLeft.find(d => d >= exactDistance);
            const index = this.movesLeft.indexOf(higherDice);
            if (index !== -1) {
                this.movesLeft.splice(index, 1);
            }
        } else if (moveIndex !== -1) {
            this.movesLeft.splice(moveIndex, 1);
        }

        this.ui.clearSelection();
        this.selectedPoint = null;
        this.render();
        this.ui.updateMovesDisplay(this.movesLeft);

        if (this.movesLeft.length === 0) {
            this.endTurn();
        } else {
            this.checkAvailableMoves();
        }

        this.checkWinCondition();
    }

    offerDouble() {
        if (this.doublingCubeOwner && this.doublingCubeOwner !== this.currentPlayer) {
            this.ui.showMessage("You don't own the cube.");
            return;
        }
        if (this.dice.length > 0) {
            this.ui.showMessage("Cannot double after rolling.");
            return;
        }

        this.doublingOffered = true;
        const opponent = this.currentPlayer === 'white' ? 'Black' : 'White';
        this.ui.showMessage(`${opponent}, do you accept the double?`, true);

        setTimeout(() => this.handleDoubleResponse(confirm(`${opponent}, accept the double to ${this.doublingCubeValue * 2}?`)), 100);
    }

    handleDoubleResponse(accepted) {
        if (accepted) {
            this.doublingCubeValue *= 2;
            this.doublingCubeOwner = this.currentPlayer === 'white' ? 'black' : 'white';
            this.doublingOffered = false;
            this.ui.showMessage(`Double accepted. Cube is at ${this.doublingCubeValue}.`);
            this.ui.updateDoublingCubeDisplay(this.doublingCubeValue, this.doublingCubeOwner, this.doublingOffered, this.currentPlayer);
            this.endTurn();
        } else {
            this.gameActive = false;
            this.ui.showMessage(`${this.currentPlayer} wins ${this.doublingCubeValue} point(s).`, true);
        }
    }

    checkAvailableMoves() {
        let hasAvailableMoves = false;

        if (this.bar[this.currentPlayer] > 0) {
            for (let move of this.movesLeft) {
                const targetPoint = this.currentPlayer === 'white' ? move : 25 - move;
                if (this.isValidMove('bar', targetPoint)) {
                    hasAvailableMoves = true;
                    break;
                }
            }
        } else {
            for (let from = 1; from <= 24; from++) {
                if (this.board[from].color === this.currentPlayer && this.board[from].count > 0) {
                    for (let move of this.movesLeft) {
                        const to = this.currentPlayer === 'white' ? from + move : from - move;
                        if (this.isValidMove(from, to)) {
                            hasAvailableMoves = true;
                            break;
                        }
                    }
                    if (hasAvailableMoves) break;
                }
            }
        }

        if (!hasAvailableMoves && this.movesLeft.length > 0) {
            this.ui.showMessage(`No available moves. Skipping remaining dice.`);
            setTimeout(() => this.endTurn(), 2000);
        }
    }

    endTurn() {
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.dice = [];
        this.movesLeft = [];
        this.selectedPoint = null;
        this.doublingOffered = false;

        this.ui.updateCurrentPlayer(this.currentPlayer);
        this.ui.updateDice(this.dice);
        this.ui.updateMovesDisplay(this.movesLeft);
        this.ui.updateDoublingCubeDisplay(this.doublingCubeValue, this.doublingCubeOwner, this.doublingOffered, this.currentPlayer);
        this.ui.clearSelection();
    }

    checkWinCondition() {
        if (this.home.white === 15) {
            this.gameActive = false;
            this.ui.showMessage(`White wins ${this.doublingCubeValue} point(s)!`, true);
            document.getElementById('roll-dice').disabled = true;
        } else if (this.home.black === 15) {
            this.gameActive = false;
            this.ui.showMessage(`Black wins ${this.doublingCubeValue} point(s)!`, true);
            document.getElementById('roll-dice').disabled = true;
        }
    }

    resetGame() {
        this.board = new Array(25).fill(null).map(() => ({ color: null, count: 0 }));
        this.bar = { white: 0, black: 0 };
        this.home = { white: 0, black: 0 };
        this.currentPlayer = 'white';
        this.dice = [];
        this.movesLeft = [];
        this.selectedPoint = null;
        this.gameActive = true;
        this.doublingCubeValue = 1;
        this.doublingCubeOwner = null;
        this.doublingOffered = false;

        this.initializeBoard();
        this.render();

        this.ui.updateCurrentPlayer(this.currentPlayer);
        this.ui.updateDice(this.dice);
        this.ui.showMessage('Roll the dice to start!', true);
        this.ui.updateMovesDisplay(this.movesLeft);
        this.ui.updateDoublingCubeDisplay(this.doublingCubeValue, this.doublingCubeOwner, this.doublingOffered, this.currentPlayer);
        this.ui.clearSelection();
    }

    render() {
        this.ui.render(this.board, this.bar, this.home, this.currentPlayer);
        this.ui.updateDoublingCubeDisplay(this.doublingCubeValue, this.doublingCubeOwner, this.doublingOffered, this.currentPlayer);
    }
}
