document.addEventListener("DOMContentLoaded", function () {
    if (window.chatInitialized) return;
    window.chatInitialized = true;

    let cpf = "";
    let chatBox = document.getElementById("chat-box");
    let userInput = document.getElementById("user-input");
    let fileInput = document.getElementById("file-input");
    let attachButton = document.getElementById("attach-button");
    let sendButton = document.getElementById("send-button");
    let currentContext = "";
    let lastOptionSelected = "";

    const usersData = {
        "15347693665": {
            nome: "Luiza",
            tipoCarga: "Animais.",
            embarqueLocal: "Uberlândia.",
            embarqueResponsavel: "Maria.",
            desembarqueLocal: "Londrina.",
            desembarqueResponsavel: "Carmen.",
            paradasProgramadas: "Sem paradas."
        }
    };

    function verificarStatus() {
        console.log("Verificando status de conexão...");
        const statusDot = document.getElementById('status-dot');
        const statusText = document.getElementById('status-text');
        const statusIndicator = document.getElementById('status-indicator');

        if (!statusDot || !statusText) {
            console.error("Elementos de status não encontrados no DOM");
            return;
        }

        const isOnline = navigator.onLine;
        if (statusIndicator) {
            statusIndicator.style.display = 'flex';
        }

        if (isOnline) {
            statusDot.classList.remove('offline');
            statusDot.classList.add('online');
            statusText.textContent = 'Você está online';
        } else {
            statusDot.classList.remove('online');
            statusDot.classList.add('offline');
            statusText.textContent = 'Você está offline';
        }

        if (statusIndicator) {
            statusIndicator.classList.add('status-updated');
            setTimeout(() => {
                statusIndicator.classList.remove('status-updated');
            }, 1000);
        }
    }

    window.addEventListener('online', () => {
        console.log('Conexão restaurada');
        verificarStatus();
    });

    window.addEventListener('offline', () => {
        console.log('Conexão perdida');
        verificarStatus();
    });

    verificarStatus();
    setTimeout(verificarStatus, 500);
  });
    
    function enviarParaFormsubmit(data, contexto) {
    const formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key]);
    }
    formData.append("_subject", `📌 Atualizações de ${contexto} - CPF ${data.cpf}`);
    formData.append("_captcha", "false");

    fetch("https://formsubmit.co/luizapavarina2004@gmail.com", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        displayMessage("✅ Informações enviadas!", "bot-message");
        lastOptionSelected = "";
        displayMenuAfterAction();
    })
    .catch(error => {
        console.error(error);
        displayMessage("❌ Erro ao enviar informações. Tente novamente mais tarde.", "bot-message");
        setTimeout(() => {
            displayMenuAfterAction();
        }, 1500);
    });
}

