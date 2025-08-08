class BackgammonGame {
    constructor() {
        this.board = new Array(25).fill(null).map(() => ({ color: null, count: 0 }));
        this.bar = { white: 0, black: 0 };
        this.home = { white: 0, black: 0 };
        this.currentPlayer = 'white';
        this.dice = [];
        this.movesLeft = [];
        this.selectedPoint = null;
        this.gameActive = true;
        
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
        
        document.querySelectorAll('.point').forEach(point => {
            point.addEventListener('click', (e) => this.handlePointClick(e));
        });
        
        document.getElementById('bar').addEventListener('click', (e) => this.handleBarClick(e));
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
        
        document.getElementById('die1').textContent = die1;
        document.getElementById('die2').textContent = die2;
        document.getElementById('roll-dice').disabled = true;
        
        this.updateMovesDisplay();
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
    
    handleBarClick(e) {
        if (this.bar[this.currentPlayer] > 0 && this.selectedPoint === null) {
            this.selectedPoint = 'bar';
            this.highlightPossibleMoves();
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
        this.clearSelection();
        this.selectedPoint = point;
        
        if (point !== 'bar') {
            document.querySelector(`[data-point="${point}"]`).classList.add('selected');
        }
        
        this.highlightPossibleMoves();
    }
    
    clearSelection() {
        this.selectedPoint = null;
        document.querySelectorAll('.point').forEach(p => {
            p.classList.remove('selected', 'highlight');
        });
    }
    
    highlightPossibleMoves() {
        if (this.selectedPoint === null) return;
        
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
                const pointElement = document.querySelector(`[data-point="${targetPoint}"]`);
                if (pointElement) {
                    pointElement.classList.add('highlight');
                }
            }
        });
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
    
    makeMove(from, to) {
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
        
        this.clearSelection();
        this.render();
        this.updateMovesDisplay();
        
        if (this.movesLeft.length === 0) {
            this.endTurn();
        } else {
            this.checkAvailableMoves();
        }
        
        this.checkWinCondition();
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
            this.showMessage(`No available moves. Skipping remaining dice.`);
            setTimeout(() => this.endTurn(), 2000);
        }
    }
    
    endTurn() {
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.dice = [];
        this.movesLeft = [];
        this.selectedPoint = null;
        
        document.getElementById('current-player').textContent = `${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)}'s Turn`;
        document.getElementById('die1').textContent = '';
        document.getElementById('die2').textContent = '';
        document.getElementById('roll-dice').disabled = false;
        
        this.updateMovesDisplay();
        this.clearSelection();
    }
    
    checkWinCondition() {
        if (this.home.white === 15) {
            this.gameActive = false;
            this.showMessage('White wins!');
            document.getElementById('roll-dice').disabled = true;
        } else if (this.home.black === 15) {
            this.gameActive = false;
            this.showMessage('Black wins!');
            document.getElementById('roll-dice').disabled = true;
        }
    }
    
    updateMovesDisplay() {
        const movesElement = document.getElementById('moves-left');
        if (this.movesLeft.length > 0) {
            movesElement.textContent = `Moves: ${this.movesLeft.join(', ')}`;
        } else {
            movesElement.textContent = '';
        }
    }
    
    showMessage(message) {
        document.getElementById('message').textContent = message;
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
        
        this.initializeBoard();
        this.render();
        
        document.getElementById('current-player').textContent = "White's Turn";
        document.getElementById('die1').textContent = '';
        document.getElementById('die2').textContent = '';
        document.getElementById('roll-dice').disabled = false;
        document.getElementById('message').textContent = 'Roll the dice to start!';
        this.updateMovesDisplay();
        this.clearSelection();
    }
    
    render() {
        document.querySelectorAll('.point').forEach(point => {
            point.innerHTML = '';
        });
        
        document.getElementById('bar-white').innerHTML = '';
        document.getElementById('bar-black').innerHTML = '';
        document.getElementById('home-white').innerHTML = '';
        document.getElementById('home-black').innerHTML = '';
        
        for (let i = 1; i <= 24; i++) {
            const pointData = this.board[i];
            if (pointData.count > 0) {
                const pointElement = document.querySelector(`[data-point="${i}"]`);
                this.renderCheckers(pointElement, pointData.color, pointData.count, i);
            }
        }
        
        if (this.bar.white > 0) {
            this.renderBarCheckers('bar-white', 'white', this.bar.white);
        }
        if (this.bar.black > 0) {
            this.renderBarCheckers('bar-black', 'black', this.bar.black);
        }
        
        if (this.home.white > 0) {
            this.renderHomeCheckers('home-white', 'white', this.home.white);
        }
        if (this.home.black > 0) {
            this.renderHomeCheckers('home-black', 'black', this.home.black);
        }
    }
    
    renderCheckers(container, color, count, point) {
        const isTopHalf = point >= 13;
        const maxVisible = 5;
        const checkersToShow = Math.min(count, maxVisible);
        
        for (let i = 0; i < checkersToShow; i++) {
            const checker = document.createElement('div');
            checker.className = `checker ${color}`;
            
            if (isTopHalf) {
                checker.style.top = `${10 + i * 35}px`;
            } else {
                checker.style.bottom = `${10 + i * 35}px`;
            }
            
            container.appendChild(checker);
        }
        
        if (count > maxVisible) {
            const counter = document.createElement('div');
            counter.className = 'checker-count';
            counter.textContent = count;
            counter.style.top = isTopHalf ? '90px' : 'auto';
            counter.style.bottom = isTopHalf ? 'auto' : '90px';
            container.appendChild(counter);
        }
    }
    
    renderBarCheckers(containerId, color, count) {
        const container = document.getElementById(containerId);
        for (let i = 0; i < Math.min(count, 5); i++) {
            const checker = document.createElement('div');
            checker.className = `checker ${color}`;
            checker.style.position = 'relative';
            container.appendChild(checker);
        }
        
        if (count > 5) {
            const counter = document.createElement('div');
            counter.className = 'checker-count';
            counter.textContent = count;
            container.appendChild(counter);
        }
    }
    
    renderHomeCheckers(containerId, color, count) {
        const container = document.getElementById(containerId);
        for (let i = 0; i < Math.min(count, 5); i++) {
            const checker = document.createElement('div');
            checker.className = `checker ${color}`;
            checker.style.position = 'relative';
            container.appendChild(checker);
        }
        
        if (count > 5) {
            const counter = document.createElement('div');
            counter.className = 'checker-count';
            counter.textContent = count;
            container.appendChild(counter);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new BackgammonGame();
    document.getElementById('message').textContent = 'Roll the dice to start!';
});