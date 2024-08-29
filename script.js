document.getElementById('execute-btn').addEventListener('click', executeCommands);


const buttonPressSound = new Audio('Assets/audio/Game/button-pressed.mp3');
buttonPressSound.volume = 1.0; // Define o volume máximo


const commands = [];
const maxCommands = 6; // Número máximo de comandos permitidos
const character = document.getElementById('character');
const target = document.getElementById('target');
const feedback = document.getElementById('feedback');
const commandSlots = document.querySelectorAll('.command-slot');

let animationInterval;
let animationFrame;
let targetAnimationFrame;

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
                // Se há um slot selecionado, substitua a imagem da seta e mova o personagem
                updateCommandSlot(currentSlot, btn.getAttribute('data-command'));
                currentSlot = null; // Resetar slot selecionado
                lastCommand = btn.getAttribute('data-command'); // Atualizar o último comando
            } else {
                // Se não há um slot selecionado, adicione o comando à lista
                addCommand(btn.getAttribute('data-command'));
                lastCommand = btn.getAttribute('data-command'); // Atualizar o último comando
            }
        });
    });

    // Configurar eventos de clique nos botões abaixo da game area
    commandSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            if (slot.style.backgroundImage) {
                // Se o slot já tiver um comando, marque-o como o slot atual para substituição
                currentSlot = slot;
                // Remove a imagem do slot selecionado
                const commandToRemove = slot.dataset.command;
                slot.style.backgroundImage = '';
                slot.dataset.command = ''; // Remove o comando do dataset
                // Remove o comando da lista
                const commandIndex = commands.indexOf(commandToRemove);
                if (commandIndex !== -1) {
                    commands.splice(commandIndex, 1);
                }
                lastCommand = commandToRemove; // Atualizar o último comando
            }
        });
    });

    populateGrid();
    animateTarget();
    positionTarget('D', 3);  // Posicionando o target na coordenada D3
}

function playButtonPressSound() {
    buttonPressSound.currentTime = 0; // Reinicia o som para evitar atrasos
    buttonPressSound.play();
}



// Outras funções permanecem as mesmas

function populateGrid() {
    const gridContainer = document.getElementById('grid-container');
    gridContainer.innerHTML = ''; // Limpar qualquer célula existente

    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            const cell = document.createElement('div');
            cell.dataset.row = row;
            cell.dataset.col = String.fromCharCode(65 + col); // A = 65, B = 66, ..., J = 74
            gridContainer.appendChild(cell);
        }
    }
}

// ... Mantenha o restante do código JavaScript inalterado


function getCellPosition(row, col) {
    return {
        top: row * 40,
        left: (col.charCodeAt(0) - 65) * 40 // Convertendo a letra para índice (A=0, B=1, ..., J=9)
    };
}

function positionTarget(col, row) {
    const position = getCellPosition(row, col);
    target.style.top = `${position.top}px`;
    target.style.left = `${position.left}px`;
}

function addCommand(command) {
    if (commands.length < maxCommands) {
        commands.push(command);

        // Encontra o primeiro slot vazio para adicionar o novo comando
        const emptySlot = Array.from(commandSlots).find(slot => !slot.style.backgroundImage);
        if (emptySlot) {
            emptySlot.style.backgroundImage = `url('assets/system/${command} arrow.png')`; // Adiciona a nova imagem
            emptySlot.dataset.command = command; // Armazena o comando no dataset
        }
    }
}

function updateCommandSlot(slot, command) {
    // Atualiza o slot com o novo comando
    slot.style.backgroundImage = `url('assets/system/${command} arrow.png')`; // Atualiza a imagem
    slot.dataset.command = command; // Atualiza o comando no dataset
    // Adiciona o novo comando à lista
    if (commands.length < maxCommands) {
        commands.push(command);
    }
}

function executeCommands() {
    let position = { ...initialPosition };
    let index = 0;

    character.style.top = `${initialPosition.top}px`;
    character.style.left = `${initialPosition.left}px`;

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
                position = newPosition;
                character.style.top = `${position.top}px`;
                character.style.left = `${position.left}px`;
                animateCharacter();
            } else {
                // Aplica o efeito de fantasma piscando ao colidir com a borda
                character.classList.add('blink-border');

                setTimeout(() => {
                    character.classList.remove('blink-border');
                }, 2000); // Efeito de fantasma piscando dura 2 segundos
            }

            index++;
        } else {
            clearInterval(animationInterval);
            clearInterval(animationFrame); // Stop the animation
            character.src = 'assets/player.png'; // Reset to the first frame

            if (position.top === parseInt(target.style.top, 10) && position.left === parseInt(target.style.left, 10)) {
                playCoinSound(); // Tocar o som da moeda
                resetGame(); // Retornar ao estado inicial
            } else {
                feedback.textContent = 'Tente novamente!';
                
                // Adiciona a classe de piscar ao personagem
                character.classList.add('blink');
                
                // Remove a classe de piscar após 2 segundos
                setTimeout(() => {
                    character.classList.remove('blink');
                    feedback.textContent = '';
                    resetCharacterPosition();
                }, 2000);

                // Remover a mensagem "Tente novamente!" após 5 segundos
                setTimeout(() => {
                    feedback.textContent = '';
                }, 5000);

                commands.length = 0; // Clear commands
                commandSlots.forEach(slot => slot.style.backgroundImage = ''); // Clear slots
            }
        }
    }, 500);
}

function isValidPosition(position) {
    const maxTop = 360;
    const maxLeft = 360;

    return position.top >= 0 && position.top <= maxTop && position.left >= 0 && position.left <= maxLeft;
}

function resetCharacterPosition() {
    setTimeout(() => {
        character.style.top = `${initialPosition.top}px`;
        character.style.left = `${initialPosition.left}px`;
        character.classList.remove('flip-horizontal'); // Remove o flip ao resetar
    }, 500); // Add a delay before resetting position
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
        commands.length = 0; // Clear commands
        commandSlots.forEach(slot => slot.style.backgroundImage = ''); // Clear slots
        feedback.textContent = ''; // Clear feedback
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