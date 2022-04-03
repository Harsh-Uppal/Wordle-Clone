document.body.addEventListener('keyup', keyPressed)

const gridElem = document.querySelector('.wordle-grid'), grid = [];
const winScreen = document.querySelector('.winModal');
const loseScreen = document.querySelector('.loseModal');
const cols = 5, rows = 6;
var keyboardKeys = {};
var solution = randomWord(), enteredWord = '';
var r = 0, c = 0, lastC = 0;
var won = false;
var wins = 0, loses = 0;

for (let row = 0; row < 6; row++) {
    grid.push([]);
    for (let col = 0; col < 5; col++) {
        const letterHolder = document.createElement('div');
        gridElem.appendChild(letterHolder);

        grid[row].push(letterHolder);
    }
}

document.querySelectorAll('.keyboard .key, .keyboard .large-key').forEach(key => {
    key.addEventListener('click', () => keyPressed({
        keyCode: key.getAttribute("keyCode"),
        key: key.textContent
    }));

    keyboardKeys[key.textContent] = key;
});

const addToHomescreen = document.querySelector('.save-to-homescreen');
const addBtn = document.querySelector('.save-to-homescreen>button');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    const deferredPrompt = e;
    addToHomescreen.style.transform = 'none';
  
    addBtn.addEventListener('click', () => {
      addToHomescreen.style.transform = 'translate(100%, 0)';
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
          deferredPrompt = null;
        });
    });
  });

function keyPressed({ keyCode, key }) {
    if (keyCode == 13 && c > cols - 1)
        wordSubmitted();

    if (keyCode < 65 || keyCode > 90) {
        if (keyCode == 8 && c > 0) {
            c--;
            grid[r][c].textContent = '';
            enteredWord = enteredWord.slice(0, enteredWord.length - 1);
        }

        return;
    }

    if (c > cols - 1)
        return;

    enteredWord += grid[r][c].textContent = key.toUpperCase();

    c++;
}

function randomWord() {
    return wordData[Math.floor(Math.random() * wordData.length)];
}

function wordSubmitted() {
    if (wordData.find(word => word.toUpperCase() == enteredWord) == undefined) {
        showPopup('Not in Words List');
        return;
    }

    if (enteredWord == solution.toUpperCase())
        win();
    else if (r == cols)
        lose();
    else {
        let lettersFound = {};

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < cols; j++) {
                if (j <= lettersFound[enteredWord[i]])
                    continue;

                if (enteredWord[i] == solution[j].toUpperCase()) {
                    grid[r][i].style.backgroundColor =
                        keyboardKeys[enteredWord[i]].style.backgroundColor = i == j ? '#0F05' : '#FF05';
                    lettersFound[enteredWord[i]] = j;
                    break;
                }
            }

            if (grid[r][i].style.backgroundColor == '') {
                grid[r][i].style.backgroundColor = '#FFF3';
                keyboardKeys[enteredWord[i]].style.backgroundColor = '#FFF1';
            }
        }

        r++;
        c = 0;
        enteredWord = '';
    }
}

function win() {
    wins++;
    winScreen.showModal();
    document.querySelector('.winModal #attemptCount').textContent = r + 1;
    document.querySelector('.winModal #solution').textContent = solution;
    won = true;
}

function lose() {
    loses++;
    loseScreen.showModal();
    document.querySelector('.loseModal #solution').textContent = solution;
}

function closeModal() {
    (won ? winScreen : loseScreen).close();

    solution = randomWord();

    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
            grid[r][c].textContent = '';
            grid[r][c].style.backgroundColor = '';
        }

    r = c = 0;

    //Resetting keyboard keys
    for (const key in keyboardKeys)
        keyboardKeys[key].style.backgroundColor = '';
}

function showPopup(text) {
    const popup = document.querySelector('.popup');
    popup.textContent = text;
    if (popup.style.display == 'none') {
        popup.style.display = '';
        setTimeout(() =>
            popup.style.display = 'none', 2500);
    }
}

function stats() {
    if (wins == 0 && loses == 0) {
        showPopup('Play a game first to see your stats');
        return;
    }

    const circle = document.querySelector("#statsPiechart circle");
    circle.style.display = (wins == 0 || loses == 0) ? '' : 'none';
    circle.setAttributeNS(null, "fill", loses == 0 ? 'green' : 'red');

    const r = '150';
    const svg = document.querySelector('#statsPiechart');
    const svgCenterX = svg.getAttribute("width") / 2;
    const svgCenterY = svg.getAttribute("height") / 2;
    const winSection = document.querySelector('#statsPiechart path[fill="green"]');
    const loseSection = document.querySelector('#statsPiechart path[fill="red"]');

    loseSection.style.display = winSection.style.display = wins != 0 && loses != 0 ? '' : 'none';

    if (wins != 0 && loses != 0) {
        //Win section

        let fromAngle = 0;
        let toAngle = wins / (wins + loses) * Math.PI * 2;

        let fromCoordX = svgCenterX + r * Math.cos(fromAngle);
        let fromCoordY = svgCenterY + r * Math.sin(fromAngle);
        let toCoordX = svgCenterX + r * Math.cos(toAngle);
        let toCoordY = svgCenterY + r * Math.sin(toAngle);
        let d = `M${svgCenterX},${svgCenterY} L${fromCoordX},${fromCoordY} A${r},${r} 0 ${toAngle > Math.PI ? 1 : 0},1 ${toCoordX},${toCoordY}z`
        winSection.setAttributeNS(null, "d", d);

        //Lose section

        fromAngle = toAngle;
        toAngle = Math.PI * 2;

        fromCoordX = svgCenterX + r * Math.cos(fromAngle);
        fromCoordY = svgCenterY + r * Math.sin(fromAngle);
        toCoordX = svgCenterX + r * Math.cos(toAngle);
        toCoordY = svgCenterY + r * Math.sin(toAngle);
        d = `M${svgCenterX},${svgCenterY} L${fromCoordX},${fromCoordY} A${r},${r} 0 ${toAngle > Math.PI ? 1 : 0},1 ${toCoordX},${toCoordY}z`
        loseSection.setAttributeNS(null, "d", d);
    }

    document.querySelector('.stats').showModal();
}

function share() {
    navigator.clipboard.writeText("harsh-uppal.github.io/Wordle");
    showPopup('Link copied');
}

function closeModal(selector) {
    document.querySelector(selector).close();
}

function help() {
    document.location = './help.html';
}