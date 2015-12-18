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
        .on('new-user-joined', appendUser)
        .on('chat-msg', appendMsg);

    $userNickname.keydown(getNickname);
    $input.keydown(getMsg);

    function getNickname (e) {
        if (e.keyCode === 13) {
            var name = $userNickname.val();
            if (name) {
                currentUser.nickname = name;
                $nicknameC.hide();
                updateWelcomeText();
                appendAnnouncement(name + " has joined", 'join');
                socket.emit('nickname-setted', currentUser);
                $input.prop('disabled', false).focus();
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

    function appendAnnouncement (msg, type) {
        switch (type){
          case 'join':
            createChatMsg(msg, 'announcement');
            break;
          default:
            break;
        }
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

    function appendClients (clients) {
        appendUserList(getConnectedUsers(clients));
    }

    function updateWelcomeText () {
        var original = $welcomeText.text();
        $welcomeText.text(original + " " + currentUser.nickname + "!");
    }

    function getConnectedUsers (clients) {
        var otherClients = _.reject(clients, function (user, socketId) {
            return currentUser.socketId === socketId;
        });

        users = _.map(otherClients, function (user, socketId) {
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
        $('<li>')
            .text(user.nickname)
            .appendTo($userList);
    }
});