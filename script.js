
window.addEventListener('load', () => {
    createHtml();
    const puzzle = new Puzzle();
    puzzle.create();
    const main = document.getElementById('main');
    const stop = document.getElementById('stop');
    let clearTimeInterval;

    document.getElementById('select').addEventListener('change', () => {
        puzzle.create(Number(document.getElementById('select').value[0]));
    });

    document.getElementById('start').addEventListener('click', () => {
        main.style.opacity = 1;
        document.getElementById('steps').innerHTML = 0;
        document.getElementById('time').innerHTML = '00:00';
        puzzle.steps = 0;
        puzzle.timestamp = 0;
        puzzle.createEvent();
        puzzle.create();
        clearTimeInterval = puzzle.interval('time');
    });

    stop.addEventListener('click', () => {
        main.style.opacity = 0.5;
        puzzle.stopEvent();
        stop.classList.toggle('resume');
        if (stop.classList.length > 1) {
            stop.innerHTML = 'Resume';
            clearInterval(clearTimeInterval);
        } else {
            stop.innerHTML = 'Stop';
            main.style.opacity = 1;
            puzzle.createEvent();
            clearTimeInterval = puzzle.interval('time');
        }
    });

    document.getElementById('save').addEventListener('click', () => {
        puzzle.saveGame();
    })
})

function createHtml() {
    const header = document.createElement('header');
    const h1 = document.createElement('h1');
    h1.className = 'title';
    h1.innerHTML = 'Gem Puzzle';
    header.append(h1);

    const nav = document.createElement('nav');
    nav.className = 'nav';
    const start = document.createElement('button');
    start.className = 'my-button';
    start.id = 'start';
    start.innerHTML = 'Start';
    nav.append(start);
    const stop = document.createElement('button');
    stop.className = 'my-button';
    stop.id = 'stop';
    stop.innerHTML = 'Stop';
    nav.append(stop);
    const save = document.createElement('button');
    save.className = 'my-button';
    save.id = 'save';
    save.innerHTML = 'Save';
    nav.append(save);
    const results = document.createElement('button');
    results.className = 'my-button';
    results.id = 'results';
    results.innerHTML = 'Results';
    nav.append(results);
    const select = document.createElement('select');
    select.className = 'my-select';
    select.id = 'select';
    for (let i = 3; i <= 8; i += 1) {
        const option = document.createElement('option');
        option.innerHTML = `${i}x${i}`;
        if (i === 4) option.selected = true;
        select.append(option);
    }
    nav.append(select);
    header.append(nav);

    const section = document.createElement('section');
    section.className = 'status';
    let label = document.createElement('label');
    label.className = 'label';
    label.innerHTML = 'Steps:';
    section.append(label);
    label = document.createElement('label');
    label.className = 'time';
    label.id = 'steps';
    label.innerHTML = '0';
    section.append(label);
    label = document.createElement('label');
    label.className = 'label';
    label.innerHTML = 'Time:';
    section.append(label);
    label = document.createElement('label');
    label.className = 'time';
    label.innerHTML = '00:00';
    label.id = 'time';
    section.append(label);
    header.append(section);

    const main = document.createElement('main');
    main.className = 'main';
    main.id = 'main';
    const wrap = document.createElement('div');
    wrap.className = 'wrap';
    const game = document.createElement('div');
    game.className = 'game';
    game.id = 'game';
    wrap.append(game);
    main.append(wrap);

    document.body.append(header);
    document.body.append(main);
}

class Puzzle {
    constructor(cols = 4, id = 'game', timeId = 'time', stepsId = 'steps', stopId = 'stop') {
        this.id = id;
        this.cols = cols;
        this.count = cols * cols - 1;
        this.steps = +localStorage.getItem(stepsId) || 0;
        this.timestamp = +localStorage.getItem(timeId) || 0;
        this.fromStorage(timeId, stepsId, stopId);
    }

    create(size = 4, width = 400) {
        this.field = new Array(size).fill(false).map(elem => elem = new Array(size).fill(false));
        this.cols = size;
        this.count = size * size - 1;
        let fontSize = '50px';
        if (size > 5) fontSize = '30px';
        const game = document.getElementById(this.id);
        game.innerHTML = '';
        const randomNumbers = [];
        const sizeItem = (width - (this.cols + 1) * 10) / this.cols;
        this.margin = sizeItem + 10;
        game.style.height = `${this.margin * this.cols}px`;

        for (let i = 0; i < this.cols; i += 1) {
            for (let j = 0; j < this.cols; j += 1) {
                if (i === this.cols - 1 && j === this.cols - 1) {
                    this.field[i][j] = false;
                } else {
                    const item = document.createElement('div');
                    item.className = 'item';
                    const ranNum = this.randomNumber(randomNumbers)
                    randomNumbers.push(ranNum);
                    item.innerHTML = ranNum;
                    item.style.fontSize = fontSize;
                    item.id = ranNum;
                    item.style.width = `${sizeItem}px`;
                    item.style.height = `${sizeItem}px`;
                    item.style.left = `${this.margin * j}px`;
                    item.style.top = `${this.margin * i}px`;
                    game.append(item);
                    this.field[i][j] = [ranNum, false, this.margin * j, this.margin * i];
                }
            }
        }
        this.newDirection();
    }

    createEvent() {
        const game = document.getElementById(this.id);
        game.onclick = this.eventClick.bind(this);

        game.onmousedown = (e) => {
            game.onmousemove = () => {
                game.onclick = null;
                //this.eventMouseMove(e.target.id);
            }
        };
        game.onmouseup = (e) => {
            game.onmousemove = null;
            //this.eventUp(e.target.id);
            setTimeout(() => {
                game.onclick = this.eventClick.bind(this);
            }, 0);
        };
    }

