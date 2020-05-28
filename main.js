const selectedLanguage = 'sv';
const translations = {
    'en': {
        'title': 'Don\'t fall down!',
        'gameModeTitle': 'Select game mode',
        'fastGameModeTitle': 'Fast',
        'fastGameModeSubTitle': 'Skip over opponents.',
        'normalGameModeTitle': 'Normal',
        'normalGameModeSubTitle': 'Normal game play.',
        'slowGameModeTitle': 'Slow',
        'slowGameModeSubTitle': 'Not allowed to stop on opponents marker.',
        'playerTitle': 'Select number of players',
        'start': 'Start',
        'currentPlayer': 'Current player:',
        'clickDices': 'Click the dices you want to combine.',
        'rollOrStop': 'Select if you want to roll again or stop.',
        'roll': 'Roll again',
        'stop': 'Stop',
        'busted': 'Oh no, you can\'t combine the dice and you fell down!',
        'nextPlayer': 'Next player',
        'player': 'Player',
        'climbOn': 'Climb on',
        'and': 'and',
        'weHaveAWinner': 'We have a winner!',
        'congratulationPlayer': 'Congratulation to the victory, player',
        'openMenu': 'Open menu',
    },
    'sv': {
        'title': 'Trilla inte ner!',
        'gameModeTitle': 'Välj spelläge',
        'fastGameModeTitle': 'Snabb',
        'fastGameModeSubTitle': 'Hoppa över motståndarens pjäser.',
        'normalGameModeTitle': 'Normal',
        'normalGameModeSubTitle': 'Normalt spel.',
        'slowGameModeTitle': 'Långsam',
        'slowGameModeSubTitle': 'Ej tillåtet att stanna på samma ruta som en motståndare.',
        'playerTitle': 'Välj antal spelare',
        'start': 'Starta spelet',
        'currentPlayer': 'Nuvarande spelare:',
        'clickDices': 'Klicka på tärningarna du vill kombinera.',
        'rollOrStop': 'Välj om du vill stanna eller slå igen.',
        'roll': 'Slå igen',
        'stop': 'Stanna',
        'busted': 'Åh nej, du trillade ner. Det är inte möjligt att kombinera tärningarna för ett gilltigt drag!',
        'nextPlayer': 'Nästa spelare',
        'player': 'Spelare',
        'climbOn': 'Klättra på',
        'and': 'och',
        'weHaveAWinner': 'Vi har en vinnare!',
        'congratulationPlayer': 'Grattis till vinsten, spelare',
        'openMenu': 'Till menyn',
    }
}

const el = (tagName, id = null, classList = [], content = null) => {
    const element = document.createElement(tagName);
    if (id !== null) {
        element.id = id;
    }
    classList.forEach((c) => {
        element.classList.add(c);
    })
    if (content !== null) {
        if (Array.isArray(content)) {
            content.forEach((c) => {
                element.append(c);
            })
        } else {
            element.innerHTML = content;
        }
    }
    return element
}

const _ = (lookUp) => {
    return translations[selectedLanguage][lookUp]
}

class Die {
    constructor(onClick) {
        this.value = null;
        this.element = null;
        this.listener = () => onClick(this);
    }

    roll() {
        this.value = 1 + Math.floor(Math.random() * 6);
        this.updateElement();
    }

    updateElement() {
        if (this.element) {
            this.element.removeEventListener('click', this.listener);
        }
        const dotMapping = {
            null: [],
            1: ['center-center'],
            2: ['upper-left', 'lower-right'],
            3: ['upper-left', 'center-center', 'lower-right'],
            4: ['upper-left', 'upper-right', 'lower-left', 'lower-right'],
            5: ['upper-left', 'upper-right', 'center-center', 'lower-left', 'lower-right'],
            6: ['upper-left', 'upper-right', 'center-left', 'center-right', 'lower-left', 'lower-right'],
        }
        this.element = el('div', null, ['die', 'button']);
        this.element.addEventListener('click', this.listener);

        dotMapping[this.value].forEach((pos) => {
            this.element.append(el('div', null, ['dot', `dot-${pos}`]));
        })
    }
}

