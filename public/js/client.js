$(document).ready(function() {
    var $input = $('.user-input'),
        $chatBox = $('.chat-box'),
        $userListC = $('.user-list-c'),
        $userList = $userListC.find(".user-list");

    var socket = io();

    var newUser = $.Deferred();

    var user;

    getNickname();

    socket
        .on('new-user-joined', appendUser)
        .on('chat-msg', appendMsg);

    newUser.promise().then(function (result) {
        user = result;
        socket.emit("nickname-setted", result);
    });

    $input.keydown(function(e) {
        if (e.keyCode === 13) {

            var chatMsg = $input.val();

            socket.emit('chat-msg', {user: user, msg: chatMsg});

            appendMsg({user: user, msg: chatMsg});

            $input.val('');
        }
    });

    function appendMsg (userMsg) {
        var klass = userMsg.user === user ? "self-msg" : "client-msg";
        var name = userMsg.user.nickname;
        var msg = userMsg.msg;
        $('<p>')
            .text(name + ": " + msg)
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