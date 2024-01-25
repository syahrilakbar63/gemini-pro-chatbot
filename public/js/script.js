document.addEventListener('DOMContentLoaded', function () {
    const textarea = document.getElementById('messageTextarea');
    const chatMessagesContainer = document.querySelector('.chat-messages');
    const chatHistory = [];

    textarea.addEventListener('input', autoExpandTextarea);

    textarea.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    window.sendMessage = async function () {
        const message = textarea.value.trim();
        if (message !== '') {
            try {
                const response = await fetch('/sendMessage', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userInput: message }),
                });

                if (response.ok) {
                    const data = await response.json();
                    chatHistory.push({ role: 'user', text: message });
                    chatHistory.push({ role: 'bot', text: data.text });
                    updateChatUI();
                } else {
                    console.error('Failed to send message to server');
                    // Add user-friendly error handling here
                }
            } catch (error) {
                console.error('Error sending message:', error);
                // Add user-friendly error handling here
            }
        }

        textarea.value = '';
        textarea.style.height = 'auto';
    };

    window.startNewChat = function () {
        chatHistory.length = 0;
        updateChatUI();
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    };

    function autoExpandTextarea() {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    function updateChatUI() {
        chatMessagesContainer.innerHTML = '';

        chatHistory.forEach((message) => {
            displayMessage(message.role, message.text);
        });

        scrollToBottom();
    }

    function displayMessage(role, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = role === 'user' ? 'user-message' : 'bot-message';
        messageDiv.innerText = text;

        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerText = 'Copy';
        copyButton.onclick = function () {
            copyTextToClipboard(text);
        };

        messageDiv.appendChild(copyButton);
        chatMessagesContainer.appendChild(messageDiv);

        scrollToBottom();
    }

    function copyTextToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    function scrollToTop() {
        chatMessagesContainer.scrollTop = 0;
    }

    function scrollToBottom() {
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    document.querySelector(".scroll-to-top").addEventListener("click", scrollToTop);

});
