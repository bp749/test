export class UI {
    constructor() {
        this.messageTimeout = null;
    }

    render(board, bar, home, currentPlayer) {
        document.querySelectorAll('.point').forEach(point => {
            point.innerHTML = '';
        });

        document.getElementById('bar-white').innerHTML = '';
        document.getElementById('bar-black').innerHTML = '';
        document.getElementById('home-white').innerHTML = '';
        document.getElementById('home-black').innerHTML = '';

        for (let i = 1; i <= 24; i++) {
            const pointData = board[i];
            if (pointData.count > 0) {
                const pointElement = document.querySelector(`[data-point="${i}"]`);
                this.renderCheckers(pointElement, pointData.color, pointData.count, i);
            }
        }

        if (bar.white > 0) {
            this.renderBarCheckers('bar-white', 'white', bar.white);
        }
        if (bar.black > 0) {
            this.renderBarCheckers('bar-black', 'black', bar.black);
        }

        if (home.white > 0) {
            this.renderHomeCheckers('home-white', 'white', home.white);
        }
        if (home.black > 0) {
            this.renderHomeCheckers('home-black', 'black', home.black);
        }

        this.updateCurrentPlayer(currentPlayer);
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

    updateMovesDisplay(movesLeft) {
        const movesElement = document.getElementById('moves-left');
        if (movesLeft.length > 0) {
            movesElement.textContent = `Moves: ${movesLeft.join(', ')}`;
        } else {
            movesElement.textContent = '';
        }
    }

    updateDoublingCubeDisplay(doublingCubeValue, doublingCubeOwner, doublingOffered, currentPlayer) {
        const cubeElement = document.getElementById('doubling-cube');
        cubeElement.textContent = doublingCubeValue > 1 ? doublingCubeValue : '64';

        if (doublingCubeOwner) {
            cubeElement.style.borderColor = doublingCubeOwner;
        } else {
            cubeElement.style.borderColor = '#333';
        }

        const doubleBtn = document.getElementById('double-btn');
        doubleBtn.disabled = doublingOffered || (doublingCubeOwner && doublingCubeOwner !== currentPlayer);
    }

    showMessage(message, persistent = false) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = message;
        messageElement.classList.add('visible');

        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }

        if (!persistent) {
            this.messageTimeout = setTimeout(() => {
                messageElement.classList.remove('visible');
            }, 3000);
        }
    }

    clearSelection() {
        document.querySelectorAll('.point').forEach(p => {
            p.classList.remove('selected', 'highlight');
        });
    }

    highlightPossibleMoves(moves, from, currentPlayer) {
        moves.forEach(move => {
            let targetPoint;

            if (from === 'bar') {
                targetPoint = currentPlayer === 'white' ? move : 25 - move;
            } else {
                targetPoint = currentPlayer === 'white'
                    ? from + move
                    : from - move;
            }

            const pointElement = document.querySelector(`[data-point="${targetPoint}"]`);
            if (pointElement) {
                pointElement.classList.add('highlight');
            }
        });
    }

    animateChecker(checker, from, to, currentPlayer) {
        return new Promise(resolve => {
            const toElement = to > 24 || to < 1
                ? document.getElementById(`home-${currentPlayer}`)
                : document.querySelector(`[data-point="${to}"]`);

            const fromRect = checker.getBoundingClientRect();
            const toRect = toElement.getBoundingClientRect();

            const isTopHalf = (typeof to === 'number' && to >= 13) || (to > 24 && currentPlayer === 'black');
            const targetY = isTopHalf ? toRect.top : toRect.bottom - fromRect.height;
            const targetX = toRect.left;

            const clone = checker.cloneNode(true);
            document.body.appendChild(clone);
            clone.style.position = 'absolute';
            clone.style.left = `${fromRect.left}px`;
            clone.style.top = `${fromRect.top}px`;
            clone.style.zIndex = '1000';

            checker.style.opacity = '0';

            clone.style.transition = 'left 0.5s ease, top 0.5s ease';
            clone.style.left = `${targetX}px`;
            clone.style.top = `${targetY}px`;

            clone.addEventListener('transitionend', () => {
                clone.remove();
                resolve();
            }, { once: true });
        });
    }

    updateCurrentPlayer(currentPlayer) {
        document.getElementById('current-player').textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`;
    }

    updateDice(dice) {
        document.getElementById('die1').textContent = dice.length > 0 ? dice[0] : '';
        document.getElementById('die2').textContent = dice.length > 0 ? dice[1] : '';
        document.getElementById('roll-dice').disabled = dice.length > 0;
    }
}
