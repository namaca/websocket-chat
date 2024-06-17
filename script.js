(function(){
    let user;
    let drawer = 'caua';
    let lastX;
    let lastY;

    function sendMessage(message) {
        socket.send(message);
    }

    function parseMessage(message) {
        var msg = {type: "", sender: "", text: ""};
        try {
            msg = JSON.parse(message);
        }
        catch(e) {
            return false;
        }
        return msg;
    }

    function appendMessage(message) {
        
        var parsedMsg;
        var msgContainer = document.querySelector(".messages");
        if (parsedMsg = parseMessage(message)) {
            console.log('appending message');
            console.log(parsedMsg);

            var msgElem, senderElem, textElem;
            var sender, text;

            msgElem = document.createElement("div");
            msgElem.classList.add('msg');
            msgElem.classList.add('msg-' + parsedMsg.type);

            senderElem = document.createElement("span");
            senderElem.classList.add("msg-sender");

            textElem = document.createElement("span");
            textElem.classList.add("msg-text");

            sender = document.createTextNode(parsedMsg.sender + ': ');
            text = document.createTextNode(parsedMsg.text);

            console.log(sender);
            
            senderElem.appendChild(sender);
            textElem.appendChild(text);

            msgElem.appendChild(senderElem);
            msgElem.appendChild(textElem);

            msgContainer.appendChild(msgElem);
        }
    }

    function setup() {
        var sender = '';
        var joinForm = document.querySelector('form.join-form');
        var msgForm = document.querySelector('form.msg-form');
        var closeForm = document.querySelector('form.close-form');
        var canvas = document.getElementById('canvas')

        function joinFormSubmit(event) {
            event.preventDefault();
            sender = document.getElementById('sender').value;

            var joinMsg = {
                type: "join",
                sender: sender,
                text: sender + ' entrou no chat!'
            };

            sendMessage(JSON.stringify(joinMsg));

            var sound = new Audio('./notificacao.mp3');
            sound.play();

            if (!joinForm.classList.contains("hidden")) {
               user = sender
            }
        

            canvas.classList.remove('hidden')
            joinForm.classList.add('hidden');
            msgForm.classList.remove('hidden');
            closeForm.classList.remove('hidden');

            novoDrawer()
        }
    
        joinForm.addEventListener('submit', joinFormSubmit);
    
        function msgFormSubmit(event) {
            event.preventDefault();
            var msgField, msgText, msg;
            msgField = document.getElementById('msg');
            msgText = msgField.value;

            msg = {
                type: "normal",
                sender: sender,
                text: msgText
            };
            msg = JSON.stringify(msg);

            sendMessage(msg);
            msgField.value = '';
        }
    
        msgForm.addEventListener('submit', msgFormSubmit);

        function closeFormSubmit(event) {
            event.preventDefault();
            clearCanvas();

            clearMsg = {
                'type': 'clear',
                'drawer': user
            }

            sendMessage(JSON.stringify(clearMsg))
            socket.close();
            window.location.reload();
        }

        closeForm.addEventListener('submit', closeFormSubmit);
    }

    let socket = new WebSocket("ws://10.139.26.167:8920");

    // Obtém o elemento canvas e seu contexto 2d
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    // Define a largura da linha e a cor inicial
    var lineWidth = 5;
    var strokeColor = '#000';

    // Define a variável para verificar se o mouse está pressionado
    var isDrawing = false;

    

    // Função para desenhar no canvas
    function draw(e) {
        if (!isDrawing) return; // Pare se o mouse não estiver pressionado
        if(drawer!==user){
            return;
        }
        // Obter a posição atual do mouse
        var x = e.clientX - canvas.offsetLeft;
        var y = e.clientY - canvas.offsetTop;

        // Define a largura da linha e a cor
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeColor;
        ctx.lineJoin = ctx.lineCap = 'round'; // Define o estilo de junção e fim da linha para suavizar os cantos

        // Desenha uma linha até a posição atual do mouse
        ctx.lineTo(x, y);
        ctx.stroke();

        var drawMsg = {
            type: "draw",
            drawer: drawer,
            clientX: e.clientX,
            clientY: e.clientY,
            strokeColor: strokeColor
        };

        sendMessage(JSON.stringify(drawMsg));
    }

    function changeToEraser() {
        console.log('Borracha ativada')
        strokeColor = '#FFFFFF'; // Define a cor branca para simular uma borracha
    }

    function drawLine(prevX, prevY, currX, currY,color) {
        // Define a largura da linha e a cor
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.lineJoin = ctx.lineCap = 'round'; // Define o estilo de junção e fim da linha para suavizar os cantos
    
        // Começa o caminho da linha
        ctx.beginPath();
        // Move para a posição anterior
        ctx.moveTo(prevX - canvas.offsetLeft, prevY - canvas.offsetTop);
        // Desenha a linha até a posição atual
        ctx.lineTo(currX - canvas.offsetLeft, currY - canvas.offsetTop);
        // Desenha a linha no canvas
        ctx.stroke();
        // Finaliza o caminho
        ctx.closePath();
    }
    // Inicia o desenho quando o mouse é pressionado
    canvas.addEventListener('mousedown', function (e) {
        if(drawer!==user){
            return;
        }

        isDrawing = true;
        // Inicia um novo caminho
        ctx.beginPath();
        // Obter a posição atual do mouse
        var x = e.clientX - canvas.offsetLeft;
        var y = e.clientY - canvas.offsetTop;
        // Move para a posição atual do mouse
        ctx.moveTo(x, y);
    });

    // Continua o desenho quando o mouse é movido
    canvas.addEventListener('mousemove', draw);

    // Termina o desenho quando o mouse é solto
    canvas.addEventListener('mouseup', function () {
        if(drawer!==user){
            return;
        }
        isDrawing = false;

        mouseUpMsg = {
            "type": 'mouseup',
            "drawer": user
        }
        sendMessage(JSON.stringify(mouseUpMsg));
    });
    
    setInterval(() => {
        if(!(user === undefined)){
            console.log(user)
            ping = {
                "msg": 'ping',
                "sender": user
            }
            sendMessage(JSON.stringify(ping));
        }
    }, 10000);

    function novoDrawer() {
        if(drawer == user){
            document.getElementById('eraser-btn').classList.remove('hidden')
            document.getElementById('clear-btn').classList.remove('hidden')
            document.getElementById('toolbar').classList.remove('hidden')

            document.getElementById('toolbar').style.display = 'flex'
            document.getElementById('toolbar').style['flex-direction'] = 'column'
            document.getElementById('toolbar').style.gap = '20px'

            document.getElementById('eraser-btn').addEventListener('click', function() {
                changeToEraser();
            });
            
            // Evento de clique no botão de apagar
            document.getElementById('clear-btn').addEventListener('click', function() {
                clearCanvas();

                clearMsg = {
                    'type': 'clear',
                    'drawer': user
                }

                sendMessage(JSON.stringify(clearMsg))
            });
        } else {
            document.getElementById('eraser-btn').removeEventListener('click');
            document.getElementById('clear-btn').removeEventListener('click');

            document.getElementById('eraser-btn').classList.add('hidden')
            document.getElementById('clear-btn').classList.add('hidden')
            document.getElementById('toolbar').classList.add('hidden')
        }
    }

    // Limpa o canvas
    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Alterna entre diferentes cores
    function changeColor(color) {
        strokeColor = color;
    }

    // Alterna entre diferentes larguras de linha
    function changeWidth(width) {
        lineWidth = width;
    }




    if (!("Notification" in window)) {
        alert("Ative as notificações para ser avisado de novas mensagens nesse chat");
      } else if (Notification.permission !== 'denied') {
        // Otherwise, we need to ask the user for permission
        Notification.requestPermission().then(function (permission) {
          // If the user accepts, let's create a notification
          if (permission !== "granted") {
            alert("Ative as notificações para ser avisado de novas mensagens nesse chat");
          }
        });
    }

    var socketOpen = (e) => {
        console.log("connected to the socket");
        var msg = {
            type: 'join',
            sender: 'Browser',
            text: 'conectado com sucesso'
        }
        appendMessage(JSON.stringify(msg));
        setup();
    }

    var socketMessage = (e) => {
        console.log(`Message from socket: ${e.data}`);
        
        if(JSON.parse(e.data).type === "normal"){
            var sound = new Audio('./notificacao.mp3');
            sound.play();
            
            if(JSON.parse(e.data).sender !== user){
                var notification = new Notification("Nova mensagem no chat");
            }
            
        }
        if(JSON.parse(e.data).type === "match-start"){
            drawer = JSON.parse(e.data).drawer;
            if(drawer == user){
                return alert('Comece a desenhar')
            }
        }
        if(JSON.parse(e.data).type === "draw"){
            drawer = JSON.parse(e.data).drawer;
            if(drawer !== user){
                //pinte no quadro de acordo com o x e y que vao vir de JSON.parse(e.data).clientX e JSON.parse(e.data).clientY
                if(!lastX || !lastY){
                    lastX = JSON.parse(e.data).clientX;
                    lastY = JSON.parse(e.data).clientY;
                }

                //drawBall(JSON.parse(e.data).clientX, JSON.parse(e.data).clientY)
                console.log(lastX)
                drawLine(lastX,lastY,JSON.parse(e.data).clientX,JSON.parse(e.data).clientY,JSON.parse(e.data).strokeColor)
                lastX = JSON.parse(e.data).clientX;
                lastY = JSON.parse(e.data).clientY;

                return;
            }
            return;
        }
        if(JSON.parse(e.data).type === "mouseup"){
            drawer = JSON.parse(e.data).drawer;
            if(drawer !== user){
                console.log('PAROU')
                lastX = null;
                lastY = null;

                return;
            }
            return;
        }

        if(JSON.parse(e.data).type === "clear"){
            drawer = JSON.parse(e.data).drawer;
            if(drawer !== user){
                clearCanvas()

                return;
            }
            return;
        }

        appendMessage(e.data);
    }

    var socketClose = (e) => {
        var msg;
        console.log(e);
        if(e.wasClean) {
            console.log("The connection closed cleanly");
            msg = {
                type: 'left',
                sender: 'Browser',
                text: 'The connection closed cleanly'
            }
        }
        else {
            console.log("The connection closed for some reason");
            var msg = {
                type: 'left',
                sender: 'Browser',
                text: 'The connection closed for some reason'
            }
        }
        appendMessage(JSON.stringify(msg));
    }
    
    var socketError = (e) => {
        console.log("WebSocket Error");
        console.log(e);
    }

    socket.addEventListener("open", socketOpen);
    socket.addEventListener("message", socketMessage);
    socket.addEventListener("close", socketClose);
    socket.addEventListener("error", socketError);

    
   
})();