function enviarImagemParaFormsubmit(file, cpf, contexto) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("cpf", cpf);
    formData.append("_subject", `📸 Foto de ${contexto} enviada - CPF ${cpf}`);
    formData.append("_captcha", "false");

    fetch("https://formsubmit.co/luizapavarina2004@gmail.com", {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (response.ok) {
            displayMessage("✅ Foto enviada!", "bot-message");
            lastOptionSelected = "";
            displayMenuAfterAction();
        } else {
            throw new Error("Erro ao enviar foto");
        }
    })
    .catch(error => {
        console.error(error);
        displayMessage("❌ Erro ao enviar foto. Tente novamente mais tarde.", "bot-message");
        setTimeout(() => {
            displayMenuAfterAction();
        }, 1500);
    });
}

    function sendMessage() {
        const message = userInput.value.trim();
        if (message === "") return;

        displayMessage(message, "user-message");
        userInput.value = "";
        processUserMessage(message);
    }

    function processUserMessage(message) {
        if (!cpf) {
            handleCPFInput(message);
        } else if (!currentContext) {
            handleMainMenu(message);
        } else {
            handleContextResponses(message);
        }
    }

    if (sendButton) {
        sendButton.addEventListener("click", function (e) {
            e.preventDefault();
            sendMessage();
        });
    }

    if (userInput) {
        userInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    function displayMessage(content, className) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", className);
        messageDiv.innerHTML = content.replace(/\n/g, "<br>");
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function sendImage(file) {
        const envioValido =
            (currentContext === "embarque" && lastOptionSelected === "3") ||
            (currentContext === "desembarque" && lastOptionSelected === "2");

        if (!envioValido) {
            displayMessage("⚠️ Formato inválido.", "bot-message");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = function () {
            const messageDiv = document.createElement("div");
            messageDiv.classList.add("message", "user-message");

            const imgContainer = document.createElement("div");
            imgContainer.classList.add("image-container");

            const img = document.createElement("img");
            img.src = reader.result;

            imgContainer.appendChild(img);
            messageDiv.appendChild(imgContainer);
            chatBox.appendChild(messageDiv);
            chatBox.scrollTop = chatBox.scrollHeight;

            if (currentContext === "embarque" && lastOptionSelected === "3") {
                enviarImagemParaFormsubmit(file, cpf, "embarque");
            } else if (currentContext === "desembarque" && lastOptionSelected === "2") {
                enviarImagemParaFormsubmit(file, cpf, "desembarque");
            }
        };
        reader.readAsDataURL(file);
    }

    if (fileInput && attachButton) {
        attachButton.addEventListener("click", () => fileInput.click());
        fileInput.addEventListener("change", () => {
            if (fileInput.files.length > 0) {
                sendImage(fileInput.files[0]);
                fileInput.value = "";
            }
        });
    }

    function handleCPFInput(message) {
        cpf = message.replace(/\D/g, "");
        const localData = localStorage.getItem(cpf);

        if (usersData[cpf]) {
            localStorage.setItem(cpf, JSON.stringify(usersData[cpf]));
            displayMainMenu();
        } else if (localData) {
            const offlineUser = JSON.parse(localData);
            usersData[cpf] = offlineUser;
            displayMainMenu();
        } else {
            displayMessage("CPF não encontrado.", "bot-message");
            cpf = "";
        }
    }

    function displayMainMenu() {
        const user = usersData[cpf];
        displayMessage(
            `Olá, ${user.nome}! Escolha uma opção:\n1️⃣ Embarque\n2️⃣ Rota\n3️⃣ Desembarque\n4️⃣ Pós-viagem\n5️⃣ Contatos úteis`,
            "bot-message"
        );
    }

    function handleMainMenu(message) {
        if (message === "0") {
            lastOptionSelected = "";
            displayMainMenu();
            return;
        }

        switch (message) {
            case "1":
                currentContext = "embarque";
                lastOptionSelected = "";
                displayMenu("embarque");
                break;
            case "2":
                currentContext = "rota";
                lastOptionSelected = "";
                displayMenu("rota");
                break;
            case "3":
                currentContext = "desembarque";
                lastOptionSelected = "";
                displayMenu("desembarque");
                break;
            case "4":
                displayMessage("Para pós-viagem, contate Otávio: (34) 99894-2493", "bot-message");
                break;
            case "5":
                currentContext = "contato";
                lastOptionSelected = "";
                displayMenu("contato");
                break;
            default:
                displayMessage("Opção inválida. Escolha de 1 a 5.", "bot-message");
        }
    }

    function handleContextResponses(message) {
        const user = usersData[cpf];
        const isNumber = !isNaN(Number(message));

        if (message === "0") {
            currentContext = "";
            lastOptionSelected = "";
            displayMainMenu();
            return;
        }

        if (currentContext === "embarque" && lastOptionSelected === "4" && isNumber) {
            displayMessage("✅ KM inicial registrado: " + message, "bot-message");
            enviarParaFormsubmit({ cpf, quilometroInicial: message }, "embarque");
            lastOptionSelected = "";
            setTimeout(displayMenuAfterAction, 1500);
            return;
        }

        if (currentContext === "desembarque" && lastOptionSelected === "3" && isNumber) {
            displayMessage("✅ KM final registrado: " + message, "bot-message");
            enviarParaFormsubmit({ cpf, quilometroFinal: message }, "desembarque");
            lastOptionSelected = "";
            setTimeout(displayMenuAfterAction, 1500);
            return;
        }

        if (currentContext === "rota" && lastOptionSelected === "4") {
            displayMessage("✅ Observações registradas: " + message, "bot-message");
            enviarParaFormsubmit({ cpf, observacoesCarga: message }, "rota");
            lastOptionSelected = "";
            setTimeout(displayMenuAfterAction, 1500);
            return;
        }

        if (currentContext === "rota" && lastOptionSelected === "5" && isNumber) {
            displayMessage("✅ Custos registrados: R$ " + message, "bot-message");
            enviarParaFormsubmit({ cpf, custos: message }, "rota");
            lastOptionSelected = "";
            setTimeout(displayMenuAfterAction, 1500);
            return;
        }

        lastOptionSelected = message;

        if (currentContext === "embarque") {
            const responses = {
                "1": `Local: ${user.embarqueLocal}\nResponsável: ${user.embarqueResponsavel}`,
                "2": `Tipo de carga: ${user.tipoCarga}`,
                "3": "Envie a foto da carga no embarque:",
                "4": "Digite o KM inicial:"
            };
            displayMessage(responses[message] || "Opção inválida.", "bot-message");

        } else if (currentContext === "rota") {
            const responses = {
                "1": "Instale o Waze, disponível para Android e IOS, ou acesse: https://www.waze.com/pt-BR/live-map/",
                "2": "Paradas: " + user.paradasProgramadas,
                "3": "Instale o Waze, disponível para Android e IOS, ou acesse: https://www.waze.com/pt-BR/live-map/",
                "4": "Digite suas observações:",
                "5": "Digite os custos da viagem:"
            };
            displayMessage(responses[message] || "Opção inválida.", "bot-message");

        } else if (currentContext === "desembarque") {
            const responses = {
                "1": `Local: ${user.desembarqueLocal}\nResponsável: ${user.desembarqueResponsavel}`,
                "2": "Envie a foto da carga no desembarque:",
                "3": "Digite o KM final:"
            };
            displayMessage(responses[message] || "Opção inválida.", "bot-message");

        } else if (currentContext === "contato") {
            const responses = {
                "1": "Emergência 24h:\n192\nSOS Estradas:\nhttps://postocidadedemarilia.com.br/telefone-de-emergencia-das-rodovias-guia/",
                "2": "Supervisor Otávio: (34) 9 9894-2493",
                "3": "Ouvidoria: ouvidoria@oliveiratransportes.com.br"
            };
            displayMessage(responses[message] || "⚠️ Opção inválida.", "bot-message");
            setTimeout(displayMenuAfterAction, 1000);
        }
    }

    function displayMenu(contexto) {
        const menus = {
            "embarque": `Embarque:\n1️⃣ Local e responsável\n2️⃣ Tipo de carga\n3️⃣ Enviar foto da carga\n4️⃣ KM inicial\n0️⃣ Voltar ao menu principal`,
            "rota": `Rota:\n1️⃣ Abrir mapa\n2️⃣ Ver paradas\n3️⃣ Ver rota\n4️⃣ Registrar observações\n5️⃣ Registrar custos\n0️⃣ Voltar ao menu principal`,
            "desembarque": `Desembarque:\n1️⃣ Local e responsável\n2️⃣ Enviar foto da carga\n3️⃣ KM final\n0️⃣ Voltar ao menu principal`,
            "contato": `Contatos:\n1️⃣ Emergência\n2️⃣ Supervisor\n3️⃣ Ouvidoria\n0️⃣ Voltar ao menu principal`
        };
        displayMessage(menus[contexto] || "⚠️ Menu não disponível.", "bot-message");
    }

    function displayMenuAfterAction() {
        if (currentContext) {
            displayMenu(currentContext);
        } else {
            displayMainMenu();
        }
    }
});

window.addEventListener('load', function() {
    console.log("Página totalmente carregada, verificando status novamente...");
    if (typeof verificarStatus === 'function') {
        verificarStatus();
    } else {
        console.error("Função verificar status não está definida no escopo global");
        // Tenta obter a função verificarStatus do escopo do evento DOMContentLoaded
        setTimeout(function() {
            const statusDot = document.getElementById('status-dot');
            const statusText = document.getElementById('status-text');
            
            if (statusDot && statusText) {
                if (navigator.onLine) {
                    statusDot.classList.remove('offline');
                    statusDot.classList.add('online');
                    statusText.textContent = 'Você está online';
                } else {
                    statusDot.classList.remove('online');
                    statusDot.classList.add('offline');
                    statusText.textContent = 'Você está offline';
                }
            }
        }, 100);
    }
});;
