<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat</title>
    <link rel="stylesheet" href="estilo.css">
</head>
<body>
    <div class="container" style="gap: 40px;">
        <div class="chat-box">
            <div class="messages"></div>
            <form action="" class="join-form">
                <input type="text" name="sender" id="sender" placeholder="Enter name">
                <button type="submit">Entrar no Chat</button>
            </form>
            <form action="" method="post" class="msg-form hidden">
                <input type="text" name="msg" id="msg" placeholder="Write message">
                <button type="submit">Enviar mensagem</button>
            </form>
            <form action="" class="close-form hidden"> 
                <button type="submit">Sair do Chat</button>
            </form>
            
        </div>

        <canvas id="canvas" width="800" height="600" style="border:1px solid black" class="hidden canvas"></canvas>
        <div id="toolbar" class="hidden">
            <button>Cor</button>
            <button>Tamn</button>
            <button id="eraser-btn" class="hidden">Borracha</button>
            <button id="clear-btn" class="hidden">Apagar</button>
        </div>
    </div>
    
    <script src="script.js"></script>
</body>
</html>