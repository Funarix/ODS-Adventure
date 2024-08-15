document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('execute-btn').addEventListener('click', executeCommands);

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

function startGame() {
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';

    const commandButtons = document.querySelectorAll('.command-btn');
    commandButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentSlot) {
                // Substituir o comando no slot selecionado
                updateCommandSlot(currentSlot, btn.getAttribute('data-command'));
                currentSlot = null; // Resetar slot selecionado
            } else {
                // Adicionar comando à lista e ao feedback
                addCommand(btn.getAttribute('data-command'));
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
                slot.style.backgroundImage = '';
                // Remove o comando da lista
                commands.splice(commands.indexOf(slot.dataset.command), 1);
            }
        });
    });

    populateGrid();
    animateTarget();
    positionTarget('D', 3);  // Posicionando o target na coordenada D3
}

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
    commands.push(command);
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
            }

            index++;
        } else {
            clearInterval(animationInterval);
            clearInterval(animationFrame); // Stop the animation
            character.src = 'assets/player.png'; // Reset to the first frame

            if (position.top === parseInt(target.style.top, 10) && position.left === parseInt(target.style.left, 10)) {
                feedback.textContent = `Você atingiu o objetivo!`;
                
                // Remover o texto após 5 segundos
                setTimeout(() => {
                    feedback.textContent = '';
                }, 5000);
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
