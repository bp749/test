import { BackgammonGame } from './game-logic.js';
import { UI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const game = new BackgammonGame(ui);
    game.ui.showMessage('Roll the dice to start!', true);
});