    stopEvent() {
        const game = document.getElementById(this.id);
        game.onclick = null;
        game.onmousedown = null;
        game.onmousemove = null;
        game.onmouseup = null;
    }

    randomNumber(randomNumbers) {
        if (randomNumbers.length === 0) {
            return 1 + Math.floor(Math.random() * (this.count));
        }

        let ranRes = randomNumbers[0];
        while (randomNumbers.includes(ranRes)) {
            ranRes = 1 + Math.floor(Math.random() * (this.count));
        }
        return ranRes;
    }

    endGame() {
        let count = 0;
        let end = true;
        for (let i = 0; i < this.cols; i += 1) {
            for (let j = 0; j < this.cols; j += 1) {
                count += 1;
                if (count !== this.field[i][j] && count !== this.count + 1) {
                    end = false;
                }
            }
        }
        if (end) {
            this.showMessage = 'show message with the end game';
            const getRes = localStorage.get('results').split(',');
            if (Number(getRes[getRes.length - 1]) < this.steps) {
                getRes.push(getRes);
                getRes.sort();
                if (getRes.length > 10) getRes.pop();
            }
            localStorage.setItem('results', getRes.join(','));
        }
    }

    blockElements() {
        for (let i = 0; i < this.cols; i += 1) {
            for (let j = 0; j < this.cols; j += 1) {
                if (this.field[i][j]) {
                    this.field[i][j][1] = false;
                }
            }
        }
    }

    newDirection() {
        for (let i = 0; i < this.cols; i += 1) {
            for (let j = 0; j < this.cols; j += 1) {
                if (this.field[i][j] === false) {
                    if (i - 1 >= 0) this.field[i - 1][j][1] = 'down';
                    if (i + 1 < this.cols) this.field[i + 1][j][1] = 'up';
                    if (j - 1 >= 0) this.field[i][j - 1][1] = 'right';
                    if (j + 1 < this.cols) this.field[i][j + 1][1] = 'left';
                }
            }
        }
    }

    eventClick(e) {
        const itemId = e.target.id;
        if (e.target.closest('div').className === 'item' && itemId !== this.id) {
            this.stopEvent();
            setTimeout(() => this.createEvent(), 100);

            const item = document.getElementById(itemId);
            let button = [0, 0];
            const cords = [0, 0];
            for (let i = 0; i < this.cols; i += 1) {
                for (let j = 0; j < this.cols; j += 1) {
                    if (this.field[i][j][0] === Number(itemId)) {
                        button = this.field[i][j];
                        cords[0] = i;
                        cords[1] = j;
                    }
                }
            }
            if (button[1]) {
                this.steps += 1;
                document.getElementById('steps').innerHTML = this.steps;
                switch (button[1]) {
                    case 'left':
                        this.moveLeft(item, button, cords);
                        break;
                    case 'right':
                        this.moveRight(item, button, cords);
                        break;
                    case 'up':
                        this.moveUp(item, button, cords);
                        break;
                    case 'down':
                        this.moveDown(item, button, cords);
                        break;
                }
            }
        }
    }

    moveDown(item, button, cords) {
        item.style.top = `${button[3] + this.margin}px`;
        this.field[cords[0]][cords[1]][3] += this.margin;
        this.field[cords[0] + 1][cords[1]] = this.field[cords[0]][cords[1]];
        this.field[cords[0]][cords[1]] = false;
        this.blockElements();
        this.newDirection();
    }

    moveRight(item, button, cords) {
        item.style.left = `${button[2] + this.margin}px`;
        this.field[cords[0]][cords[1]][2] += this.margin;
        this.field[cords[0]][cords[1] + 1] = this.field[cords[0]][cords[1]];
        this.field[cords[0]][cords[1]] = false;
        this.blockElements();
        this.newDirection();
    }

    moveUp(item, button, cords) {
        item.style.top = `${button[3] - this.margin}px`;
        this.field[cords[0]][cords[1]][3] -= this.margin;
        this.field[cords[0] - 1][cords[1]] = this.field[cords[0]][cords[1]];
        this.field[cords[0]][cords[1]] = false;
        this.blockElements();
        this.newDirection();
    }

    moveLeft(item, button, cords) {
        item.style.left = `${button[2] - this.margin}px`;
        this.field[cords[0]][cords[1]][2] -= this.margin;
        this.field[cords[0]][cords[1] - 1] = this.field[cords[0]][cords[1]];
        this.field[cords[0]][cords[1]] = false;
        this.blockElements();
        this.newDirection();
    }

    saveGame() {
        localStorage.setItem('steps', this.steps);
        localStorage.setItem('time', this.timestamp);
    }

    interval(id) {
        const time = document.getElementById(id);
        return setInterval(() => {
            this.timestamp += 1;
            this.parseTime(time);
        }, 1000);
    }

    parseTime(time) {
        let minutes = Math.floor(this.timestamp / 60);
        let seconds = this.timestamp % 60;
        if (seconds < 10) seconds = '0' + seconds;
        if (minutes < 10) minutes = '0' + minutes;
        time.innerHTML = `${minutes}:${seconds}`;
    }

    fromStorage(timeId, stepsId, stopId) {
        this.parseTime(document.getElementById(timeId));
        document.getElementById(stepsId).innerHTML = this.steps;
        if (this.steps !== 0 || this.timestamp !== 0) {
            document.getElementById(stopId).classList.add('resume');
            document.getElementById(stopId).innerHTML = 'Resume';
        }
    }
}
