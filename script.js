document.addEventListener('DOMContentLoaded', () => {
    // Selecionando elementos do DOM
    const events = document.querySelectorAll('.event');
    const eventLists = document.querySelectorAll('.event-list');
    const eventTypeButtons = document.querySelectorAll('.event-type-button');
    const notifyButton = document.getElementById('notifyButton');
    const countdown = document.getElementById('countdown');
    const timerDisplay = document.getElementById('timer');
    const alertAudio = document.getElementById('alertAudio');
    const testSoundButton = document.getElementById('testSoundButton');

    // Variáveis para armazenar informações do evento selecionado
    let selectedEventTime = null;
    let selectedEventDays = [];
    let countdownInterval;

    // Função para calcular a próxima data do evento
    function getNextEventDate(time, days) {
        const [hours, minutes] = time.split(':').map(Number);
        const now = new Date();
        let eventDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);

        while (!days.includes(eventDate.getDay()) || eventDate <= now) {
            eventDate.setDate(eventDate.getDate() + 1);
        }

        return eventDate;
    }

    // Função para atualizar o contador regressivo
    function updateCountdown(eventDate) {
        if (countdownInterval) clearInterval(countdownInterval);

        countdownInterval = setInterval(() => {
            const now = new Date();
            const timeUntilEvent = eventDate - now;

            if (timeUntilEvent <= 0) {
                clearInterval(countdownInterval);
                timerDisplay.textContent = 'Evento Iniciado!';
                showPopup();
                return;
            }

            const hours = Math.floor(timeUntilEvent / (1000 * 60 * 60));
            const minutes = Math.floor((timeUntilEvent % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeUntilEvent % (1000 * 60)) / 1000);

            timerDisplay.textContent = `${hours}h ${minutes}m ${seconds}s`;
        }, 1000);
    }

    // Adicionando listeners aos botões de tipo de evento
    eventTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            eventTypeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const selectedType = button.getAttribute('data-type');
            eventLists.forEach(list => {
                if (list.classList.contains(selectedType)) {
                    list.classList.remove('hidden');
                } else {
                    list.classList.add('hidden');
                }
            });
        });
    });

    // Adicionando listeners aos eventos
    events.forEach(event => {
        event.addEventListener('click', () => {
            // Remover a classe 'active' de todos os eventos
            events.forEach(e => e.classList.remove('active'));

            // Adicionar a classe 'active' apenas ao evento clicado
            event.classList.add('active');

            selectedEventTime = event.getAttribute('data-time');
            selectedEventDays = event.getAttribute('data-days').split(',').map(Number);
            notifyButton.disabled = false;

            const eventDate = getNextEventDate(selectedEventTime, selectedEventDays);
            countdown.classList.remove('hidden');
            updateCountdown(eventDate);
        });
    });

    // Adicionando listener ao botão de notificação
    notifyButton.addEventListener('click', () => {
        if (selectedEventTime && selectedEventDays.length) {
            const eventDate = getNextEventDate(selectedEventTime, selectedEventDays);
            const now = new Date();
            const timeUntilEvent = eventDate - now;

            if (timeUntilEvent > 0) {
                setTimeout(() => {
                    showPopup();
                }, timeUntilEvent);
                alert(`Notificação ativada para o evento das ${selectedEventTime}.`);
            } else {
                alert('O horário do evento já passou.');
            }
        }
    });

    // Função para verificar eventos próximos
    function checkUpcomingEvent() {
        const now = new Date();
        events.forEach(event => {
            const eventTime = event.getAttribute('data-time');
            const eventDays = event.getAttribute('data-days').split(',').map(Number);
            const eventDate = getNextEventDate(eventTime, eventDays);
            const timeUntilEvent = eventDate - now;

            if (timeUntilEvent > 0 && timeUntilEvent <= 300000) { // Notificar 5 minutos antes do evento
                const eventName = event.querySelector('p').textContent;
                alert(`Evento "${eventName}" começará em breve!`);
            }
        });
    }

    // Verificando eventos próximos a cada minuto
    setInterval(checkUpcomingEvent, 60000);

    // Função para exibir o pop-up
    function showPopup() {
        if (Notification.permission === "granted") {
            new Notification("Evento Iniciado!", {
                body: "O evento selecionado está começando agora.",
                icon: "https://cdn.discordapp.com/icons/892762224383365133/2f0c6e235520f7116ee84da367c4dd87.png?size=2048"
            });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification("Evento Iniciado!", {
                        body: "O evento selecionado está começando agora.",
                        icon: "https://cdn.discordapp.com/icons/892762224383365133/2f0c6e235520f7116ee84da367c4dd87.png?size=2048"
                    });
                }
            });
        }

        alertAudio.play();
        alert("O evento selecionado está começando agora!");
    }

    // Solicitar permissão de notificação ao carregar a página
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    // Adicionando listener ao botão de teste de toque
    testSoundButton.addEventListener('click', () => {
        alertAudio.play();
        alert("Este é o som que será tocado para a notificação do evento.");
    });
});