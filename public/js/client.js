$(document).ready(function() {
    var $input = $('.user-input'),
        $chatBox = $('.chat-box'),
        $userListC = $('.user-list-c'),
        $userList = $(".user-list"),
        $welcomeText = $('.welcome-text');

    var socket = io(window.location.host + "/user");

    var newUser = $.Deferred();

    var currentUser;

    socket
        .on('client-connected', initializeUser)
        .on('client-disconnected', appendClients)
        .on('new-user-joined', appendUser)
        .on('chat-msg', appendMsg);

    $input.keydown(function(e) {
        if (e.keyCode === 13) {

            var chatMsg = $input.val();

            socket.emit('chat-msg', {user: currentUser, msg: chatMsg});

            appendMsg({user: currentUser, msg: chatMsg});

            $input.val('');
        }
    });

    function appendMsg (userMsg) {
        var klass = userMsg.user === currentUser ? "self-msg" : "client-msg";
        var name = userMsg.user.nickname;
        var msg = userMsg.msg;
        $('<p>')
            .text(name + ": " + msg)
            .addClass('msg')
            .addClass(klass)
            .appendTo($chatBox);
        $chatBox[0].scrollTop = $chatBox[0].scrollHeight;
    }

    function getNickname (promptMsg) {
        promptMsg = promptMsg || "Please enter your nickname.";
        var name = prompt(promptMsg);

        if (name) {
            return name;
        } else {
            return getNickname("You must enter a nickname.");
        }
    }

    function initializeUser (response) {
        var name = getNickname();
        newUser.resolve({nickname: name, socketId: response.socketId});
        newUser.promise().then(function (result) {
            currentUser = result;
            appendClients(response.clients);
            socket.emit("nickname-setted", currentUser);
        });

        updateWelcomeText();
    }

    function appendClients (clients) {
        var users = getConnectedUsers(clients);

        appendUserList(users);
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