class DontFall {
    constructor(htmlElement) {
        this.htmlElement = htmlElement;
        this.elements = {
            'playerColor': null,
            'playerName': null,
            'gamePlan': null,
            'dice': null,
            'diceInfo': null,
            'buttons': null
        };
        this.selectedDice = [];
        this.neutralMarkers = [];
        this.eventListenerFunctions = {
            'roll': () => this.rollDice(),
            'stop': () => {
                this.storeProgress();
                this.nextPlayersTurn();
            },
            'climb': () => this.climb(),
            'nextPlayer': () => {
                this.removeButton('nextPlayer');
                this.removeNeutralMarkers();
                this.cleanUpRoll();
                this.nextPlayersTurn()
            },
            'openMenu': () => {
                this.removeButton('openMenu');
                this.resetGame();
                this.openMenu();
            },
        };
        this.buttons = {}
        this.dice = [
            new Die((die) => this.onDieClick(die.element, 0)),
            new Die((die) => this.onDieClick(die.element, 1)),
            new Die((die) => this.onDieClick(die.element, 2)),
            new Die((die) => this.onDieClick(die.element, 3)),
        ];
        this.gameMode = null;
        this.nrOfPlayers = null;
        this.currentPlayer = null;
        this.gamePlan = null;
        this.resetGame();
    }

    resetGame() {
        this.gameMode = 1;
        this.nrOfPlayers = 2;
        this.currentPlayer = 1;
        this.gamePlan = {
            2: Array.apply(null, Array(3)),
            3: Array.apply(null, Array(5)),
            4: Array.apply(null, Array(7)),
            5: Array.apply(null, Array(9)),
            6: Array.apply(null, Array(11)),
            7: Array.apply(null, Array(13)),
            8: Array.apply(null, Array(11)),
            9: Array.apply(null, Array(9)),
            10: Array.apply(null, Array(7)),
            11: Array.apply(null, Array(5)),
            12: Array.apply(null, Array(3)),
        }
    }

    openMenu() {
        const backdrop = el('div', 'backdrop');
        backdrop.addEventListener('click', (e) => {
            e.preventDefault();
        })
        const gameModeButtons = ['fast', 'normal', 'slow'].map(
            (mode) => el('div', `game-mode-${mode}-button`, ['button', 'game-mode-button', mode === 'normal' && 'selected'].filter(c => c), [
                el('h3', null, [], _(`${mode}GameModeTitle`)),
                el('span', null, [], _(`${mode}GameModeSubTitle`))
            ]));
        gameModeButtons.forEach((element, idx) => {
            element.addEventListener('click', () => {
                this.gameMode = idx;
                gameModeButtons.forEach((e) => {
                    e.classList.remove('selected')
                });
                element.classList.add('selected');
            });
        });
        const playerButtons = [2, 3, 4].map((players) =>
            el('div', `${players}-player-button`, ['button', 'player-button', players === 2 && 'selected'].filter(c => c), [
                el('h3', null, [], `${players}`),
            ]));
        playerButtons.forEach((element, idx) => {
            element.addEventListener('click', () => {
                this.nrOfPlayers = 2 + idx;
                playerButtons.forEach((e) => {
                    e.classList.remove('selected')
                });
                element.classList.add('selected');
            });
        });
        const startGameButton = el('div', 'start-game', ['button', 'start-button'], [
            el('h2', null, [], _('start')),
        ]);
        startGameButton.addEventListener('click', () => {
            this.startGame();
        })
        const menu = el('div', 'menu', [], [
            el('h1', null, [], _('title')),
            el('hr'),
            el('h2', null, [], _('gameModeTitle')),
            el('div', null, ['game-mode'], gameModeButtons),
            el('hr'),
            el('h2', null, [], _('playerTitle')),
            el('div', null, ['players'], playerButtons),
            el('hr'),
            startGameButton,
        ]);

        this.htmlElement.innerHTML = '';
        this.htmlElement.append(backdrop);
        this.htmlElement.append(menu);
    }

