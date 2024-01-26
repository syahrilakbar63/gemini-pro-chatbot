document.addEventListener('DOMContentLoaded', function () {
  const textarea = document.getElementById('messageTextarea')
  const chatMessagesContainer = document.querySelector('.chat-messages')
  const chatHistory = []
  let isTouchDevice = false

  if ('ontouchstart' in window || navigator.maxTouchPoints) {
    isTouchDevice = true
  }

  textarea.addEventListener('input', autoExpandTextarea)

  textarea.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      if (isTouchDevice) {
        event.preventDefault()
        insertNewLine()
      } else if (!event.shiftKey) {
        event.preventDefault()
        sendMessage()
      }
    }
  })

  window.sendMessage = async function () {
    const message = textarea.value.trim()
    if (message !== '') {
      try {
        chatHistory.push({ role: 'user', text: message })
        updateChatUI()

        const response = await fetch('/sendMessage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userInput: message }),
        })

        if (response.ok) {
          const data = await response.json()
          chatHistory.push({ role: 'bot', text: 'Tunggu dulu, masih mikir' })
          updateChatUI()

          chatHistory.pop()
          chatHistory.push({ role: 'bot', text: data.text })

          updateChatUI()
          scrollToBottom() // Scroll to bottom after the response is displayed
        } else {
          console.error('Failed to send message to server')
          chatHistory.push({
            role: 'bot',
            text: 'Yahh error, silahkan refresh atau coba beberapa saat lagi',
          })
          updateChatUI()
        }
      } catch (error) {
        console.error('Error sending message:', error)
        chatHistory.push({
          role: 'bot',
          text: 'Yahh error, silahkan refresh atau coba beberapa saat lagi',
        })
        updateChatUI()
      }
    }

    textarea.value = ''
    autoExpandTextarea()
    autosize.update(textarea)
  }

  window.startNewChat = function () {
    chatHistory.length = 0
    updateChatUI()
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight
  }

  function autoExpandTextarea() {
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }

  function insertNewLine() {
    const cursorPosition = textarea.selectionStart
    const textBefore = textarea.value.substring(0, cursorPosition)
    const textAfter = textarea.value.substring(cursorPosition)

    textarea.value = textBefore + '\n' + textAfter
    autosize.update(textarea)
  }

  function updateChatUI() {
    chatMessagesContainer.innerHTML = ''

    chatHistory.forEach((message) => {
      displayMessage(message.role, message.text)
    })

    setTimeout(() => {
      scrollToBottom()
    }, 0)
  }

  function displayMessage(role, text) {
    const messageDiv = document.createElement('div')
    messageDiv.className = role === 'user' ? 'user-message' : 'bot-message'
    messageDiv.innerText = text

    const copyButton = document.createElement('button')
    copyButton.className = 'copy-button'
    copyButton.innerText = 'Copy'
    copyButton.onclick = function () {
      copyTextToClipboard(text)
    }

    messageDiv.appendChild(copyButton)
    chatMessagesContainer.appendChild(messageDiv)

    scrollToBottom()
  }

  function copyTextToClipboard(text) {
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }

  function scrollToTop() {
    chatMessagesContainer.scrollTop = 0
  }

  function scrollToBottom() {
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight
  }

  function isUserLastSender() {
    const lastMessage = chatHistory[chatHistory.length - 1]
    return lastMessage && lastMessage.role === 'user'
  }

  autosize(textarea)

  document
    .querySelector('.scroll-to-top')
    .addEventListener('click', scrollToTop)
})
