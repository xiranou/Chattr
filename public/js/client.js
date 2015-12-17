$(document).ready(function() {
    var $input = $('.user-input'),
        $chatBox = $('.chat-box'),
        $userListC = $('.user-list-c'),
        $userList = $userListC.find(".user-list");

    var socket = io();

    var newUser = $.Deferred();
    var nickname;

    getNickname();

    socket.on('new-user-joined', appendUser);

    newUser.promise().then(function (result) {
        nickname = result.nickname;
        socket.emit("nickname-setted", result);
    });

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
            .text(nickname + ": " + msg)
            .addClass('msg')
            .addClass(klass)
            .appendTo($chatBox);
    }

    function getNickname (promptMsg) {
        promptMsg = promptMsg || "Please enter your nickname.";
        var name = prompt(promptMsg);

        if (name) {
            newUser.resolve({nickname: name});
            return name;
        } else {
            getNickname("You must enter a nickname.");
        }
    }

    function appendUser (user) {
        $('<li>')
            .text(user.nickname)
            .appendTo($userList);
    }
});