    startGame() {
        this.elements['playerColor'] = el('span', 'player-color');
        this.elements['playerName'] = el('span', 'player-name');
        this.elements['dice'] = el('div', 'dice')
        this.elements['diceInfo'] = el('div', 'info');
        this.elements['neutralMarkers'] = el('div', 'neutral-markers');
        this.elements['buttons'] = el('div', 'buttons');
        const leftPanel = el('div', 'left-panel', [], [
            el('div', 'turn-info', [], [
                el('h1', null, [], _('currentPlayer')),
                el('h2', null, [], [
                    this.elements['playerColor'], this.elements['playerName']
                ])
            ]),
            this.elements['diceInfo'],
            this.elements['neutralMarkers'],
            this.elements['dice'],
            this.elements['buttons'],
        ]);

        this.elements['gamePlan'] = el('div', 'game-plan');
        const rightPanel = el('div', 'right-panel', [], [
            this.elements['gamePlan']
        ]);
        this.htmlElement.innerHTML = '';
        this.htmlElement.append(leftPanel);
        this.htmlElement.append(rightPanel);
        this.setPlayerInfo();
        this.renderGamePlan();
        this.rollDice();
    }

    setPlayerInfo() {
        const tmp = (this.currentPlayer - 1) % this.nrOfPlayers;
        this.elements['playerColor'].classList.remove(`player-${tmp === 0 ? this.nrOfPlayers : tmp}`);
        this.elements['playerColor'].classList.add(`player-${this.currentPlayer}`);
        this.elements['playerName'].innerText = `${_('player')} ${this.currentPlayer}`
    };

    addButton(button, text, attachTo = 'buttons') {
        this.removeButton(button);
        this.buttons[button] = el('div', null, ['button', button], text || _(button));
        this.buttons[button].addEventListener('click', this.eventListenerFunctions[button]);
        this.elements[attachTo].append(this.buttons[button]);
    }

    removeButton(button) {
        if (this.buttons[button]) {
            this.buttons[button].removeEventListener('click', this.eventListenerFunctions[button])
            this.buttons[button].remove();
            this.buttons[button] = null;
        }
    }

    rollDice() {
        this.selectedDice = [];
        this.removeButton('roll');
        this.removeButton('stop');
        this.dice.forEach((die) => {
            die.roll();
            this.elements['dice'].append(die.element);
        })
        this.elements['diceInfo'].innerHTML = '';
        this.elements['diceInfo'].append(el('p', null, [], _('clickDices')));
        if (this.isBusted()) {

        }
    }

    isBusted() {
        if (![[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]].some(
            ([x, y]) => this.canClimbOn(this.dice[x].value + this.dice[y].value))) {
            this.elements['diceInfo'].innerHTML = '';
            this.elements['diceInfo'].append(el('p', null, [], _('busted')));
            this.addButton('nextPlayer');
        }
    }

    canClimbOn(nr) {
        return ((this.neutralMarkers.length < 3 || this.neutralMarkers.includes(nr)) && !this.gamePlan[nr][this.gamePlan[nr].length - 1]);
    }

    canClimbOnSecond(nr, first) {
        return (
            !this.gamePlan[nr][this.gamePlan[nr].length - 1] &&
            (
                this.neutralMarkers.includes(nr) ||
                this.neutralMarkers.length <= 1 ||
                (this.neutralMarkers.length === 2 && (this.neutralMarkers.includes(first) || nr === first))
            )
        );
    }

