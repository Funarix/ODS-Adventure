document.getElementById('execute-btn').addEventListener('click', executeCommands);

const buttonPressSound = new Audio('Assets/audio/Game/button-pressed.mp3');
buttonPressSound.volume = 1.0; // Define o volume máximo

const commands = [];
const maxCommands = 6; // Número máximo de comandos permitidos
const character = document.getElementById('character');
const target = document.getElementById('target');
const feedback = document.getElementById('feedback');
const commandSlots = document.querySelectorAll('.command-slot');
const backgroundMusic = document.getElementById('background-music');
const soundControl = document.getElementById('sound-control');

let isSoundOn = false; // Estado do som
let animationInterval;
let animationFrame;
let targetAnimationFrame;
let initialCharacterPosition = null; // Posição inicial da rodada


const initialPosition = { top: 0, left: 0 };
let currentSlot = null; // Armazena o botão atual clicado para substituição
let lastCommand = null; // Armazena o último comando adicionado

// Inicia o jogo automaticamente quando a página carrega
window.onload = function() {
    startGame();
};

function startGame() {
    document.getElementById('game-screen').style.display = 'block';


    

    // Inicia a reprodução da música de fundo
    const backgroundMusic = document.getElementById('background-music');
    backgroundMusic.play();

    const commandButtons = document.querySelectorAll('.command-btn');
    commandButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentSlot) {
                // Substituir comando no slot selecionado
                updateCommandSlot(currentSlot, btn.getAttribute('data-command'));
                currentSlot = null;
                lastCommand = btn.getAttribute('data-command');
            } else {
                // Adicionar novo comando
                addCommand(btn.getAttribute('data-command'));
                lastCommand = btn.getAttribute('data-command');
            }
        });
    });

    commandSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            if (slot.style.backgroundImage) {
                currentSlot = slot;
                const commandToRemove = slot.dataset.command;
                slot.style.backgroundImage = '';
                slot.dataset.command = '';
                const commandIndex = commands.indexOf(commandToRemove);
                if (commandIndex !== -1) {
                    commands.splice(commandIndex, 1);
                }
                lastCommand = commandToRemove;
            }
        });
    });

    populateGrid();
    animateTarget();
    resetRandomPositions(); // Posiciona o personagem e a moeda de forma aleatória
}

function playButtonPressSound() {
    buttonPressSound.currentTime = 0; // Reinicia o som para evitar atrasos
    buttonPressSound.play();
}

function populateGrid() {
    const gridContainer = document.getElementById('grid-container');
    gridContainer.innerHTML = ''; // Limpa qualquer célula existente

    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            const cell = document.createElement('div');
            cell.dataset.row = row;
            cell.dataset.col = String.fromCharCode(65 + col); // A = 65, B = 66, ..., J = 74
            gridContainer.appendChild(cell);
        }
    }
}

function getCellPosition(row, col) {
    return {
        top: row * 40,
        left: (col.charCodeAt(0) - 65) * 40
    };
}

function addCommand(command) {
    if (commands.length < maxCommands) {
        commands.push(command);
        const emptySlot = Array.from(commandSlots).find(slot => !slot.style.backgroundImage);
        if (emptySlot) {
            emptySlot.style.backgroundImage = `url('assets/system/${command} arrow.png')`;
            emptySlot.dataset.command = command;
        }
    }
}

function updateCommandSlot(slot, command) {
    slot.style.backgroundImage = `url('assets/system/${command} arrow.png')`;
    slot.dataset.command = command;
    if (commands.length < maxCommands) {
        commands.push(command);
    }
}

// Função para calcular a distância de Manhattan entre duas posições
function manhattanDistance(pos1, pos2) {
    return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
}

// Função para gerar uma posição aleatória dentro da matriz
function getRandomPosition() {
    return {
        row: Math.floor(Math.random() * 10),
        col: Math.floor(Math.random() * 10)
    };
}



// Gera todas as posições possíveis a uma distância específica
function getPositionsAtDistance(start, distance) {
    const positions = [];

    for (let rowOffset = -distance; rowOffset <= distance; rowOffset++) {
        const colOffset = distance - Math.abs(rowOffset);
        const possiblePositions = [
            { row: start.row + rowOffset, col: start.col + colOffset },
            { row: start.row + rowOffset, col: start.col - colOffset }
        ];

        possiblePositions.forEach(pos => {
            if (pos.row >= 0 && pos.row < 10 && pos.col >= 0 && pos.col < 10) {
                positions.push(pos);
            }
        });
    }

    return positions;
}

