
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
    constructor(cols = 4, id = 'game') {
        this.id = id;
        this.cols = cols;
        this.count = cols * cols - 1;
        this.steps = 0;
        this.createEvent(id);
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
                    //const span = document.createElement('span');
                    const ranNum = this.randomNumber(randomNumbers)
                    randomNumbers.push(ranNum);
                    //span.innerHTML = ranNum;
                    //span.style.fontSize = fontSize;
                    //span.id = ranNum;
                    item.innerHTML = ranNum;
                    item.style.fontSize = fontSize;
                    item.id = ranNum;
                    item.style.width = `${sizeItem}px`;
                    item.style.height = `${sizeItem}px`;
                    item.style.left = `${this.margin * j}px`;
                    item.style.top = `${this.margin * i}px`;
                    //item.append(span);
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
            document.getElementById(this.id).onclick = null;
            document.getElementById(this.id).onmousedown = null;
            document.getElementById(this.id).onmousemove = null;
            document.getElementById(this.id).onmouseup = null;
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
        this.createEvent();
        item.style.top = `${button[3] + this.margin}px`;
        this.field[cords[0]][cords[1]][3] += this.margin;
        this.field[cords[0] + 1][cords[1]] = this.field[cords[0]][cords[1]];
        this.field[cords[0]][cords[1]] = false;
        this.blockElements();
        this.newDirection();

        // let interval = setInterval(() => {
        //     top += 1;
        //     item.style.top = `${top}px`;
        //     if (this.margin + button[3] < top) {
        //         clearInterval(interval);
        //         this.field[cords[0]][cords[1]][3] += this.margin;
        //         this.field[cords[0] + 1][cords[1]] = this.field[cords[0]][cords[1]];
        //         this.field[cords[0]][cords[1]] = false;
        //         this.blockElements();
        //         this.newDirection();
        //         this.createEvent();
        //     }
        // }, 6);
    }

    moveRight(item, button, cords) {
        this.createEvent();
        item.style.left = `${button[2] + this.margin}px`;
        this.field[cords[0]][cords[1]][2] += this.margin;
        this.field[cords[0]][cords[1] + 1] = this.field[cords[0]][cords[1]];
        this.field[cords[0]][cords[1]] = false;
        this.blockElements();
        this.newDirection();



        // let right = button[2];
        // let interval = setInterval(() => {
        //     right += 1;
        //     item.style.left = `${right}px`;
        //     if (this.margin + button[2] < right) {
        //         clearInterval(interval);
        //         this.field[cords[0]][cords[1]][2] += this.margin;
        //         this.field[cords[0]][cords[1] + 1] = this.field[cords[0]][cords[1]];
        //         this.field[cords[0]][cords[1]] = false;
        //         this.blockElements();
        //         this.newDirection();
        //         this.createEvent();
        //     }
        // }, 4);
    }

    moveUp(item, button, cords) {
        this.createEvent();
        item.style.top = `${button[3] - this.margin}px`;
        this.field[cords[0]][cords[1]][3] -= this.margin;
        this.field[cords[0] - 1][cords[1]] = this.field[cords[0]][cords[1]];
        this.field[cords[0]][cords[1]] = false;
        this.blockElements();
        this.newDirection();



        // let up = button[3];
        // let interval = setInterval(() => {
        //     up -= 1;
        //     item.style.top = `${up}px`;
        //     if (button[3] - this.margin > up) {
        //         clearInterval(interval);
        //         this.field[cords[0]][cords[1]][3] -= this.margin;
        //         this.field[cords[0] - 1][cords[1]] = this.field[cords[0]][cords[1]];
        //         this.field[cords[0]][cords[1]] = false;
        //         this.blockElements();
        //         this.newDirection();
        //         this.createEvent();
        //     }
        // }, 4);
    }

    moveLeft(item, button, cords) {
        this.createEvent();
        item.style.left = `${button[2] - this.margin}px`;
        this.field[cords[0]][cords[1]][2] -= this.margin;
        this.field[cords[0]][cords[1] - 1] = this.field[cords[0]][cords[1]];
        this.field[cords[0]][cords[1]] = false;
        this.blockElements();
        this.newDirection();


        // let left = button[2];
        // let interval = setInterval(() => {
        //     left -= 1;
        //     item.style.left = `${left}px`;
        //     if (button[2] - this.margin > left) {
        //         clearInterval(interval);
        //         this.field[cords[0]][cords[1]][2] += this.margin;
        //         this.field[cords[0]][cords[1] - 1] = this.field[cords[0]][cords[1]];
        //         this.field[cords[0]][cords[1]] = false;
        //         this.blockElements();
        //         this.newDirection();
        //         this.createEvent();
        //     }
        // }, 4);
    }
}