    renderGamePlan() {
        const renderColumn = (col) => {
            const column = el('div', null, ['column'], [
                el('div', null, ['number'], [
                    el('h1', null, [], col)
                ])
            ]);

            this.gamePlan[col].forEach((rowContent, i) => {
                const row = el('div', null, ['row']);
                if (i === (2 * (7 - Math.abs(col - 7))) - 2) {
                    row.classList.add('top');
                }
                if (Array.isArray(rowContent) && rowContent.length > 0) {
                    if (i === (2 * (7 - Math.abs(col - 7))) - 2 && !rowContent.includes('n')) {
                        column.classList.add('completed')
                    }
                    rowContent.forEach((player) => {
                        row.append(el('span', null, ['player', `player-${player}`]))
                    });
                }
                column.append(row);
            })
            return column;
        }
        this.elements['gamePlan'].innerHTML = '';
        for (let i = 2; i <= 12; i += 1) {
            this.elements['gamePlan'].append(renderColumn(i));
        }
        this.elements['neutralMarkers'].innerHTML = '';
        for (let i = 0; i < 3 - this.neutralMarkers.length; i += 1) {
            this.elements['neutralMarkers'].append(el('div', null, ['marker']))
        }
    }


    getDicePair() {
        const first = this.dice[this.selectedDice[0]].value + this.dice[this.selectedDice[1]].value;
        const ret = [];
        if (this.canClimbOn(first)) {
            ret.push(first);
        } else {
            return ret;
        }
        const unselectedDice = [0, 1, 2, 3].filter(x => !this.selectedDice.includes(x));
        const second = this.dice[unselectedDice[0]].value + this.dice[unselectedDice[1]].value;
        if (this.canClimbOnSecond(second, first)) {
            ret.push(second);
        }
        return ret;
    }

    onDieClick(die, idx) {
        if (this.selectedDice.includes(idx)) {
            this.selectedDice.splice(this.selectedDice.indexOf(idx), 1);
            die.classList.remove("selected");
        } else if (this.selectedDice.length !== 2) {
            this.selectedDice.push(idx);
            die.classList.add("selected");
        }
        if (this.selectedDice.length === 2) {
            let possibleMoves = this.getDicePair();
            if (possibleMoves.length === 0) {

            } else if (possibleMoves.length === 1) {
                this.addButton('climb', `${_('climbOn')} ${possibleMoves[0]}`);
            } else if (possibleMoves.length === 2) {
                this.addButton('climb', `${_('climbOn')} ${possibleMoves[0]} ${_('and')} ${possibleMoves[1]}`);
            }
        } else {
            this.removeButton('climb');
        }
    };

    climb() {
        const moveNeutralMarker = (nr) => {
            let currentPlayerIndex = -1;
            let currentNeutralIndex = -1;
            this.gamePlan[nr].forEach((row, idx) => {
                if (row && Array.isArray(row) && row.includes('n')) {
                    currentNeutralIndex = idx;
                }
                if (row && Array.isArray(row) && row.includes(this.currentPlayer)) {
                    currentPlayerIndex = idx;
                }
            })
            let currentIndex = Math.max(currentPlayerIndex, currentNeutralIndex);

            if (currentIndex + 1 < this.gamePlan[nr].length) {
                if (Array.isArray(this.gamePlan[nr][currentIndex]) && this.gamePlan[nr][currentIndex].includes('n')) {
                    this.gamePlan[nr][currentIndex].splice(this.gamePlan[nr][currentIndex].indexOf('n'), 1);
                }
                if (Array.isArray(this.gamePlan[nr][currentIndex + 1])) {
                    this.gamePlan[nr][currentIndex + 1].push('n');
                    if (this.gameMode === 0 && this.gamePlan[nr][currentIndex + 1].length > 1) {
                        moveNeutralMarker(nr);
                    }
                } else {
                    this.gamePlan[nr][currentIndex + 1] = ['n'];
                }
            }
        }

        let possibleMoves = this.getDicePair();
        if (possibleMoves.length === 0) {
            return;
        }
        this.removeButton('climb');
        if (possibleMoves.length === 1) {
            if (!this.neutralMarkers.includes(possibleMoves[0])) {
                this.neutralMarkers.push(possibleMoves[0]);
            }
            moveNeutralMarker(possibleMoves[0]);
        } else if (possibleMoves.length === 2) {
            if (!this.neutralMarkers.includes(possibleMoves[0])) {
                this.neutralMarkers.push(possibleMoves[0]);
            }
            if (!this.neutralMarkers.includes(possibleMoves[1])) {
                this.neutralMarkers.push(possibleMoves[1]);
            }
            moveNeutralMarker(possibleMoves[0]);
            moveNeutralMarker(possibleMoves[1]);
        }
        this.renderGamePlan();
        this.cleanUpRoll();
        this.elements['diceInfo'].innerHTML = _('rollOrStop');
        this.addButton('roll');
        if (this.gameMode !== 2 || !this.isPlayersOnSamePosition()) {
            this.addButton('stop');
        }
    };


