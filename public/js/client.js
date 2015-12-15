$(document).ready(function() {
   var $input = $('.user-input'),
        $chatBox = $('.chat-box');

    $input.keydown(function(e) {
        if (e.keyCode === 13) {
            $('<p>')
                .text($input.val())
                .appendTo($chatBox);
            $input.val('');
        }
    });

    var socket = io();
});