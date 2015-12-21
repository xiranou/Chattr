$(document).ready(function() {
    var $body = $('body'),
        $input = $('.user-input'),
        $chatBox = $('.chat-box'),
        $userListC = $('.user-list-c'),
        $userList = $(".user-list"),
        $welcomeText = $('.welcome-text'),
        $nicknameC = $('.nickname-c'),
        $userNickname = $('.user-nickname');

    var socket = io(window.location.host + "/user");

    var currentUser = {};

    socket
        .on('client-connected', initializeClient)
        .on('client-disconnected', appendClients)
        .on('new-user-joined', newUserJoined)
        .on('chat-msg', appendMsg);

    $userNickname.keydown(getNickname);
    $input.keydown(getMsg);

    function getNickname (e) {
        if (e.keyCode === 13) {
            var name = $userNickname.val();
            if (name) {
                currentUser.nickname = name;
                updateWelcomeText();
                socket.emit('nickname-setted', currentUser);
            } else {
                alert("Nickname can't be blank");
            }
        }
    }

    function getMsg (e) {
        if (e.keyCode === 13) {
            var chatMsg = $input.val();
            socket.emit('chat-msg', {user: currentUser, msg: chatMsg});
            appendMsg({user: currentUser, msg: chatMsg});
            $input.val('');
        }
    }

    function appendMsg (userMsg) {
        var klass = userMsg.user === currentUser ? "self-msg" : "client-msg";
        var name = userMsg.user.nickname;
        var msg = userMsg.msg;
        createChatMsg(msg, klass, name);
    }

    function createChatMsg (msg, klass, userName) {
        if (userName) {
            msg = userName + ": " + msg;
        }

        $('<p>')
            .text(msg)
            .addClass('msg')
            .addClass(klass)
            .appendTo($chatBox);

        $chatBox[0].scrollTop = $chatBox[0].scrollHeight;
    }

    function initializeClient (response) {
        currentUser.socketId = response.socketId;
        appendClients(response.clients);
    }

    function newUserJoined (user) {
        appendUser(user);
        var announcementMsg = user.nickname + " has joined";
        createChatMsg(announcementMsg, 'announcement', null);
    }

    function appendClients (clients) {
        appendUserList(getConnectedUsers(clients));
    }

    function updateWelcomeText () {
        $nicknameC.hide();
        var welcomeText =
            $welcomeText.text() + " " + currentUser.nickname + "!";
        $welcomeText.text(welcomeText);
        $input.prop('disabled', false).focus();
    }

    function getConnectedUsers (clients) {
        users = _.map(clients, function (user, socketId) {
            return JSON.parse(user);
        });

        return users;
    }

    function appendUserList (users) {
        $userList.empty();

        _.each(users, function (user) {
            appendUser(user);
        });
    }

    function appendUser (user) {
        if (user.socketId !== currentUser.socketId) {
            $('<li>')
                .text(user.nickname)
                .appendTo($userList);
        } else {
            return false;
        }
    }
});