    cleanUpRoll = () => {
        this.elements['diceInfo'].innerHTML = '';
        this.elements['dice'].innerHTML = "";
        this.selectedDice = [];
    }


    nextPlayersTurn() {
        const tmp = (this.currentPlayer + 1) % this.nrOfPlayers;
        this.currentPlayer = tmp === 0 ? this.nrOfPlayers : tmp;
        this.setPlayerInfo();
        this.rollDice();
    }


    checkWiningCondition() {
        const topRow = [];
        for (let i = 2; i <= 12; i += 1) {
            const top = this.gamePlan[i][this.gamePlan[i].length - 1];
            topRow.push(Array.isArray(top) ? top[0] : null)
        }
        const playerMap = topRow.reduce((acc, cur) => {
            acc[cur] = (acc[cur] || 0) + 1;
            return acc;
        }, {});
        for (const player in playerMap) {
            if (playerMap.hasOwnProperty(player) && playerMap[player] === 1) {
                return player;
            }
        }
        return 0;
    }

    storeProgress() {
        this.neutralMarkers.forEach((nr) => {
            this.gamePlan[nr].forEach((row) => {
                if (row && Array.isArray(row) && row.includes(this.currentPlayer)) {
                    row.splice(row.indexOf(this.currentPlayer), 1);
                }
                if (row && Array.isArray(row) && row.includes('n')) {
                    row.splice(row.indexOf('n'), 1, this.currentPlayer);
                }
            });
        });
        this.neutralMarkers = [];
        const winner = this.checkWiningCondition();
        if (winner) {
            const backdrop = el('div', 'backdrop');
            backdrop.addEventListener('click', (e) => {
                e.preventDefault();
            })
            this.htmlElement.append(backdrop);
            this.elements['winner'] = el('div', 'menu', [], [
                el('h1', null, [], _('weHaveAWinner')),
                el('hr'),
                el('h2', null, [], `${_('congratulationPlayer')} ${this.currentPlayer}!`),
            ]);
            this.addButton('openMenu', undefined, 'winner');
            this.htmlElement.append(this.elements['winner']);
        }
        this.renderGamePlan();
    }

    removeNeutralMarkers() {
        this.neutralMarkers.forEach((nr) => {
            this.gamePlan[nr].forEach((row) => {
                if (row && Array.isArray(row) && row.includes('n')) {
                    row.splice(row.indexOf('n'), 1);
                }
            });
        });
        this.neutralMarkers = [];
        this.renderGamePlan();
    }

    isPlayersOnSamePosition() {
        return this.neutralMarkers.some(
            (nr) => this.gamePlan[nr].some(
                (row) => (row && Array.isArray(row) && row.includes('n') && row.length > 1)
            )
        );
    }
}


(() => {
    let game = new DontFall(document.getElementById('content'));
    game.openMenu();

})()