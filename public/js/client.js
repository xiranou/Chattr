$(document).ready(function() {
    var $input = $('.user-input'),
        $chatBox = $('.chat-box');
    var socket = io();

    $input.keydown(function(e) {
        if (e.keyCode === 13) {

            var chatMsg = $input.val();

            socket.emit('chat-msg', chatMsg);

            appendMsg(chatMsg);

            $input.val('');
        }
    });

    socket.on('chat-msg', function(msg) {
        appendMsg(msg);
    });

    function appendMsg (msg) {
        $('<p>')
            .text(msg)
            .appendTo($chatBox);
    }
});