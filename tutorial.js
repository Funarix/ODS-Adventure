document.addEventListener("DOMContentLoaded", () => {
    // Criar elemento da mão
    const handPointer = document.createElement("img");
    handPointer.src = "Assets/system/hand.png"; // Ajuste o nome se necessário
    handPointer.alt = "Indicador de clique";
    handPointer.style.position = "absolute";
    handPointer.style.width = "50px"; // Ajuste conforme necessário
    handPointer.style.pointerEvents = "none"; // Evita interferência nos cliques
    handPointer.style.transition = "transform 0.3s ease-in-out";

    // Identificar a posição dos botões de comandos
    const firstCommandButton = document.querySelector(".command-btn");
    if (!firstCommandButton) return;

    const rect = firstCommandButton.getBoundingClientRect();
    const offsetX = -140; // Distância da mão para os botões
    const offsetY = 15;  // Ajuste vertical

    handPointer.style.top = `${rect.top + window.scrollY + offsetY}px`;
    handPointer.style.left = `${rect.right + window.scrollX + offsetX}px`;

    document.body.appendChild(handPointer);

    // Função de animação de balanço no eixo X
    let direction = 1;
    function animateHand() {
        handPointer.style.transform = `translateX(${direction * 10}px)`;
        direction *= -1;
        setTimeout(animateHand, 500); // Alterna a posição a cada 0.5s
    }

    animateHand(); // Inicia a animação
});


document.addEventListener("DOMContentLoaded", function () {
    const instructions = document.getElementById("instructions");
    const commandButtons = document.querySelectorAll(".command-btn");
    const executeBtn = document.getElementById("execute-btn");
    const character = document.getElementById("character");
    const target = document.getElementById("target");

    

    let stepIndex = 0; // Índice do passo atual do tutorial

    const tutorialSteps = [
    "Clique em uma seta para escolher um movimento!",  
    "Escolha a direção certa para o personagem seguir!",  
    "Ótimo! Continue adicionando os comandos agora!",  
    "Continue, precisamos alcançar a moeda no final!",  
    "Estamos quase lá! Falta pouco para terminar!",  
    "Adicione o último comando para finalizar tudo!",  
    "Agora, pressione 'Executar' para testar tudo!",  
        // A última mensagem será exibida somente quando o personagem pegar a moeda.
    ];

    // Exibir a primeira instrução ao carregar a página
    instructions.textContent = tutorialSteps[stepIndex];

    // Atualizar instruções conforme o usuário clica nos botões
    commandButtons.forEach(button => {
        button.addEventListener("click", () => {
            if (stepIndex < tutorialSteps.length - 1) {
                stepIndex++; // Avança para o próximo passo
                instructions.textContent = tutorialSteps[stepIndex]; // Atualiza o texto na tela
            }
        });
    });

    // Atualiza o texto ao clicar no botão "Executar"
    executeBtn.addEventListener("click", () => {
        if (stepIndex < tutorialSteps.length - 1) {
            stepIndex++;
            instructions.textContent = tutorialSteps[stepIndex];
        }
    });

    // Verifica se o personagem pegou a moeda
    function checkCharacterPosition() {
        const characterTop = parseInt(character.style.top, 10);
        const characterLeft = parseInt(character.style.left, 10);
        const targetTop = parseInt(target.style.top, 10);
        const targetLeft = parseInt(target.style.left, 10);

        if (characterTop === targetTop && characterLeft === targetLeft) {
            instructions.textContent = "Parabéns! Você finalizou todo o tutorial!!!!!!";

            setTimeout(() => {
                window.location.href = "ods1.html";
            }, 2000);
        }
    }


    

    // Monitorar a posição do personagem a cada movimento
    const observer = new MutationObserver(checkCharacterPosition);
    observer.observe(character, { attributes: true, attributeFilter: ["style"] });
});

