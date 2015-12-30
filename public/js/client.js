$(document).ready(function() {
    var $body = $('body'),
        $userInput = $('.user-input'),
        $chatBox = $('.chat-box'),
        $userList = $(".user-list"),
        $welcomeText = $('.welcome-text'),
        $nicknameC = $('.nickname-c'),
        $userNickname = $('.user-nickname');

    var socket = io(window.location.host + "/user");

    var currentUser = {};

    socket
        .on('client-connected', initializeClient)
        .on('client-disconnected', disconnectClient)
        .on('new-user-joined', newUserJoined)
        .on('chat-msg', createChatMsg)
        .on('user-inputting', highlightTypingUser)
        .on('private-msg', createChatMsg);

    $userNickname.keyup(getNickname);
    $userInput.keyup(typingInput);

    $userList.on('click', 'li', selectUserTag);

    $chatBox.on('click', '.client-msg.private', replyPrivateMsg);

    function getNickname (e) {
        if (e.which === 13) {
            var name = $userNickname.val();
            if (name) {
                currentUser.nickname = name;
                updateWelcomeText();
                socket.emit('nickname-setted', currentUser);
                $userNickname.val('');
            } else {
                alert("Nickname can't be blank");
            }
        }
    }

    function typingInput (e) {
        if (e.which === 13) {
            var chatMsg = $userInput.val();
            var targetSid = $userInput.data().targetSid;

            createChatMsg({
                user: currentUser,
                msg: chatMsg,
                targetSid: targetSid
            });
            $userInput.val('');
            socket.emit('chat-msg', {user: currentUser, msg: chatMsg, targetSid: targetSid});
        }

        socket.emit('user-inputting', {user: currentUser, hasInput: $userInput.val() !== ''});
    }

    function highlightTypingUser (userTyping) {
        var $userTags = $userList.find('li');
        var typingUserTag = _.filter($userTags, function (tag) {
            return $(tag).data().sId === userTyping.user.socketId;
        });
        $(typingUserTag).toggleClass('typing', userTyping.hasInput);
    }

    function createChatMsg (userMsg) {
        var isSelf = (userMsg.user === currentUser);
        var klass = isSelf ? "self-msg" : "client-msg";
        var name = isSelf ? "You" : userMsg.user.nickname;
        var msg = name + ": " + userMsg.msg;
        var clientSocket = userMsg.user.socketId;

        if (userMsg.targetSid) {
            klass = klass + " private";
            if (isSelf) {
                var targetUser = _.find($userList.find('li'), function (userTag) {
                    return $(userTag).data().sId === userMsg.targetSid;
                });
                msg = name + " (to " + $(targetUser).text() + ")" + ": " + userMsg.msg;
            }
        }

        appendChatMsg(msg, klass, {clientSocket: clientSocket});
    }

    function appendChatMsg (msg, klass, dataObject) {
        var data = dataObject || {};

        $('<p>')
            .text(msg)
            .addClass('msg')
            .addClass(klass)
            .data(data)
            .appendTo($chatBox);

        $chatBox[0].scrollTop = $chatBox[0].scrollHeight;
    }

    function initializeClient (response) {
        currentUser.socketId = response.socketId;
        appendClients(response.clients);
    }

    function newUserJoined (response) {
        var announcementMsg = response.newUser.nickname + " has joined";
        appendUserList(response.users);
        appendChatMsg(announcementMsg, 'announcement');
    }

    function disconnectClient (response) {
        var msg = response.disClient.nickname + " " + "has left Chattr :(";
        appendChatMsg(msg, "announcement");
        appendClients(response.clients);
    }

    function appendClients (clients) {
        appendUserList(clients);
    }

    function updateWelcomeText () {
        $nicknameC.hide();
        var welcomeText =
            $welcomeText.text() + " " + currentUser.nickname + "!";
        $welcomeText.text(welcomeText);
        $userInput.prop('disabled', false).focus();
    }

    function appendUserList (users) {
        $userList.empty();

        var sorted = _.sortBy(users, function (u) {
            return u.socketId !== currentUser.socketId;
        });

        _.each(sorted, function (user) {
            appendUser(user);
        });
    }

    function appendUser (user) {
        var klass = user.socketId === currentUser.socketId ? 'tag-self' : '';
        $('<li>')
            .addClass(klass)
            .text(user.nickname)
            .data('sId', user.socketId)
            .appendTo($userList);
    }

    function selectUserTag (e) {
        e.preventDefault();
        var $userTag = $(e.target);
        var $previouslySelected = $('.chat-selected');

        if ($userTag.data().sId === currentUser.socketId) {
            return false;
        } else {
            togglePrivateChat($userTag);
        }
    }

    function replyPrivateMsg (e) {
        e.preventDefault();
        var targetSid = $(e.target).data().clientSocket;
        var selectedUserTag = _.find($userList.find('li'), function (userTag) {
            return $(userTag).data().sId === targetSid;
        });
        togglePrivateChat($(selectedUserTag));
    }

    function toggleUserTagHighlight ($userTag) {
        var $previouslySelected = $('.chat-selected');

        if ($userTag[0] === $previouslySelected[0]) {
            $userTag.toggleClass('chat-selected');
        } else {
            $previouslySelected.toggleClass('chat-selected');
            $userTag.toggleClass('chat-selected');
        }
    }

    function togglePrivateChat ($selectedUserTag) {
        toggleUserTagHighlight($selectedUserTag);
        // toggle checks if any userTag is selected
        var toggle = $('.chat-selected')[0] !== undefined;
        var placeholderMsg =  toggle ?
            ('to ' + $selectedUserTag.text() + '...') : ('type here...');
        var targetSid = toggle ?
            $selectedUserTag.data().sId : null;

        $userInput
            .toggleClass('private-chat', toggle)
            .attr('placeholder', placeholderMsg)
            .data('targetSid', targetSid)
            .focus();
    }
});