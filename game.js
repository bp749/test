class BackgammonGame {
    constructor() {
        this.ui = new UI(this);
        this.resetGame();
    }
    
    initializeBoard() {
        this.board = new Array(25).fill(null).map(() => ({ color: null, count: 0 }));
        this.bar = { white: 0, black: 0 };
        this.home = { white: 0, black: 0 };

        this.board[1] = { color: 'white', count: 2 };
        this.board[6] = { color: 'black', count: 5 };
        this.board[8] = { color: 'black', count: 3 };
        this.board[12] = { color: 'white', count: 5 };
        this.board[13] = { color: 'black', count: 5 };
        this.board[17] = { color: 'white', count: 3 };
        this.board[19] = { color: 'white', count: 5 };
        this.board[24] = { color: 'black', count: 2 };
    }
    
    rollDice() {
        if (this.dice.length > 0 || !this.gameActive) return;
        
        const die1 = Math.floor(Math.random() * 6) + 1;
        const die2 = Math.floor(Math.random() * 6) + 1;
        
        this.dice = [die1, die2];
        
        if (die1 === die2) {
            this.movesLeft = [die1, die1, die1, die1];
        } else {
            this.movesLeft = [die1, die2];
        }
        
        this.ui.updateDice();
        this.ui.setRollDiceButtonState(false);
        this.ui.updateMovesDisplay();
        
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
                this.clearSelection();
            }
        }
    }
    
    handleBarClick() {
        if (this.bar[this.currentPlayer] > 0 && this.selectedPoint === null) {
            this.selectPoint('bar');
        }
    }

    handleHomeClick(e) {
        if (this.selectedPoint === null || this.selectedPoint === 'bar') return;

        const player = e.currentTarget.dataset.player;
        if (player !== this.currentPlayer) return;

        const destination = this.currentPlayer === 'white' ? 25 : 0;

        if (this.canMoveTo(this.selectedPoint, destination)) {
            this.makeMove(this.selectedPoint, destination);
        }
    }
    
    canSelectPoint(point) {
        if (this.movesLeft.length === 0) return false;
        if (this.bar[this.currentPlayer] > 0) return false;
        
        const pointData = this.board[point];
        return pointData.color === this.currentPlayer && pointData.count > 0;
    }
    
    selectPoint(point) {
        this.clearSelection();
        this.selectedPoint = point;
        this.ui.highlightPoint(point, 'selected');
        this.highlightPossibleMoves();
    }
    
    clearSelection() {
        this.selectedPoint = null;
        this.ui.clearSelection();
    }
    
    highlightPossibleMoves() {
        if (this.selectedPoint === null) return;

        // Highlight points on board
        this.movesLeft.forEach(move => {
            let targetPoint;
            
            if (this.selectedPoint === 'bar') {
                targetPoint = this.currentPlayer === 'white' ? move : 25 - move;
            } else {
                targetPoint = this.currentPlayer === 'white' 
                    ? this.selectedPoint + move 
                    : this.selectedPoint - move;
            }
            
            if (this.isValidMove(this.selectedPoint, targetPoint)) {
                this.ui.highlightPoint(targetPoint, 'highlight');
            }
        });

        // Highlight home for bear off
        const homeDestination = this.currentPlayer === 'white' ? 25 : 0;
        if (this.canMoveTo(this.selectedPoint, homeDestination)) {
            this.ui.highlightPoint(homeDestination, 'highlight');
        }
    }
    
    canMoveTo(from, to) {
        if (this.movesLeft.length === 0) return false;

        if (from === 'bar') {
            const expectedPoint = this.currentPlayer === 'white' ? to : 25 - to;
            return this.movesLeft.includes(expectedPoint) && this.isValidMove(from, to);
        }

        if (to === 0 || to === 25) { // Bearing off
            if (!this.isValidMove(from, to)) return false;

            const exactDistance = this.currentPlayer === 'white' ? 25 - from : from;
            if (this.movesLeft.includes(exactDistance)) return true;

            const higherDice = this.movesLeft.find(d => d > exactDistance);
            if (higherDice) {
                const homeBoard = this.currentPlayer === 'white' ? [19, 20, 21, 22, 23, 24] : [1, 2, 3, 4, 5, 6];
                const furthestPoint = this.currentPlayer === 'white'
                    ? Math.max(...homeBoard.filter(p => this.board[p].color === this.currentPlayer && this.board[p].count > 0))
                    : Math.min(...homeBoard.filter(p => this.board[p].color === this.currentPlayer && this.board[p].count > 0));
                return from === furthestPoint;
            }
            return false;
        }

        const distance = Math.abs(to - from);
        return this.movesLeft.includes(distance) && this.isValidMove(from, to);
    }
    
    isValidMove(from, to) {
        if (this.bar[this.currentPlayer] > 0 && from !== 'bar') return false;
        
        if (from === 'bar') {
            const entryBoard = this.currentPlayer === 'white' ? [1, 2, 3, 4, 5, 6] : [19, 20, 21, 22, 23, 24];
            if (!entryBoard.includes(to)) return false;
        }
        
        if (to < 1 || to > 24) {
            return this.canBearOff() && this.isValidBearOff(from, to);
        }
        
        const targetPoint = this.board[to];
        if (targetPoint.color && targetPoint.color !== this.currentPlayer && targetPoint.count > 1) {
            return false;
        }
        
        const direction = this.currentPlayer === 'white' ? 1 : -1;
        if (from !== 'bar' && (to - from) * direction < 0) return false;
        
        return true;
    }
    
    canBearOff() {
        if (this.bar[this.currentPlayer] > 0) return false;
        
        const homeBoard = this.currentPlayer === 'white' ? [19, 20, 21, 22, 23, 24] : [1, 2, 3, 4, 5, 6];
        for (let i = 1; i <= 24; i++) {
            if (this.board[i].color === this.currentPlayer && !homeBoard.includes(i)) {
                return false;
            }
        }
        return true;
    }
    
    isValidBearOff(from, to) {
        const homeBoard = this.currentPlayer === 'white' ? [19, 20, 21, 22, 23, 24] : [1, 2, 3, 4, 5, 6];
        if (!homeBoard.includes(from)) return false;

        if (this.currentPlayer === 'white' && to <= 24) return false;
        if (this.currentPlayer === 'black' && to >= 1) return false;

        return true;
    }
    
    makeMove(from, to) {
        if (from === 'bar') {
            this.bar[this.currentPlayer]--;
        } else {
            this.board[from].count--;
            if (this.board[from].count === 0) this.board[from].color = null;
        }
        
        const isBearOff = to > 24 || to < 1;
        if (isBearOff) {
            this.home[this.currentPlayer]++;
        } else {
            if (this.board[to].color && this.board[to].color !== this.currentPlayer) {
                this.bar[this.board[to].color]++;
                this.board[to].color = this.currentPlayer;
                this.board[to].count = 1;
            } else {
                this.board[to].color = this.currentPlayer;
                this.board[to].count++;
            }
        }
        
        this.consumeMove(from, to);
        
        this.clearSelection();
        this.ui.render();
        
        if (this.movesLeft.length === 0) {
            this.endTurn();
        } else {
            this.checkAvailableMoves();
        }
        
        this.checkWinCondition();
    }

    consumeMove(from, to) {
        let moveDistance;
        if (to > 24 || to < 1) { // Bear-off
            const exactDistance = this.currentPlayer === 'white' ? 25 - from : from;
            if (this.movesLeft.includes(exactDistance)) {
                moveDistance = exactDistance;
            } else {
                moveDistance = Math.min(...this.movesLeft.filter(d => d > exactDistance));
            }
        } else if (from === 'bar') {
            moveDistance = this.currentPlayer === 'white' ? to : 25 - to;
        } else {
            moveDistance = Math.abs(to - from);
        }

        const moveIndex = this.movesLeft.indexOf(moveDistance);
        if (moveIndex !== -1) {
            this.movesLeft.splice(moveIndex, 1);
        }
        this.ui.updateMovesDisplay();
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
                if (this.board[from].color === this.currentPlayer) {
                    for (let move of this.movesLeft) {
                        const to = this.currentPlayer === 'white' ? from + move : from - move;
                        if (this.canMoveTo(from, to)) {
                            hasAvailableMoves = true;
                            break;
                        }
                    }
                }
                if (hasAvailableMoves) break;
            }
        }
        
        if (!hasAvailableMoves && this.movesLeft.length > 0) {
            this.ui.showMessage(`No available moves. Skipping remaining dice.`);
            this.movesLeft = [];
            setTimeout(() => this.endTurn(), 2000);
        }
    }
    
    endTurn() {
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.dice = [];
        this.movesLeft = [];
        this.selectedPoint = null;
        
        this.ui.updatePlayerTurn();
        this.ui.updateDice();
        this.ui.updateMovesDisplay();
        this.ui.setRollDiceButtonState(true);
        this.clearSelection();
    }
    
    checkWinCondition() {
        if (this.home.white === 15) {
            this.gameActive = false;
            this.ui.showMessage('White wins!');
            this.ui.setRollDiceButtonState(false);
        } else if (this.home.black === 15) {
            this.gameActive = false;
            this.ui.showMessage('Black wins!');
            this.ui.setRollDiceButtonState(false);
        }
    }
    
    resetGame() {
        this.initializeBoard();
        this.currentPlayer = 'white';
        this.dice = [];
        this.movesLeft = [];
        this.selectedPoint = null;
        this.gameActive = true;
        
        this.ui.render();
        this.ui.setRollDiceButtonState(true);
        this.ui.showMessage('Roll the dice to start!');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BackgammonGame();
});