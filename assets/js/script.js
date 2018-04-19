function HttpPing(fullyQualifiedDomainName) {

    {
        // Количество "пингов"
        var numberOfPings = 4;
        // Количество запросов посредством XMLHttpRequest (могут быть ограничены браузером)
        // Первый запрос не регистрируем, т.к. часть времени уходит на разрешение имени в IP
        var maxIteration = 5;
        // Пауза между "пингованием" в миллисекундах
        var pingInterval = 1000;
        // Флаг, гарантирующий, что все запросы прошли цепочку отправки-возвращения
        var holistic = 0;
        // Общее время по всем "пингам"
        var totalTime = 0;
        // Время в миллисекундах, после которого запрос будет отменен.
        var timeoutRequest = 10000;
        // Флаг, означающий что запрос отменен по XMLHttpRequest timeout
        var timeoutError = false;
    }

    var statisticsBlock = document.getElementById('statistics');
    statisticsBlock.innerHTML = 'Обмен пакетами с ' + fullyQualifiedDomainName + '<br />';

    var urlRandomPath, url, i = 0;
    var pingTimerId = setInterval(function () {

        // Рандомная часть для url, чтобы избежать блокировок со стороны прокси
        urlRandomPath = Math.random().toString(36).substring(7);
        url = 'http://' + fullyQualifiedDomainName + '/knock_knock_' + urlRandomPath;

        if (i < maxIteration) {

            var myRequest = new XMLHttpRequest();

            i = i + 1;
            holistic++;

            // Фиксируем номер "пинга"
            myRequest.pingNum = i;
            // Фиксируем дату начала запроса
            myRequest.dateRequest = Date.now();

            // Устанавливаем время для отмены запроса
            myRequest.timeout = timeoutRequest;

            // Изменение в readyState XMLHttpRequest
            myRequest.onreadystatechange = function () {

                if (myRequest.readyState === 4 && timeoutError === false) {

                    holistic--;

                    // Первый запрос не регистрируем, т.к. часть времени уходит на разрешение имени в IP
                    if (myRequest.pingNum > 1) {
                        var delta = Date.now() - myRequest.dateRequest;
                        totalTime = totalTime + delta;
                        statisticsBlock.innerHTML += '<br />Ответ #' + (myRequest.pingNum - 1) + ' время=' + delta + 'мс<br />';
                    }
                }
            };

            // Запрос прекращен по timeout
            myRequest.ontimeout = function () {
                timeoutError = true;
            };

            myRequest.open("GET", url, true);
            myRequest.send();

        }

        // Условие, при котором все запросы отправились и возвратились
        if (i > numberOfPings && holistic < 1) {
            clearInterval(pingTimerId);
            var averageTime = Math.round(totalTime / (i - 1));
            statisticsBlock.innerHTML += '<br />Отправлено пакетов: ' + (i - 1) + '<br />Среднее время приёма-передачи: ' + averageTime + 'мс<br />';
        }

        // Время вышло
        if (timeoutError === true) {
            clearInterval(pingTimerId);
            statisticsBlock.innerHTML += '<br />Время вышло<br />';
        }

    }, pingInterval);
}

document.getElementById('start').onclick = function() {
    new HttpPing(document.getElementById('address').value);
};