// Função para reposicionar o personagem e a moeda com base na distância máxima
function resetRandomPositions() {
    const characterPosition = getRandomPosition();
    const possibleTargetPositions = getPositionsAtDistance(characterPosition, 6);
    const targetPosition = possibleTargetPositions[Math.floor(Math.random() * possibleTargetPositions.length)];

    // Atualiza a posição do personagem no DOM
    const characterPositionPixels = getCellPosition(characterPosition.row, String.fromCharCode(65 + characterPosition.col));
    character.style.top = `${characterPositionPixels.top}px`;
    character.style.left = `${characterPositionPixels.left}px`;

    // Atualiza a posição da moeda no DOM
    const targetPositionPixels = getCellPosition(targetPosition.row, String.fromCharCode(65 + targetPosition.col));
    target.style.top = `${targetPositionPixels.top}px`;
    target.style.left = `${targetPositionPixels.left}px`;
}


function executeCommands() {
    // Usa a posição atual do personagem como ponto de partida
    let position = {
        top: parseInt(character.style.top, 10),
        left: parseInt(character.style.left, 10)
    };
    let index = 0;

    animationInterval = setInterval(() => {
        if (index < commands.length) {
            let newPosition = { ...position };

            switch (commands[index]) {
                case 'up':
                    newPosition.top -= 40;
                    character.classList.remove('flip-horizontal');
                    break;
                case 'down':
                    newPosition.top += 40;
                    character.classList.remove('flip-horizontal');
                    break;
                case 'left':
                    newPosition.left -= 40;
                    character.classList.add('flip-horizontal');
                    break;
                case 'right':
                    newPosition.left += 40;
                    character.classList.remove('flip-horizontal');
                    break;
            }

            if (isValidPosition(newPosition)) {
                position = newPosition; // Atualiza a posição do personagem
                character.style.top = `${position.top}px`;
                character.style.left = `${position.left}px`;
                animateCharacter();
            } else {
                // Se a posição não é válida, adiciona o efeito visual
                character.classList.add('blink-border');
                setTimeout(() => character.classList.remove('blink-border'), 2000);
            }

            index++;
        } else {
            clearInterval(animationInterval);
            clearInterval(animationFrame);
            character.src = 'assets/player.png';

            // Verifica se o personagem chegou à posição do alvo (moeda)
            if (
                position.top === parseInt(target.style.top, 10) &&
                position.left === parseInt(target.style.left, 10)
            ) {
                playCoinSound();
                moveCoinUp(); // Mover moeda para célula acima
                speedUpTargetAnimation(); // Acelera a animação da moeda

                // Adiciona atraso e redireciona para a próxima fase
                setTimeout(() => {
                    window.location.href = "tutorial.html"; // Redireciona para a próxima fase
                }, 2000);
            } else {
                feedback.textContent = 'Tente novamente!';
                character.classList.add('blink');
                setTimeout(() => {
                    character.classList.remove('blink');
                    feedback.textContent = '';
                    resetCharacterPosition();
                }, 2000);
                commands.length = 0;
                commandSlots.forEach(slot => (slot.style.backgroundImage = ''));
            }
        }
    }, 500);
}



function moveCoinUp() {
    const targetTop = parseInt(target.style.top, 10);
    const newTargetTop = targetTop - 40;  // Movimenta a moeda uma célula acima (40px)

    if (newTargetTop >= 0) {  // Garante que a moeda não vá para fora da área do jogo
        target.style.top = `${newTargetTop}px`;
    }
}

function speedUpTargetAnimation() {
    clearInterval(targetAnimationFrame); // Para a animação atual

    let frame = 0;
    const targetAnimationFrames = ['assets/target.png', 'assets/target2.png', 'assets/target3.png', 'assets/target4.png'];

    // Acelera a animação para 50ms por quadro (duas vezes mais rápido)
    targetAnimationFrame = setInterval(() => {
        target.src = targetAnimationFrames[frame];
        frame = (frame + 1) % targetAnimationFrames.length;
    }, 50);

    // Após 2 segundos, retorna a velocidade normal da animação
    setTimeout(() => {
        clearInterval(targetAnimationFrame);
        animateTarget(); // Volta à animação original
    }, 2000);
}


