$(document).ready(function() {
    var $input = $('.user-input'),
        $chatBox = $('.chat-box');
    var socket = io();

    $input.keydown(function(e) {
        if (e.keyCode === 13) {

            var chatMsg = $input.val();

            socket.emit('chat-msg', chatMsg);

            appendMsg(chatMsg, {selfClass: true});

            $input.val('');
        }
    });

    socket.on('chat-msg', function(msg) {
        appendMsg(msg);
    });

    function appendMsg (msg, options) {
        options = options || {};
        var klass = options.selfClass ? "self-msg" : "client-msg";
        $('<p>')
            .text(msg)
            .addClass('msg')
            .addClass(klass)
            .appendTo($chatBox);
    }
});