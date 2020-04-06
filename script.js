
window.addEventListener('load', () => {
    createHtml();
    const puzzle = new Puzzle();
    puzzle.create();

    document.getElementById('select').addEventListener('change', () => {
        puzzle.create(Number(document.getElementById('select').value[0]));
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
    label.innerHTML = '0';
    section.append(label);
    label = document.createElement('label');
    label.className = 'label';
    label.innerHTML = 'Time:';
    section.append(label);
    label = document.createElement('label');
    label.className = 'time';
    label.innerHTML = '00:00';
    section.append(label);
    header.append(section);

    const main = document.createElement('main');
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
    constructor(cols = 4) {
        this.cols = cols;
        this.count = cols * cols - 1;
        this.steps = 0;
    }

    create(size = 4, id = 'game', width = 400) {
        this.field = new Array(size).fill(false).map(elem => elem = new Array(size).fill(false));
        this.cols = size;
        this.count = size * size - 1;
        let fontSize = '50px';
        if (size > 5) fontSize = '30px';
        const game = document.getElementById(id);
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
                    const span = document.createElement('span');
                    const ranNum = this.randomNumber(randomNumbers)
                    randomNumbers.push(ranNum);
                    span.innerHTML = ranNum;
                    span.style.fontSize = fontSize;
                    item.id = ranNum;
                    item.style.width = `${sizeItem}px`;
                    item.style.height = `${sizeItem}px`;
                    item.style.left = `${this.margin * j}px`;
                    item.style.top = `${this.margin * i}px`;
                    item.append(span);
                    game.append(item);
                    this.field[i][j] = [ranNum, false];
                }
            }
        }
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
                    if (i - 1 > 0) this.field[i - 1][j][1] = 'right';
                    if (i + 1 < this.cols) this.field[i + 1][j][1] = 'left';
                    if (j - 1 > 0) this.field[i][j - 1][1] = 'up';
                    if (j + 1 < 0) this.field[i][j + 1][1] = 'down';
                }
            }
        }
    }
}