function isValidPosition(position) {
    const maxTop = 360;
    const maxLeft = 360;

    return position.top >= 0 && position.top <= maxTop && position.left >= 0 && position.left <= maxLeft;
}










function resetCharacterPosition() {
    setTimeout(() => {
        // Renasce na posição inicial dinâmica da rodada
        character.style.top = `${currentInitialPosition.top}px`;
        character.style.left = `${currentInitialPosition.left}px`;
        character.classList.remove('flip-horizontal'); // Remove o flip ao resetar
    }, 500); // Mantém o delay antes de resetar a posição
}


function animateCharacter() {
    let frame = 0;
    const animationFrames = ['assets/player.png', 'assets/player2.png', 'assets/player3.png', 'assets/player4.png'];

    if (animationFrame) {
        clearInterval(animationFrame); // Clear any existing animation
    }

    animationFrame = setInterval(() => {
        character.src = animationFrames[frame];
        frame = (frame + 1) % animationFrames.length;
    }, 125);
}

function animateTarget() {
    let frame = 0;
    const targetAnimationFrames = ['assets/target.png', 'assets/target2.png', 'assets/target3.png', 'assets/target4.png'];

    targetAnimationFrame = setInterval(() => {
        target.src = targetAnimationFrames[frame];
        frame = (frame + 1) % targetAnimationFrames.length;
    }, 100);  // Change interval to 100 ms for faster animation
}

function playCoinSound() {
    const coinSound = new Audio('assets/audio/Game/coin.mp3');
    let playCount = 0;

    const interval = setInterval(() => {
        coinSound.play();
        playCount++;
        if (playCount >= 3) {
            clearInterval(interval);
        }
    }, 100); // Interval de 0.1 segundos entre os toques do som
}

function resetGame() {
    setTimeout(() => {
        // Reiniciar o estado inicial do jogo
        character.style.top = `${initialPosition.top}px`;
        character.style.left = `${initialPosition.left}px`;
        character.classList.remove('flip-horizontal'); // Remove o flip ao resetar
        commands.length = 0; // Limpa os comandos
        commandSlots.forEach(slot => slot.style.backgroundImage = ''); // Limpa os slots
        feedback.textContent = ''; // Limpa o feedback

        // Posiciona o target em uma nova célula aleatória após o reset
        positionRandomTarget();
    }, 1000); // Delay antes de reiniciar o jogo
}


const executeBtn = document.getElementById('execute-btn');

executeBtn.addEventListener('mousedown', () => {
    executeBtn.style.transform = 'scale(0.9)'; // Reduz o botão ligeiramente
});

executeBtn.addEventListener('mouseup', () => {
    executeBtn.style.transform = 'scale(1)'; // Retorna ao tamanho original
});

executeBtn.addEventListener('mouseleave', () => {
    executeBtn.style.transform = 'scale(1)'; // Garante que o botão volta ao tamanho original caso o mouse saia
});

const commandButtons = document.querySelectorAll('.command-btn');

// Função para aplicar a animação de clique a qualquer botão
function addClickAnimation(button) {
    button.addEventListener('mousedown', () => {
        button.style.transform = 'scale(0.9)'; // Reduz o botão ligeiramente
        playButtonPressSound(); // Toca o som quando o botão é pressionado
    });

    button.addEventListener('mouseup', () => {
        button.style.transform = 'scale(1)'; // Retorna ao tamanho original
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)'; // Garante que o botão volta ao tamanho original caso o mouse saia
    });
}

// Aplicando a animação de clique para todas as setas
commandButtons.forEach(button => {
    addClickAnimation(button);
});

// Alternar som ao clicar no ícone
soundControl.addEventListener('click', () => {
    if (isSoundOn) {
        backgroundMusic.pause(); // Pausa a música
        soundControl.src = 'assets/system/soundOff.png'; // Muda para ícone de som desligado
    } else {
        backgroundMusic.play(); // Toca a música
        backgroundMusic.loop = true; // Configura a música para tocar em loop
        soundControl.src = 'assets/system/soundOn.png'; // Muda para ícone de som ligado
    }
    isSoundOn = !isSoundOn; // Alterna o estado do som
});










