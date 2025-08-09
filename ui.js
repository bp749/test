class UI {
    constructor(game) {
        this.game = game;
        this.initializeDOMElements();
        this.setupEventListeners();
    }

    initializeDOMElements() {
        this.rollDiceBtn = document.getElementById('roll-dice');
        this.newGameBtn = document.getElementById('new-game');
        this.points = document.querySelectorAll('.point');
        this.bar = document.getElementById('bar');
        this.homeAreas = document.querySelectorAll('.home-area');
        this.currentPlayerDisplay = document.getElementById('current-player');
        this.die1Display = document.getElementById('die1');
        this.die2Display = document.getElementById('die2');
        this.movesLeftDisplay = document.getElementById('moves-left');
        this.messageDisplay = document.getElementById('message');
        this.barWhiteDisplay = document.getElementById('bar-white');
        this.barBlackDisplay = document.getElementById('bar-black');
        this.homeWhiteDisplay = document.getElementById('home-white');
        this.homeBlackDisplay = document.getElementById('home-black');
    }

    setupEventListeners() {
        this.rollDiceBtn.addEventListener('click', () => this.game.rollDice());
        this.newGameBtn.addEventListener('click', () => this.game.resetGame());

        this.points.forEach(point => {
            point.addEventListener('click', (e) => this.game.handlePointClick(e));
        });

        this.bar.addEventListener('click', (e) => this.game.handleBarClick(e));

        this.homeAreas.forEach(home => {
            home.addEventListener('click', (e) => this.game.handleHomeClick(e));
        });
    }

    render() {
        this.renderBoard();
        this.renderBar();
        this.renderHome();
        this.updatePlayerTurn();
        this.updateDice();
        this.updateMovesDisplay();
    }

    renderBoard() {
        this.points.forEach(point => {
            point.innerHTML = '';
        });

        for (let i = 1; i <= 24; i++) {
            const pointData = this.game.board[i];
            if (pointData.count > 0) {
                const pointElement = document.querySelector(`[data-point="${i}"]`);
                this.renderCheckers(pointElement, pointData.color, pointData.count, i);
            }
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

    renderBar() {
        this.barWhiteDisplay.innerHTML = '';
        this.barBlackDisplay.innerHTML = '';

        if (this.game.bar.white > 0) {
            this.renderBarCheckers(this.barWhiteDisplay, 'white', this.game.bar.white);
        }
        if (this.game.bar.black > 0) {
            this.renderBarCheckers(this.barBlackDisplay, 'black', this.game.bar.black);
        }
    }

    renderBarCheckers(container, color, count) {
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

    renderHome() {
        this.homeWhiteDisplay.innerHTML = '';
        this.homeBlackDisplay.innerHTML = '';

        if (this.game.home.white > 0) {
            this.renderHomeCheckers(this.homeWhiteDisplay, 'white', this.game.home.white);
        }
        if (this.game.home.black > 0) {
            this.renderHomeCheckers(this.homeBlackDisplay, 'black', this.game.home.black);
        }
    }

    renderHomeCheckers(container, color, count) {
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

    updatePlayerTurn() {
        this.currentPlayerDisplay.textContent = `${this.game.currentPlayer.charAt(0).toUpperCase() + this.game.currentPlayer.slice(1)}'s Turn`;
    }

    updateDice() {
        if (this.game.dice.length === 0) {
            this.die1Display.textContent = '';
            this.die2Display.textContent = '';
        } else {
            this.die1Display.textContent = this.game.dice[0];
            this.die2Display.textContent = this.game.dice[1];
        }
    }

    updateMovesDisplay() {
        if (this.game.movesLeft.length > 0) {
            this.movesLeftDisplay.textContent = `Moves: ${this.game.movesLeft.join(', ')}`;
        } else {
            this.movesLeftDisplay.textContent = '';
        }
    }

    showMessage(message, isError = false) {
        this.messageDisplay.textContent = message;
        this.messageDisplay.style.color = isError ? 'red' : 'black';
    }

    clearSelection() {
        this.points.forEach(p => {
            p.classList.remove('selected', 'highlight');
        });
        this.homeAreas.forEach(h => h.classList.remove('highlight'));
    }

    highlightPoint(point, type) {
        if (point === 'bar') {
            // Can't highlight bar in the same way. Maybe change cursor or border.
        } else if (point === 0 || point === 25) {
            const player = point === 25 ? 'white' : 'black';
            document.getElementById(`home-${player}`).classList.add(type);
        } else {
            const pointElement = document.querySelector(`[data-point="${point}"]`);
            if (pointElement) {
                pointElement.classList.add(type);
            }
        }
    }

    setRollDiceButtonState(enabled) {
        this.rollDiceBtn.disabled = !enabled;
    }
}
