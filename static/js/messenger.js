const conversationThreads = document.querySelectorAll('.conversation-thread');
const groupThreads = document.querySelectorAll('.group-conversation-thread');
var offcanvasElements = document.querySelectorAll('.offcanvas-more-info');
let chatSocket = null;

document.getElementById("delete-chat-link").addEventListener("click", function(event) {
    event.preventDefault();

    var confirmed = confirm("Are you sure you want to delete this chat?");
    
    if (confirmed) {
        document.getElementById("delete-chat-form").submit();
    }
});

function toggleConversation(sender_id, receiver_id) {
    const conversationThread = document.getElementById('conversation-' + receiver_id);
    const wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
    const wsURL = wsProtocol + window.location.host + '/ws/messenger/' + sender_id + '/' + receiver_id + '/';

    offcanvasElements.forEach(element => {
        element.style.visibility = 'hidden';
        element.classList.remove('show');
    });
    
    conversationThreads.forEach(thread => {
        thread.classList.add('d-none');
        thread.classList.remove('active');
    });

    groupThreads.forEach(thread => {
        thread.classList.add('d-none');
        thread.classList.remove('active');

    });

    if (conversationThread) {
        conversationThread.classList.remove('d-none');
        conversationThread.classList.add('active');
    }

    if (chatSocket !== null && chatSocket.readyState !== WebSocket.CLOSED) {
        chatSocket.close();
    }

    chatSocket = new WebSocket(wsURL);

    chatSocket.onopen = function (e) {
        console.log('WebSocket connection established.');
    };

    chatSocket.onmessage = function (e) {
        const data = JSON.parse(e.data);
        
        if (data.action === 'send_message') {
            let MessageContainer = conversationThread.querySelector('.py-6.py-lg-12');
            let chatEmpty = conversationThread.querySelector('.chat-empty');
            const chatBodyInner = conversationThread.querySelector('.chat-body-inner');
            if (parseInt(data.sender_id) === parseInt(sender_id)) {
                const receivedMessage = `
                    <div class="message message-out" data-message-id="${data.message_id}">
                        <a href="#" data-bs-toggle="modal" data-bs-target="#modal-profile" class="avatar avatar-responsive">
                            <img class="avatar-img" src="${data.sender_profile_picture}" alt="">
                        </a>
                        <div class="message-inner">
                            <div class="message-body">
                                <div class="message-content">
                                    <div class="message-text">
                                        <pre class="direct-message-content" style="font-family: var(--bs-body-font-family);font-size: 15px;font-weight: 400;margin-bottom: 0px;">${data.message}</pre>
                                    </div>
                                    <div class="message-action">
                                        <div class="dropdown">
                                            <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                            </a>

                                            <ul class="dropdown-menu">
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center direct-edit-btn" href="#">
                                                        <span class="me-auto">Edit</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-3"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center direct-reply-btn" href="#">
                                                        <span class="me-auto">Reply</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                                <li>
                                                    <hr class="dropdown-divider">
                                                </li>
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center text-danger direct-delete-btn" href="#">
                                                        <span class="me-auto">Delete</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>    
                            <div class="message-footer">
                                <span class="extra-small text-muted">${data.timestamp}</span>
                            </div>
                        </div>
                    </div>
                `;

                if (MessageContainer) {
                    MessageContainer.innerHTML += receivedMessage;
                } else {
                    if (chatEmpty) {
                        chatEmpty.remove();
                        chatBodyInner.classList.remove('h-100')
                        MessageContainer = document.createElement('div');
                        MessageContainer.classList.add('py-6', 'py-lg-12');
                        MessageContainer.innerHTML += receivedMessage;
                        chatBodyInner.appendChild(MessageContainer);
                    }
                }
            } else {
                const receivedMessage = `
                    <div class="message" data-message-id="${data.message_id}">
                        <a href="#" data-bs-toggle="modal" data-bs-target="#modal-profile" class="avatar avatar-responsive">
                            <img class="avatar-img" src="${data.sender_profile_picture}" alt="">
                        </a>
                        <div class="message-inner">
                            <div class="message-body">
                                <div class="message-content">
                                    <div class="message-text">
                                        <pre class="direct-message-content" style="font-family: var(--bs-body-font-family);font-size: 15px;font-weight: 400;margin-bottom: 0px;">${data.message}</pre>
                                    </div>
                                    <div class="message-action">
                                        <div class="dropdown">
                                            <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                            </a>
                                            <ul class="dropdown-menu">
                                                <li>
                                                    <a class="dropdown-item d-flex direct-reply-btn align-items-center" href="#">
                                                        <span class="me-auto">Reply</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="message-footer">
                                <span class="extra-small text-muted">${data.timestamp}</span>
                            </div>
                        </div>
                    </div>
                `;
                
                if (MessageContainer) {
                    MessageContainer.innerHTML += receivedMessage;
                } else {
                    if (chatEmpty) {
                        chatEmpty.remove();
                        chatBodyInner.classList.remove('h-100')
                        MessageContainer = document.createElement('div');
                        MessageContainer.classList.add('py-6', 'py-lg-12');
                        MessageContainer.innerHTML += receivedMessage;
                        chatBodyInner.appendChild(MessageContainer);
                    }
                }
            }
        } else if (data.action === 'reply_message') {
            let MessageContainer = conversationThread.querySelector('.py-6.py-lg-12');
            if (parseInt(data.sender_id) === parseInt(sender_id)) {
                const receivedMessage = `
                    <div class="message message-out" data-message-id="${data.message_id}">
                        <a href="#" data-bs-toggle="modal" data-bs-target="#modal-profile" class="avatar avatar-responsive">
                            <img class="avatar-img" src="${data.sender_profile_picture}" alt="">
                        </a>
                        <div class="message-inner">
                            <div class="message-body">
                                <div class="message-content">
                                    <div class="message-text">
                                        <blockquote class="blockquote overflow-hidden">
                                            <h6 class="text-reset text-truncate">Reply to</h6>
                                            <p class="small text-truncate">${data.reply_message}</p>
                                        </blockquote>
                                        <pre class="direct-message-content" style="font-family: var(--bs-body-font-family);font-size: 15px;font-weight: 400;margin-bottom: 0px;">${data.message}</pre>
                                    </div>
                                    <div class="message-action">
                                        <div class="dropdown">
                                            <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                            </a>

                                            <ul class="dropdown-menu">
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center direct-edit-btn" href="#">
                                                        <span class="me-auto">Edit</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-3"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center direct-reply-btn" href="#">
                                                        <span class="me-auto">Reply</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                                <li>
                                                    <hr class="dropdown-divider">
                                                </li>
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center text-danger direct-delete-btn" href="#">
                                                        <span class="me-auto">Delete</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>    
                            <div class="message-footer">
                                <span class="extra-small text-muted">${data.timestamp}</span>
                            </div>
                        </div>
                    </div>
                `;
                MessageContainer.innerHTML += receivedMessage;
            } else {
                const receivedMessage = `
                    <div class="message" data-message-id="${data.message_id}">
                        <a href="#" data-bs-toggle="modal" data-bs-target="#modal-profile" class="avatar avatar-responsive">
                            <img class="avatar-img" src="${data.sender_profile_picture}" alt="">
                        </a>
                        <div class="message-inner">
                            <div class="message-body">
                                <div class="message-content">
                                    <div class="message-text">
                                        <blockquote class="blockquote overflow-hidden">
                                            <h6 class="text-reset text-truncate">Reply to</h6>
                                            <p class="small text-truncate">${data.reply_message}</p>
                                        </blockquote>
                                        <pre class="direct-message-content" style="font-family: var(--bs-body-font-family);font-size: 15px;font-weight: 400;margin-bottom: 0px;">${data.message}</pre>
                                    </div>
                                    <div class="message-action">
                                        <div class="dropdown">
                                            <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                            </a>
                                            <ul class="dropdown-menu">
                                                <li>
                                                    <a class="dropdown-item d-flex direct-reply-btn align-items-center" href="#">
                                                        <span class="me-auto">Reply</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="message-footer">
                                <span class="extra-small text-muted">${data.timestamp}</span>
                            </div>
                        </div>
                    </div>
                `;
                MessageContainer.innerHTML += receivedMessage;
            }
        } else if (data.action === 'edited_message') {
            const messageId = data.message_id;
            const newContent = data.new_content;
            const messageContainer = conversationThread.querySelector(`.message[data-message-id="${messageId}"]`);
            const messageText = messageContainer.querySelector('.message-text');
            
            const messageContent = messageText.querySelector('.direct-message-content');
            if (messageContent) {
                messageContent.remove()
            }
            const preElement = document.createElement('pre');
            if (preElement) {
                preElement.style.fontFamily = 'var(--bs-body-font-family)';
                preElement.style.fontSize = '15px';
                preElement.style.fontWeight = '400';
                preElement.style.marginBottom = '0px';
            }
            const messageP = document.createElement('p');
            
            messageP.classList.add('direct-message-content')
            messageP.textContent = newContent;

            preElement.appendChild(messageP);
            messageText.appendChild(preElement);
            
        } else if (data.action === 'deleted_message') {
            const messageId = data.messageId;
            const messageContainer = document.querySelector(`.message[data-message-id="${messageId}"]`);
            messageContainer.remove();
        } else if (data.action === 'handle_file_upload') {
            console.log(data)
            let MessageContainer = conversationThread.querySelector('.py-6.py-lg-12');
            const chatEmpty = conversationThread.querySelector('.chat-empty');
            const chatBodyInner = conversationThread.querySelector('.chat-body-inner');
            var imagesExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
            var reply_blockquote = '';
            if (data.reply_message) {
                reply_blockquote = `
                    <blockquote class="blockquote overflow-hidden">
                        <h6 class="text-reset text-truncate">Reply to</h6>
                        <p class="small text-truncate">${data.reply_message}</p>
                    </blockquote>`
            }

            if (imagesExtensions.includes(data.file_extension)) {
                let message_gallery = document.createElement('div');
                message_gallery.classList.add('message-gallery');
                message_gallery.innerHTML += reply_blockquote
                let rowDiv = document.createElement('div');
                rowDiv.classList.add('row', 'gx-3');
                message_gallery.appendChild(rowDiv);
                const colDiv = document.createElement('div');
                colDiv.classList.add('col');
                const img = document.createElement('img');
                img.classList.add('img-fluid', 'rounded');
                const inputElement = document.createElement('input');
                inputElement.type = 'hidden'
                inputElement.classList.add(`image-${data.message_id}`)
                inputElement.value = `${data.files_name}`
                img.setAttribute('data-action', 'zoom');
                img.src = data.file_urls;

                colDiv.appendChild(img);
                colDiv.appendChild(inputElement);

                rowDiv.appendChild(colDiv);



                if (parseInt(data.sender_id) === parseInt(sender_id)) {
                    const receivedMessage = `
                            <div class="message message-out" data-message-id="${data.message_id}">
                                <a href="#" data-bs-toggle="modal" data-bs-target="#modal-profile" class="avatar avatar-responsive">
                                    <img class="avatar-img" src="${data.sender_avatar}" alt="">
                                </a>
                                <div class="message-inner">
                                    <div class="message-body">
                                        <div class="message-content">
                                            ${message_gallery.outerHTML}
                                            <div class="message-action">
                                                <div class="dropdown">
                                                    <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                                    </a>

                                                    <ul class="dropdown-menu">
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center direct-reply-btn" href="#">
                                                                <span class="me-auto">Reply</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <hr class="dropdown-divider">
                                                        </li>
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center text-danger direct-delete-btn" href="#">
                                                                <span class="me-auto">Delete</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>    
                                    <div class="message-footer">
                                        <span class="extra-small text-muted">${data.timestamp}</span>
                                    </div>
                                </div>
                            </div>
                    `;

                    if (MessageContainer) {
                        MessageContainer.innerHTML += receivedMessage;
                    } else {
                        if (chatEmpty) {
                            chatEmpty.remove();
                            chatBodyInner.classList.remove('h-100')
                            MessageContainer = document.createElement('div');
                            MessageContainer.classList.add('py-6', 'py-lg-12');
                            MessageContainer.innerHTML += receivedMessage;
                            chatBodyInner.appendChild(MessageContainer);
                        }
                    }
                }
                else { 
                    const receivedMessage = `
                            <div class="message" data-message-id="${data.message_id}">
                                <a href="#" data-bs-toggle="modal" data-bs-target="#modal-profile" class="avatar avatar-responsive">
                                    <img class="avatar-img" src="${data.sender_avatar}" alt="">
                                </a>
                                <div class="message-inner">
                                    <div class="message-body">
                                        <div class="message-content">
                                            ${message_gallery.outerHTML}
                                            <div class="message-action">
                                                <div class="dropdown">
                                                    <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                                    </a>

                                                    <ul class="dropdown-menu">
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center direct-reply-btn" href="#">
                                                                <span class="me-auto">Reply</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <hr class="dropdown-divider">
                                                        </li>
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center text-danger direct-delete-btn" href="#">
                                                                <span class="me-auto">Delete</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>    
                                    <div class="message-footer">
                                        <span class="extra-small text-muted">${data.timestamp}</span>
                                    </div>
                                </div>
                            </div>
                    `;

                    if (MessageContainer) {
                        MessageContainer.innerHTML += receivedMessage;
                    } else {
                        if (chatEmpty) {
                            chatEmpty.remove();
                            chatBodyInner.classList.remove('h-100')
                            MessageContainer = document.createElement('div');
                            MessageContainer.classList.add('py-6', 'py-lg-12');
                            MessageContainer.innerHTML += receivedMessage;
                            chatBodyInner.appendChild(MessageContainer);
                        }
                    }
                }
            } else {
                let receivedMessage = null;
                if (parseInt(data.sender_id) === parseInt(sender_id)) {
                    receivedMessage = `<div class="message message-out" data-message-id="${data.message_id}">
                        <a href="#" data-bs-toggle="modal" data-bs-target="#modal-profile" class="avatar avatar-responsive">
                            <img class="avatar-img" src="${data.sender_avatar}" alt="">
                        </a>
                        <div class="message-inner">
                            <div class="message-body">
                                <div class="message-content">
                                    <div class="message-text">
                                        <div class="row align-items-center gx-4">
                                            <div class="col-auto">
                                                <a href="${data.file_urls}" class="avatar avatar-sm">
                                                    <div class="avatar-text bg-white text-primary">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-down"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                                                    </div>
                                                </a>
                                            </div>
                                            <div class="col overflow-hidden">
                                                <h6 class="text-truncate text-reset">
                                                    <a href="${data.file_urls}" class="text-reset">${data.files_name}</a>
                                                    <input type="hidden" class="file-${data.message_id}" value="${data.files_name}">
                                                </h6>
                                                <ul class="list-inline text-uppercase extra-small opacity-75 mb-0">
                                                    <li class="list-inline-item">${data.file_sizes}</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="message-action">
                                        <div class="dropdown">
                                            <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                            </a>

                                            <ul class="dropdown-menu">
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center direct-reply-btn" href="#">
                                                        <span class="me-auto">Reply</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                                <li>
                                                    <hr class="dropdown-divider">
                                                </li>
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center text-danger direct-delete-btn" href="#">
                                                        <span class="me-auto">Delete</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>    
                            <div class="message-footer">
                                <span class="extra-small text-muted">${data.timestamp}</span>
                            </div>
                        </div>
                    </div>`

                    if (MessageContainer) {
                        MessageContainer.innerHTML += receivedMessage;
                    } else {
                        if (chatEmpty) {
                            chatEmpty.remove();
                            chatBodyInner.classList.remove('h-100')
                            MessageContainer = document.createElement('div');
                            MessageContainer.classList.add('py-6', 'py-lg-12');
                            MessageContainer.innerHTML += receivedMessage;
                            chatBodyInner.appendChild(MessageContainer);
                        }
                    }
                } else {
                    receivedMessage = `
                    <div class="message message-out" data-message-id="${data.message_id}">
                        <a href="#" data-bs-toggle="modal" data-bs-target="#modal-profile" class="avatar avatar-responsive">
                            <img class="avatar-img" src="${data.sender_profile_picture}" alt="">
                        </a>
                        <div class="message-inner">
                            <div class="message-body">
                                <div class="message-content">
                                    <div class="message-text">
                                        <div class="row align-items-center gx-4">
                                            <div class="col-auto">
                                                <a href="${data.file_urls}" class="avatar avatar-sm">
                                                    <div class="avatar-text bg-white text-primary">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-down"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                                                    </div>
                                                </a>
                                            </div>
                                            <div class="col overflow-hidden">
                                                <h5 class="text-truncate text-reset">
                                                    <a href="${data.file_urls}" class="text-reset">${data.files_name}</a>
                                                    <input type="hidden" class="file-${data.message_id}" value="${data.files_name}">
                                                </h5>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="message-action">
                                        <div class="dropdown">
                                            <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                            </a>
                        
                                            <ul class="dropdown-menu">
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center direct-reply-btn" href="#">
                                                        <span class="me-auto">Reply</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                                <li>
                                                    <hr class="dropdown-divider">
                                                </li>
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center text-danger direct-delete-btn" href="#">
                                                        <span class="me-auto">Delete</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>    
                            <div class="message-footer">
                                <span class="extra-small text-muted">${data.timestamp}</span>
                            </div>
                        </div>
                    </div>
                    `;

                    if (MessageContainer) {
                        MessageContainer.innerHTML += receivedMessage;
                    } else {
                        if (chatEmpty) {
                            chatEmpty.remove();
                            chatBodyInner.classList.remove('h-100')
                            MessageContainer = document.createElement('div');
                            MessageContainer.classList.add('py-6', 'py-lg-12');
                            MessageContainer.innerHTML += receivedMessage;
                            chatBodyInner.appendChild(MessageContainer);
                        }
                    }
                }


            }
        } else if (data.action === 'handle_upload_with_message') {
            let MessageContainer = conversationThread.querySelector('.py-6.py-lg-12');
            const chatEmpty = conversationThread.querySelector('.chat-empty');
            const chatBodyInner = conversationThread.querySelector('.chat-body-inner');
            var imagesExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
            let reply_blockquote = ''
            if (data.reply_message) {    
                reply_blockquote = `
                    <blockquote class="blockquote overflow-hidden">
                        <h6 class="text-reset text-truncate">Reply to</h6>
                        <p class="small text-truncate">${data.reply_message}</p>
                    </blockquote>`
            }
            if (imagesExtensions.includes(data.file_extensions)) {
                let message_gallery = document.createElement('div');
                message_gallery.classList.add('message-gallery');
                let rowDiv = document.createElement('div');
                message_gallery.innerHTML += reply_blockquote
                rowDiv.classList.add('row', 'gx-3');
                message_gallery.appendChild(rowDiv);

                const colDiv = document.createElement('div');
                colDiv.classList.add('col');
                const img = document.createElement('img');
                img.classList.add('img-fluid', 'rounded');
                const inputElement = document.createElement('input');
                inputElement.type = 'hidden'
                inputElement.classList.add(`image-${data.message_id}`)
                inputElement.value = `${data.files_name}`
                img.setAttribute('data-action', 'zoom');
                img.src = data.file_urls;

                colDiv.appendChild(img);
                colDiv.appendChild(inputElement);

                rowDiv.appendChild(colDiv);
                


                if (parseInt(data.sender_id) === parseInt(sender_id)) {
                    const receivedMessage = `
                            <div class="message message-out" data-message-id="${data.message_id}">
                                <a href="#" data-bs-toggle="modal" data-bs-target="#modal-profile" class="avatar avatar-responsive">
                                    <img class="avatar-img" src="${data.sender_avatar}" alt="">
                                </a>
                                <div class="message-inner">
                                    <div class="message-body">
                                        <div class="message-content">
                                            ${message_gallery.outerHTML}
                                            <div class="message-action">
                                                <div class="dropdown">
                                                    <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                                    </a>

                                                    <ul class="dropdown-menu">
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center direct-edit-btn" href="#">
                                                                <span class="me-auto">Edit</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-3"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center direct-reply-btn" href="#">
                                                                <span class="me-auto">Reply</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <hr class="dropdown-divider">
                                                        </li>
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center text-danger direct-delete-btn" href="#">
                                                                <span class="me-auto">Delete</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="message-content">
                                            <div class="message-text">
                                                <pre class="direct-message-content" style="font-family: var(--bs-body-font-family);font-size: 15px;font-weight: 400;margin-bottom: 0px;">${data.message}</pre>
                                            </div>
                                            <div class="message-action">
                                                <div class="dropdown">
                                                    <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                                    </a>

                                                    <ul class="dropdown-menu">
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center direct-edit-btn" href="#">
                                                                <span class="me-auto">Edit</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-3"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center direct-reply-btn" href="#">
                                                                <span class="me-auto">Reply</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <hr class="dropdown-divider">
                                                        </li>
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center text-danger direct-delete-btn" href="#">
                                                                <span class="me-auto">Delete</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        
                                    </div>    
                                    <div class="message-footer">
                                        <span class="extra-small text-muted">${data.timestamp}</span>
                                    </div>
                                </div>
                            </div>
                    `;

                    if (MessageContainer) {
                        MessageContainer.innerHTML += receivedMessage;
                    } else {
                        if (chatEmpty) {
                            chatEmpty.remove();
                            chatBodyInner.classList.remove('h-100')
                            MessageContainer = document.createElement('div');
                            MessageContainer.classList.add('py-6', 'py-lg-12');
                            MessageContainer.innerHTML += receivedMessage;
                            chatBodyInner.appendChild(MessageContainer);
                        }
                    }
                }
                else { 
                    const receivedMessage = `
                            <div class="message" data-message-id="${data.message_id}">
                                <a href="#" data-bs-toggle="modal" data-bs-target="#modal-profile" class="avatar avatar-responsive">
                                    <img class="avatar-img" src="${data.sender_avatar}" alt="">
                                </a>
                                <div class="message-inner">
                                    <div class="message-body">
                                        <div class="message-content">
                                            ${message_gallery.outerHTML}
                                            <div class="message-action">
                                                <div class="dropdown">
                                                    <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                                    </a>

                                                    <ul class="dropdown-menu">
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center direct-edit-btn" href="#">
                                                                <span class="me-auto">Edit</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-3"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center direct-reply-btn" href="#">
                                                                <span class="me-auto">Reply</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <hr class="dropdown-divider">
                                                        </li>
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center text-danger direct-delete-btn" href="#">
                                                                <span class="me-auto">Delete</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="message-content">
                                            <div class="message-text">
                                                <pre class="direct-message-content" style="font-family: var(--bs-body-font-family);font-size: 15px;font-weight: 400;margin-bottom: 0px;">${data.message}</pre>
                                            </div>
                                            <div class="message-action">
                                                <div class="dropdown">
                                                    <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                                    </a>

                                                    <ul class="dropdown-menu">
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center direct-edit-btn" href="#">
                                                                <span class="me-auto">Edit</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-3"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center direct-reply-btn" href="#">
                                                                <span class="me-auto">Reply</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <hr class="dropdown-divider">
                                                        </li>
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center text-danger direct-delete-btn" href="#">
                                                                <span class="me-auto">Delete</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>    
                                    <div class="message-footer">
                                        <span class="extra-small text-muted">${data.timestamp}</span>
                                    </div>
                                </div>
                            </div>
                    `;

                    if (MessageContainer) {
                        MessageContainer.innerHTML += receivedMessage;
                    } else {
                        if (chatEmpty) {
                            chatEmpty.remove();
                            chatBodyInner.classList.remove('h-100')
                            MessageContainer = document.createElement('div');
                            MessageContainer.classList.add('py-6', 'py-lg-12');
                            MessageContainer.innerHTML += receivedMessage;
                            chatBodyInner.appendChild(MessageContainer);
                        }
                    }
                }
            } else {
                let receivedMessage = null;
                if (parseInt(data.sender_id) === parseInt(sender_id)) {
                    receivedMessage = `<div class="message message-out" data-message-id="${data.message_id}">
                        <a href="#" data-bs-toggle="modal" data-bs-target="#modal-profile" class="avatar avatar-responsive">
                            <img class="avatar-img" src="${data.sender_profile_picture}" alt="">
                        </a>
                        <div class="message-inner">
                            <div class="message-body">
                                <div class="message-content">
                                    <div class="message-text">
                                        ${reply_blockquote}
                                        <div class="row align-items-center gx-4">
                                            <div class="col-auto">
                                                <a href="${data.file_urls}" class="avatar avatar-sm">
                                                    <div class="avatar-text bg-white text-primary">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-down"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                                                    </div>
                                                </a>
                                            </div>
                                            <div class="col overflow-hidden">
                                                <h5 class="text-truncate text-reset">
                                                    <a href="${data.file_urls}" class="text-reset">${data.files_name}</a>
                                                    <input type="hidden" class="file-${data.message_id}" value="${data.files_name}">
                                                </h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="message-content">
                                    <div class="message-text">
                                        <pre class="direct-message-content" style="font-family: var(--bs-body-font-family);font-size: 15px;font-weight: 400;margin-bottom: 0px;">${data.message}</pre>
                                    </div>
                                    <div class="message-action">
                                        <div class="dropdown">
                                            <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                            </a>
                        
                                            <ul class="dropdown-menu">
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center direct-reply-btn" href="#">
                                                        <span class="me-auto">Reply</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                                <li>
                                                    <hr class="dropdown-divider">
                                                </li>
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center text-danger direct-delete-btn" href="#">
                                                        <span class="me-auto">Delete</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            
                            </div>
                            
                            <div class="message-footer">
                                <span class="extra-small text-muted">${data.timestamp}</span>
                            </div>
                        </div>
                    </div>`

                    if (MessageContainer) {
                        MessageContainer.innerHTML += receivedMessage;
                    } else {
                        if (chatEmpty) {
                            chatEmpty.remove();
                            chatBodyInner.classList.remove('h-100')
                            MessageContainer = document.createElement('div');
                            MessageContainer.classList.add('py-6', 'py-lg-12');
                            MessageContainer.innerHTML += receivedMessage;
                            chatBodyInner.appendChild(MessageContainer);
                        }
                    }
                } else {
                    receivedMessage = `<div class="message" data-message-id="${data.message_id}">
                        <a href="#" data-bs-toggle="modal" data-bs-target="#modal-profile" class="avatar avatar-responsive">
                            <img class="avatar-img" src="${data.sender_profile_picture}" alt="">
                        </a>
                        <div class="message-inner">
                            <div class="message-body">
                                <div class="message-content">
                                    <div class="message-text">
                                        ${reply_blockquote}
                                        <div class="row align-items-center gx-4">
                                            <div class="col-auto">
                                                <a href="${data.file_urls}" class="avatar avatar-sm">
                                                    <div class="avatar-text bg-white text-primary">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-down"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                                                    </div>
                                                </a>
                                            </div>
                                            <div class="col overflow-hidden">
                                                <h5 class="text-truncate text-reset">
                                                    <a href="${data.file_urls}" class="text-reset">${data.files_name}</a>
                                                    <input type="hidden" class="file-${data.message_id}" value="${data.files_name}">
                                                </h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="message-content">
                                    <div class="message-text">
                                        <pre class="direct-message-content" style="font-family: var(--bs-body-font-family);font-size: 15px;font-weight: 400;margin-bottom: 0px;">${data.message}</pre>
                                    </div>
                                    <div class="message-action">
                                        <div class="dropdown">
                                            <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                            </a>
                        
                                            <ul class="dropdown-menu">
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center direct-reply-btn" href="#">
                                                        <span class="me-auto">Reply</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                                <li>
                                                    <hr class="dropdown-divider">
                                                </li>
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center text-danger direct-delete-btn" href="#">
                                                        <span class="me-auto">Delete</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            
                            </div>
                            
                            <div class="message-footer">
                                <span class="extra-small text-muted">${data.timestamp}</span>
                            </div>
                        </div>
                    </div>`

                    if (MessageContainer) {
                        MessageContainer.innerHTML += receivedMessage;
                    } else {
                        if (chatEmpty) {
                            chatEmpty.remove();
                            chatBodyInner.classList.remove('h-100')
                            MessageContainer = document.createElement('div');
                            MessageContainer.classList.add('py-6', 'py-lg-12');
                            MessageContainer.innerHTML += receivedMessage;
                            chatBodyInner.appendChild(MessageContainer);
                        }
                    }
                }

            }
        }
        
    };

    chatSocket.onerror = function (error) {
        console.error('WebSocket error:', error);
    };

    document.addEventListener('click', function(event) {
        if (event.target.matches('.direct-send-btn')) {
            event.preventDefault();
            event.stopPropagation();
            if (!isReplying) {
                const container = event.target.closest('.chat-form');
                const messageInput = container.querySelector(".chat_message");
                const message = messageInput.value;
    
                if (message !== "") {
                    chatSocket.send(JSON.stringify({
                        'action': 'send_message',
                        'message': message,
                        'sender_id': sender_id,
                        'receiver_id': receiver_id,
                    }));
    
                    messageInput.value = "";
                }
            }
        } else if (event.target.matches('.direct-edit-btn')) {
            event.preventDefault();
            const messageContainer = event.target.closest('.message');
            const messageText = messageContainer.querySelector('.message-text');
            if (messageText) {
                const messageContent = messageText.querySelector('.direct-message-content');
                const originalContent = messageContent.textContent;
                messageContent.remove();
                
                const inputField = document.createElement('textarea');
                inputField.className = 'form-control';
                inputField.style.backgroundColor = '#4fa1ff';
                inputField.style.borderRadius = '.6rem';
                inputField.style.borderColor = '#2787f5';
                inputField.style.color = '#fff';
                inputField.value = originalContent
                
                messageText.appendChild(inputField);
                inputField.focus();
                inputField.addEventListener('keypress', function(event) {
                    if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        let newContent = inputField.value;
                        if (newContent === '') {
                            newContent = originalContent;
                        }
                        const messageId = messageContainer.dataset.messageId;
                        chatSocket.send(JSON.stringify({
                            'action': 'edit_message',
                            'messageId': messageId,
                            'newContent': newContent,
                        }));
                        inputField.remove();
                    }
                });
            }

        } else if (event.target.matches('.direct-reply-btn')) {
            event.preventDefault();
            const existingReply = conversationThread.querySelector('.reply');
            let directSendBtn = conversationThread.querySelector('.direct-send-btn')
            if (existingReply) {
                existingReply.remove();
            }

            isReplying = true;
            let replyMessage;
            const messageContainer = event.target.closest('.message');
            replyMessageId = messageContainer.dataset.messageId;
            const image = messageContainer.querySelector(`.message-gallery .image-${replyMessageId}`);
            const file = messageContainer.querySelector(`.message-text .file-${replyMessageId}`);
            const messageText = messageContainer.querySelector('.message-text .direct-message-content');
            let replyContent;
            if (image) {
                replyContent = image.value;
                if (file) {
                    replyContent = file.value
                } else if (messageText) {
                    replyContent = messageText.textContent
                }
                subAction = 'reply_image'

                replyMessage = `
                <div class="dz-preview reply bg-dark pb-5 pt-5 px-2">
                    <blockquote class="blockquote overflow-hidden ms-4">
                    <a class="badge badge-circle bg-body text-white position-absolute top-0 end-0 m-3 reply-remove" href="#">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </a>
                        <h6 class="text-reset text-truncate">Reply to</h6>
                        <p class="small text-truncate">${replyContent}</p>
                    </blockquote>
                </div>
                `

            } else if (file) {
                replyContent = file.value;
                if (image) {
                    replyContent = image.value
                } else if (messageText) {
                    replyContent = messageText.textContent
                }
                subAction = 'reply_file'

                replyMessage = `
                    <div class="dz-preview reply bg-dark pb-5 pt-5 px-2">
                        <blockquote class="blockquote overflow-hidden ms-4">
                        <a class="badge badge-circle bg-body text-white position-absolute top-0 end-0 m-3 reply-remove" href="#">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </a>
                            <h6 class="text-reset text-truncate">Reply to</h6>
                            <p class="small text-truncate">${replyContent}</p>
                        </blockquote>
                    </div>
                `

            } else if (messageText) {
                replyContent = messageText.textContent
                if (image) {
                    replyContent = image.value
                } else if (file) {
                    replyContent = file.value
                }

                replyMessage = `
                    <div class="dz-preview reply bg-dark pb-5 pt-5 px-2">
                        <blockquote class="blockquote overflow-hidden ms-4">
                        <a class="badge badge-circle bg-body text-white position-absolute top-0 end-0 m-3 reply-remove" href="#">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </a>
                            <h6 class="text-reset text-truncate">Reply to</h6>
                            <p class="small text-truncate">${replyContent}</p>
                        </blockquote>
                    </div>
                `
            }

            const chatFooter = conversationThread.querySelector('.chat-footer');

            chatFooter.insertAdjacentHTML('afterbegin', replyMessage);
            replyRemove = chatFooter.querySelector('.reply');
            
            directSendBtn.addEventListener('click', function(event) {
                event.preventDefault();
                if (isReplying) {
                    const messageInput = conversationThread.querySelector(".chat_message");
                    const message = messageInput.value;

                    if (message !== "") {
                        chatSocket.send(JSON.stringify({
                            'action': 'reply_message',
                            'receiver_id': receiver_id,
                            'replyTo': replyMessageId,
                            'message': message,
                        }));
                        messageInput.value = "";
                        replyRemove.remove();
                        isReplying = false;
                        
                    }
                }
            });

            replyRemove.addEventListener('click', function(event) {
                event.preventDefault();
                replyRemove.remove();
                isReplying = false;
                subAction = null;
            });
        } else if (event.target.matches('.direct-delete-btn')) {
            event.preventDefault();
            const messageContainer = event.target.closest('.message');
            const messageId = messageContainer.dataset.messageId;
            chatSocket.send(JSON.stringify({
                'action': 'delete_message',
                'messageId': messageId,
            }));
        }
    });
}


function toggleGroupConversation(group_id) {
    const conversationThread = document.getElementById('group-conversation-thread-' + group_id);
    const wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
    const wsURL = wsProtocol + window.location.host + '/' + 'ws/messenger/group/' + group_id + '/';

    offcanvasElements.forEach(element => {
        element.style.visibility = 'hidden';
        element.classList.remove('show');
    });

    groupThreads.forEach(thread => {
        thread.classList.add('d-none');
        thread.classList.remove('active');

    });

    conversationThreads.forEach(thread => {
        thread.classList.add('d-none');
        thread.classList.remove('active');
        
    });

    if (conversationThread) {
        conversationThread.classList.remove('d-none');
        conversationThread.classList.add('active');
    }

    if (chatSocket !== null && chatSocket.readyState !== WebSocket.CLOSED) {
        chatSocket.close();
    }

    chatSocket = new WebSocket(wsURL);

    chatSocket.onopen = function (e) {
        console.log('WebSocket connection established.');
    };

    chatSocket.onmessage = function (e) {
        const data = JSON.parse(e.data);
        const senderId = conversationThread.dataset.senderId;
        console.log(data)
        if (data.action === 'send_message') {
            let MessageContainer = conversationThread.querySelector('.py-6.py-lg-12');
            let chatEmpty = conversationThread.querySelector('.group-chat-empty');
            const chatBodyInner = conversationThread.querySelector('.chat-body-inner');

            if (parseInt(data.sender_id) === parseInt(senderId)) {
                const receivedMessage = `
                    <div class="message message-out" data-message-id="${data.message_id}">
                        <a href="#" data-bs-toggle="modal" data-bs-target="#modal-profile" class="avatar avatar-responsive">
                            <img class="avatar-img" src="${data.sender_profile_picture}" alt="">
                        </a>
                        <div class="message-inner">
                            <div class="message-body">
                                <div class="message-content">
                                    <div class="message-text">
                                        <pre class="group-message-content" style="font-family: var(--bs-body-font-family);font-size: 15px;font-weight: 400;margin-bottom: 0px;">${data.message}</pre>
                                    </div>
                                    <div class="message-action">
                                        <div class="dropdown">
                                            <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                            </a>

                                            <ul class="dropdown-menu">
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center group-edit-btn" href="#">
                                                        <span class="me-auto">Edit</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-3"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center group-reply-btn" href="#">
                                                        <span class="me-auto">Reply</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                                <li>
                                                    <hr class="dropdown-divider">
                                                </li>
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center text-danger group-delete-btn" href="#">
                                                        <span class="me-auto">Delete</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>    
                            <div class="message-footer">
                                <span class="extra-small text-muted">${data.timestamp}</span>
                            </div>
                        </div>
                    </div>
                `;

                if (MessageContainer) {
                    MessageContainer.innerHTML += receivedMessage;
                } else {
                    if (chatEmpty) {
                        chatEmpty.remove();
                        chatBodyInner.classList.remove('h-100')
                        MessageContainer = document.createElement('div');
                        MessageContainer.classList.add('py-6', 'py-lg-12');
                        MessageContainer.innerHTML += receivedMessage;
                        chatBodyInner.appendChild(MessageContainer);
                    }
                }
            } else {
                const receivedMessage = `
                    <div class="message" data-message-id="${data.message_id}">
                        <a href="#" data-bs-toggle="modal" data-bs-target="#modal-profile" class="avatar avatar-responsive">
                            <img class="avatar-img" src="${data.sender_profile_picture}" alt="">
                        </a>
                        <div class="message-inner">
                            <div class="message-body">
                                <div class="message-content">
                                    <div class="message-text">
                                        <pre class="group-message-content" style="font-family: var(--bs-body-font-family);font-size: 15px;font-weight: 400;margin-bottom: 0px;">${data.message}</pre>
                                    </div>
                                    <div class="message-action">
                                        <div class="dropdown">
                                            <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                            </a>
                                            <ul class="dropdown-menu">
                                                <li>
                                                    <a class="dropdown-item d-flex group-reply-btn align-items-center" href="#">
                                                        <span class="me-auto">Reply</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="message-footer">
                                <span class="extra-small text-muted">${data.timestamp}</span>
                            </div>
                        </div>
                    </div>
                `;
                
                if (MessageContainer) {
                    MessageContainer.innerHTML += receivedMessage;
                } else {
                    if (chatEmpty) {
                        chatEmpty.remove();
                        chatBodyInner.classList.remove('h-100')
                        MessageContainer = document.createElement('div');
                        MessageContainer.classList.add('py-6', 'py-lg-12');
                        MessageContainer.innerHTML += receivedMessage;
                        chatBodyInner.appendChild(MessageContainer);
                    }
                }
            }
        } else if (data.action === 'reply_message') {
            let MessageContainer = conversationThread.querySelector('.py-6.py-lg-12');
            if (parseInt(data.sender_id) === parseInt(senderId)) {
                const receivedMessage = `
                    <div class="message message-out" data-message-id="${data.message_id}">
                        <a href="#" data-bs-toggle="modal" data-bs-target="#modal-profile" class="avatar avatar-responsive">
                            <img class="avatar-img" src="${data.sender_profile_picture}" alt="">
                        </a>
                        <div class="message-inner">
                            <div class="message-body">
                                <div class="message-content">
                                    <div class="message-text">
                                        <blockquote class="blockquote overflow-hidden">
                                            <h6 class="text-reset text-truncate">Reply to</h6>
                                            <p class="small text-truncate">${data.reply_message}</p>
                                        </blockquote>
                                        <pre class="group-message-content" style="font-family: var(--bs-body-font-family);font-size: 15px;font-weight: 400;margin-bottom: 0px;">${data.message}</pre>
                                    </div>
                                    <div class="message-action">
                                        <div class="dropdown">
                                            <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                            </a>

                                            <ul class="dropdown-menu">
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center group-edit-btn" href="#">
                                                        <span class="me-auto">Edit</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-3"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center group-reply-btn" href="#">
                                                        <span class="me-auto">Reply</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                                <li>
                                                    <hr class="dropdown-divider">
                                                </li>
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center text-danger group-delete-btn" href="#">
                                                        <span class="me-auto">Delete</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>    
                            <div class="message-footer">
                                <span class="extra-small text-muted">${data.timestamp}</span>
                            </div>
                        </div>
                    </div>
                `;
                MessageContainer.innerHTML += receivedMessage;
            } else {
                const receivedMessage = `
                    <div class="message" data-message-id="${data.message_id}">
                        <a href="#" data-bs-toggle="modal" data-bs-target="#modal-profile" class="avatar avatar-responsive">
                            <img class="avatar-img" src="${data.sender_profile_picture}" alt="">
                        </a>
                        <div class="message-inner">
                            <div class="message-body">
                                <div class="message-content">
                                    <div class="message-text">
                                        <blockquote class="blockquote overflow-hidden">
                                            <h6 class="text-reset text-truncate">Reply to</h6>
                                            <p class="small text-truncate">${data.reply_message}</p>
                                        </blockquote>
                                        <pre class="group-message-content" style="font-family: var(--bs-body-font-family);font-size: 15px;font-weight: 400;margin-bottom: 0px;">${data.message}</pre>
                                    </div>
                                    <div class="message-action">
                                        <div class="dropdown">
                                            <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                            </a>
                                            <ul class="dropdown-menu">
                                                <li>
                                                    <a class="dropdown-item d-flex group-reply-btn align-items-center" href="#">
                                                        <span class="me-auto">Reply</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="message-footer">
                                <span class="extra-small text-muted">${data.timestamp}</span>
                            </div>
                        </div>
                    </div>
                `;
                MessageContainer.innerHTML += receivedMessage;
            }
        } else if (data.action === 'edited_message') {
            const messageId = data.message_id;
            const newContent = data.new_content;
            const messageContainer = conversationThread.querySelector(`.message[data-message-id="${messageId}"]`);
            const messageText = messageContainer.querySelector('.message-text');
            
            const messageContent = messageText.querySelector('.group-message-content');
            if (messageContent) {
                messageContent.remove()
            }
            const preElement = document.createElement('pre');
            if (preElement) {
                preElement.classList.add('group-message-content')
                preElement.style.fontFamily = 'var(--bs-body-font-family)';
                preElement.style.fontSize = '15px';
                preElement.style.fontWeight = '400';
                preElement.style.marginBottom = '0px';
            }
            
            preElement.textContent = newContent;

            messageText.appendChild(preElement);
        } else if (data.action === 'deleted_message') {
            const messageId = data.messageId;
            const messageContainer = document.querySelector(`.message[data-message-id="${messageId}"]`);
            messageContainer.remove();
        } else if (data.action === 'edit_group_name') {
            const group_id = data.group_id;
            const new_content = data.new_content;
            const group_container = document.querySelector(`#group-conversation-thread-${group_id}`)
            const sidebar_gc = document.querySelector(`.side-group-name-${group_id}`)
            const name = group_container.querySelector('.chat-header .group-name')        
            name.textContent = new_content;
            sidebar_gc.textContent = new_content;

        } else if (data.action === 'leave_group') {
            if (data.member_id === senderId) {
                group_id = data.group_id;
                member_id = data.member_id;
                const group_aside = document.querySelector(`.group-id-${group_id}`);
                const group_container = document.querySelector(`#group-conversation-thread-${group_id}`);
                const group_info = document.querySelector(`#offcanvas-more-group-${group_id}`);
                group_aside.remove()
                group_container.remove()
                group_info.remove()
                chatSocket.close();
            } else {
                const group_member = document.querySelector(`#offcanvas-member-${group_id}-${member_id}`);
                group_member.remove()
            }
        } else if (data.action === 'delete_group') {
            group_id = data.group_id;
            const group_aside = document.querySelector(`.group-id-${group_id}`);
            const group_container = document.querySelector(`#group-conversation-thread-${group_id}`);
            const group_info = document.querySelector(`#offcanvas-more-group-${group_id}`);
            const group_invite = document.querySelector(`#offcanvas-add-members-${group_id}`);
            group_aside.remove();
            group_container.remove();
            group_info.remove();
            group_invite.remove();
            chatSocket.close();
        } else if (data.action === 'kick_member') {
            if (data.member_id === senderId) {
                group_id = data.group_id;
                member_id = data.member_id;
                const group_aside = document.querySelector(`.group-id-${group_id}`);
                const group_container = document.querySelector(`#group-conversation-thread-${group_id}`);
                const group_info = document.querySelector(`#offcanvas-more-group-${group_id}`);
                const group_invite = document.querySelector(`#offcanvas-add-members-${group_id}`);
                group_aside.remove();
                group_container.remove();
                group_info.remove();
                group_invite.remove();
                chatSocket.close();
            } else {
                memberCount = data.member_count;
                const group_member = document.querySelector(`#offcanvas-member-${group_id}-${member_id}`);
                const member_profile = conversationThread.querySelector(`[data-bs-target="#modal-user-profile-${member_id}"]`);
                const group_count = conversationThread.querySelector('.group-count');
                let currentMemberCount = document.querySelector(`[data-member-group="${group_id}"]`);
                currentMemberCount.textContent = `${parseInt(memberCount)} Members`;
                group_count.textContent = `${parseInt(memberCount)} Members`;
                member_profile.remove()
                group_member.remove()
            }
        } else if (data.action === 'mute_member') {
            if (data.member_id === senderId) {
                const chat_form = conversationThread.querySelector(`.chat-form`);
                let member = document.querySelector(`#offcanvas-member-${group_id}-${data.member_id} h5`);
                let muteButton = document.querySelector(`.mute-member[data-member-id="${data.member_id}"]`);
                if (data.muted === 'true') {
                    const mutedHtml = `
                        <div class="chat-form bg-dark" style="padding: 1rem;">
                            <div class="chat-form-hr"></div>
                            <p>You have been muted. You cannot send messages until you are unmuted.</p>
                        </div>`;
                    chat_form.outerHTML = mutedHtml;
                    member.textContent += ' (Muted)';
                    muteButton.textContent = 'Unmute'
                } else {
                    form = `
                        <div class="chat-form reverse-rounded-pill bg-dark" data-emoji-form="">
                            <div class="chat-form-hr"></div>
                            <div class="row align-items-center gx-0">
                                <div class="col-auto">
                                    <a href="#" class="btn btn-icon btn-link text-body rounded-circle" id="dz-btn">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-paperclip"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                                    </a>
                                    <input type="file" name="user_files" class="d-none" id="mediaInput">
                                </div>

                                <div class="col">
                                    <div class="input-group">
                                        <textarea class="form-control px-0 chat_message" placeholder="Type your message..." rows="1" data-emoji-input="" data-autosize="true"></textarea>

                                        <a href="#" class="input-group-text text-body pe-0" data-emoji-btn="">
                                            <span class="icon icon-lg">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-smile"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                                            </span>
                                        </a>
                                    </div>
                                </div>

                                <div class="col-auto">
                                    <button class="btn btn-icon btn-primary rounded-circle ms-5 group-send-btn">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-send"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `
                    chat_form.outerHTML = form;
                    member.textContent = data.member_username;
                    muteButton.textContent = 'Mute'
                }

            } else {
                let member = document.querySelector(`#offcanvas-member-${group_id}-${data.member_id} h5`);
                let muteButton = document.querySelector(`.mute-member[data-member-id="${data.member_id}"]`);
                if (data.muted === 'true') {
                    member.textContent += ' (Muted)';
                    muteButton.textContent = 'Unmute'
                } else {
                    member.textContent = data.member_username;
                    muteButton.textContent = 'Mute'
                }
            }
        } else if (data.action === 'handle_file_upload') {
            let MessageContainer = conversationThread.querySelector('.py-6.py-lg-12');
            const chatEmpty = conversationThread.querySelector('.group-chat-empty');
            const chatBodyInner = conversationThread.querySelector('.chat-body-inner');
            var imagesExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
            var reply_blockquote = '';
            if (data.reply_message) {
                reply_blockquote = `
                    <blockquote class="blockquote overflow-hidden">
                        <h6 class="text-reset text-truncate">Reply to</h6>
                        <p class="small text-truncate">${data.reply_message}</p>
                    </blockquote>`
            }

            if (imagesExtensions.includes(data.file_extension)) {
                let message_gallery = document.createElement('div');
                message_gallery.classList.add('message-gallery');
                message_gallery.innerHTML += reply_blockquote
                
                let rowDiv = document.createElement('div');
                rowDiv.classList.add('row', 'gx-3');
                message_gallery.appendChild(rowDiv);
                const colDiv = document.createElement('div');
                colDiv.classList.add('col');
                const img = document.createElement('img');
                img.classList.add('img-fluid', 'rounded');
                const inputElement = document.createElement('input');
                inputElement.type = 'hidden'
                inputElement.classList.add(`image-${data.message_id}`)
                inputElement.value = `${data.files_name}`
                img.setAttribute('data-action', 'zoom');
                img.src = data.file_urls;

                colDiv.appendChild(img);
                colDiv.appendChild(inputElement);

                rowDiv.appendChild(colDiv);

                if (parseInt(data.sender_id) === parseInt(senderId)) {
                    const receivedMessage = `
                            <div class="message message-out" data-message-id="${data.message_id}">
                                <a href="#" data-bs-toggle="modal" data-bs-target="#modal-profile" class="avatar avatar-responsive">
                                    <img class="avatar-img" src="${data.sender_avatar}" alt="">
                                </a>
                                <div class="message-inner">
                                    <div class="message-body">
                                        <div class="message-content">
                                            ${message_gallery.outerHTML}
                                            <div class="message-action">
                                                <div class="dropdown">
                                                    <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                                    </a>

                                                    <ul class="dropdown-menu">
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center group-reply-btn" href="#">
                                                                <span class="me-auto">Reply</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <hr class="dropdown-divider">
                                                        </li>
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center text-danger group-delete-btn" href="#">
                                                                <span class="me-auto">Delete</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>    
                                    <div class="message-footer">
                                        <span class="extra-small text-muted">${data.timestamp}</span>
                                    </div>
                                </div>
                            </div>
                    `;

                    if (MessageContainer) {
                        MessageContainer.innerHTML += receivedMessage;
                    } else {
                        if (chatEmpty) {
                            chatEmpty.remove();
                            chatBodyInner.classList.remove('h-100')
                            MessageContainer = document.createElement('div');
                            MessageContainer.classList.add('py-6', 'py-lg-12');
                            MessageContainer.innerHTML += receivedMessage;
                            chatBodyInner.appendChild(MessageContainer);
                        }
                    }
                }
                else { 
                    const receivedMessage = `
                            <div class="message" data-message-id="${data.message_id}">
                                <a href="#" data-bs-toggle="modal" data-bs-target="#modal-profile" class="avatar avatar-responsive">
                                    <img class="avatar-img" src="${data.sender_avatar}" alt="">
                                </a>
                                <div class="message-inner">
                                    <div class="message-body">
                                        <div class="message-content">
                                            ${message_gallery.outerHTML}
                                            <div class="message-action">
                                                <div class="dropdown">
                                                    <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                                    </a>

                                                    <ul class="dropdown-menu">
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center group-reply-btn" href="#">
                                                                <span class="me-auto">Reply</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <hr class="dropdown-divider">
                                                        </li>
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center text-danger group-delete-btn" href="#">
                                                                <span class="me-auto">Delete</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>    
                                    <div class="message-footer">
                                        <span class="extra-small text-muted">${data.timestamp}</span>
                                    </div>
                                </div>
                            </div>
                    `;

                    if (MessageContainer) {
                        MessageContainer.innerHTML += receivedMessage;
                    } else {
                        if (chatEmpty) {
                            chatEmpty.remove();
                            chatBodyInner.classList.remove('h-100')
                            MessageContainer = document.createElement('div');
                            MessageContainer.classList.add('py-6', 'py-lg-12');
                            MessageContainer.innerHTML += receivedMessage;
                            chatBodyInner.appendChild(MessageContainer);
                        }
                    }
                }
            } else {
                let receivedMessage = null;
                if (parseInt(data.sender_id) === parseInt(senderId)) {
                    receivedMessage = `<div class="message message-out" data-message-id="${data.message_id}">
                        <a href="#" data-bs-toggle="modal" data-bs-target="#modal-profile" class="avatar avatar-responsive">
                            <img class="avatar-img" src="${data.sender_avatar}" alt="">
                        </a>
                        <div class="message-inner">
                            <div class="message-body">
                                <div class="message-content">
                                    <div class="message-text">
                                        ${reply_blockquote}
                                        <div class="row align-items-center gx-4">
                                            <div class="col-auto">
                                                <a href="${data.file_urls}" class="avatar avatar-sm">
                                                    <div class="avatar-text bg-white text-primary">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-down"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                                                    </div>
                                                </a>
                                            </div>
                                            <div class="col overflow-hidden">
                                                <h6 class="text-truncate text-reset">
                                                    <a href="${data.file_urls}" class="text-reset">${data.files_name}</a>
                                                    <input type="hidden" class="file-${data.message_id}" value="${data.files_name}">
                                                </h6>
                                                <ul class="list-inline text-uppercase extra-small opacity-75 mb-0">
                                                    <li class="list-inline-item">${data.file_sizes}</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="message-action">
                                        <div class="dropdown">
                                            <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                            </a>

                                            <ul class="dropdown-menu">
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center group-reply-btn" href="#">
                                                        <span class="me-auto">Reply</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                                <li>
                                                    <hr class="dropdown-divider">
                                                </li>
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center text-danger group-delete-btn" href="#">
                                                        <span class="me-auto">Delete</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>    
                            <div class="message-footer">
                                <span class="extra-small text-muted">${data.timestamp}</span>
                            </div>
                        </div>
                    </div>`

                    if (MessageContainer) {
                        MessageContainer.innerHTML += receivedMessage;

                    } else {
                        if (chatEmpty) {
                            chatEmpty.remove();
                            chatBodyInner.classList.remove('h-100')
                            MessageContainer = document.createElement('div');
                            MessageContainer.classList.add('py-6', 'py-lg-12');
                            MessageContainer.innerHTML += receivedMessage;
                            chatBodyInner.appendChild(MessageContainer);
                        }
                    }
                } else {
                    receivedMessage = `
                    <div class="message message-out" data-message-id="${data.message_id}">
                        <a href="#" data-bs-toggle="modal" data-bs-target="#modal-profile" class="avatar avatar-responsive">
                            <img class="avatar-img" src="${data.sender_profile_picture}" alt="">
                        </a>
                        <div class="message-inner">
                            <div class="message-body">
                                <div class="message-content">
                                    <div class="message-text">
                                        ${reply_blockquote}
                                        <div class="row align-items-center gx-4">
                                            <div class="col-auto">
                                                <a href="${data.file_urls}" class="avatar avatar-sm">
                                                    <div class="avatar-text bg-white text-primary">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-down"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                                                    </div>
                                                </a>
                                            </div>
                                            <div class="col overflow-hidden">
                                                <h5 class="text-truncate text-reset">
                                                    <a href="${data.file_urls}" class="text-reset">${data.files_name}</a>
                                                    <input type="hidden" class="file-${data.message_id}" value="${data.files_name}">
                                                </h5>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="message-action">
                                        <div class="dropdown">
                                            <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                            </a>
                        
                                            <ul class="dropdown-menu">
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center group-reply-btn" href="#">
                                                        <span class="me-auto">Reply</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                                <li>
                                                    <hr class="dropdown-divider">
                                                </li>
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center text-danger group-delete-btn" href="#">
                                                        <span class="me-auto">Delete</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>    
                            <div class="message-footer">
                                <span class="extra-small text-muted">${data.timestamp}</span>
                            </div>
                        </div>
                    </div>
                    `;

                    if (MessageContainer) {
                        MessageContainer.innerHTML += receivedMessage;
                    } else {
                        if (chatEmpty) {
                            chatEmpty.remove();
                            chatBodyInner.classList.remove('h-100')
                            MessageContainer = document.createElement('div');
                            MessageContainer.classList.add('py-6', 'py-lg-12');
                            MessageContainer.innerHTML += receivedMessage;
                            chatBodyInner.appendChild(MessageContainer);
                        }
                    }
                }

            }
        } else if (data.action === 'handle_upload_with_message') {
            let MessageContainer = conversationThread.querySelector('.py-6.py-lg-12');
            const chatEmpty = conversationThread.querySelector('.group-chat-empty');
            const chatBodyInner = conversationThread.querySelector('.chat-body-inner');
            var imagesExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
            let reply_blockquote = ''
            if (data.reply_message) {    
                reply_blockquote = `
                    <blockquote class="blockquote overflow-hidden">
                        <h6 class="text-reset text-truncate">Reply to</h6>
                        <p class="small text-truncate">${data.reply_message}</p>
                    </blockquote>`
            }

            if (imagesExtensions.includes(data.file_extensions)) {
                let message_gallery = document.createElement('div');
                message_gallery.classList.add('message-gallery');
                let rowDiv = document.createElement('div');
                rowDiv.classList.add('row', 'gx-3');
                message_gallery.innerHTML += reply_blockquote
                message_gallery.appendChild(rowDiv);

                
                const colDiv = document.createElement('div');
                colDiv.classList.add('col');
                const img = document.createElement('img');
                img.classList.add('img-fluid', 'rounded');
                const inputElement = document.createElement('input');
                inputElement.type = 'hidden'
                inputElement.classList.add(`image-${data.message_id}`)
                inputElement.value = `${data.files_name}`
                img.setAttribute('data-action', 'zoom');
                img.src = data.file_urls;

                colDiv.appendChild(img);
                colDiv.appendChild(inputElement);

                rowDiv.appendChild(colDiv);
                


                if (parseInt(data.sender_id) === parseInt(senderId)) {
                    const receivedMessage = `
                            <div class="message message-out" data-message-id="${data.message_id}">
                                <a href="#" data-bs-toggle="modal" data-bs-target="#modal-profile" class="avatar avatar-responsive">
                                    <img class="avatar-img" src="${data.sender_avatar}" alt="">
                                </a>
                                <div class="message-inner">
                                    <div class="message-body">
                                        <div class="message-content">
                                            ${message_gallery.outerHTML}
                                            <div class="message-action">
                                                <div class="dropdown">
                                                    <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                                    </a>

                                                    <ul class="dropdown-menu">
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center group-reply-btn" href="#">
                                                                <span class="me-auto">Reply</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <hr class="dropdown-divider">
                                                        </li>
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center text-danger group-delete-btn" href="#">
                                                                <span class="me-auto">Delete</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="message-content">
                                            <div class="message-text">
                                                <pre class="group-message-content" style="font-family: var(--bs-body-font-family);font-size: 15px;font-weight: 400;margin-bottom: 0px;">${data.message}</pre>
                                            </div>
                                            <div class="message-action">
                                                <div class="dropdown">
                                                    <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                                    </a>

                                                    <ul class="dropdown-menu">
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center group-edit-btn" href="#">
                                                                <span class="me-auto">Edit</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-3"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center group-reply-btn" href="#">
                                                                <span class="me-auto">Reply</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <hr class="dropdown-divider">
                                                        </li>
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center text-danger group-delete-btn" href="#">
                                                                <span class="me-auto">Delete</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        
                                    </div>    
                                    <div class="message-footer">
                                        <span class="extra-small text-muted">${data.timestamp}</span>
                                    </div>
                                </div>
                            </div>
                    `;

                    if (MessageContainer) {
                        MessageContainer.innerHTML += receivedMessage;
                    } else {
                        if (chatEmpty) {
                            chatEmpty.remove();
                            chatBodyInner.classList.remove('h-100')
                            MessageContainer = document.createElement('div');
                            MessageContainer.classList.add('py-6', 'py-lg-12');
                            MessageContainer.innerHTML += receivedMessage;
                            chatBodyInner.appendChild(MessageContainer);
                        }
                    }
                }
                else { 
                    const receivedMessage = `
                            <div class="message" data-message-id="${data.message_id}">
                                <a href="#" data-bs-toggle="modal" data-bs-target="#modal-profile" class="avatar avatar-responsive">
                                    <img class="avatar-img" src="${data.sender_avatar}" alt="">
                                </a>
                                <div class="message-inner">
                                    <div class="message-body">
                                        <div class="message-content">
                                            ${message_gallery.outerHTML}
                                            <div class="message-action">
                                                <div class="dropdown">
                                                    <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                                    </a>

                                                    <ul class="dropdown-menu">
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center group-reply-btn" href="#">
                                                                <span class="me-auto">Reply</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <hr class="dropdown-divider">
                                                        </li>
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center text-danger group-delete-btn" href="#">
                                                                <span class="me-auto">Delete</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="message-content">
                                            <div class="message-text">
                                                <pre class="group-message-content" style="font-family: var(--bs-body-font-family);font-size: 15px;font-weight: 400;margin-bottom: 0px;">${data.message}</pre>
                                            </div>
                                            <div class="message-action">
                                                <div class="dropdown">
                                                    <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                                    </a>

                                                    <ul class="dropdown-menu">
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center group-edit-btn" href="#">
                                                                <span class="me-auto">Edit</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-3"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center group-reply-btn" href="#">
                                                                <span class="me-auto">Reply</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <hr class="dropdown-divider">
                                                        </li>
                                                        <li>
                                                            <a class="dropdown-item d-flex align-items-center text-danger group-delete-btn" href="#">
                                                                <span class="me-auto">Delete</span>
                                                                <div class="icon">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                                </div>
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>    
                                    <div class="message-footer">
                                        <span class="extra-small text-muted">${data.timestamp}</span>
                                    </div>
                                </div>
                            </div>
                    `;

                    if (MessageContainer) {
                        MessageContainer.innerHTML += receivedMessage;
                    } else {
                        if (chatEmpty) {
                            chatEmpty.remove();
                            chatBodyInner.classList.remove('h-100')
                            MessageContainer = document.createElement('div');
                            MessageContainer.classList.add('py-6', 'py-lg-12');
                            MessageContainer.innerHTML += receivedMessage;
                            chatBodyInner.appendChild(MessageContainer);
                        }
                    }
                }
            } else {
                let receivedMessage = null;
                fileUrls.forEach(url => {
                if (parseInt(data.sender_id) === parseInt(senderId)) {
                    receivedMessage = `<div class="message message-out" data-message-id="${data.message_id}">
                        <a href="#" data-bs-toggle="modal" data-bs-target="#modal-profile" class="avatar avatar-responsive">
                            <img class="avatar-img" src="${data.sender_profile_picture}" alt="">
                        </a>
                        <div class="message-inner">
                            <div class="message-body">
                                <div class="message-content">
                                    <div class="message-text">
                                        ${reply_blockquote}
                                        <div class="row align-items-center gx-4">
                                            <div class="col-auto">
                                                <a href="${data.file_urls}" class="avatar avatar-sm">
                                                    <div class="avatar-text bg-white text-primary">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-down"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                                                    </div>
                                                </a>
                                            </div>
                                            <div class="col overflow-hidden">
                                                <h5 class="text-truncate text-reset">
                                                    <a href="${data.file_urls}" class="text-reset">${data.files_name}</a>
                                                    <input type="hidden" class="file-${data.message_id}" value="${data.files_name}">
                                                </h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="message-content">
                                    <div class="message-text">
                                        <pre class="group-message-content" style="font-family: var(--bs-body-font-family);font-size: 15px;font-weight: 400;margin-bottom: 0px;">${data.message}</pre>
                                    </div>
                                    <div class="message-action">
                                        <div class="dropdown">
                                            <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                            </a>
                        
                                            <ul class="dropdown-menu">
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center group-reply-btn" href="#">
                                                        <span class="me-auto">Reply</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                                <li>
                                                    <hr class="dropdown-divider">
                                                </li>
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center text-danger group-delete-btn" href="#">
                                                        <span class="me-auto">Delete</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            
                            </div>
                            
                            <div class="message-footer">
                                <span class="extra-small text-muted">${data.timestamp}</span>
                            </div>
                        </div>
                    </div>`

                    if (MessageContainer) {
                        MessageContainer.innerHTML += receivedMessage;
                    } else {
                        if (chatEmpty) {
                            chatEmpty.remove();
                            chatBodyInner.classList.remove('h-100')
                            MessageContainer = document.createElement('div');
                            MessageContainer.classList.add('py-6', 'py-lg-12');
                            MessageContainer.innerHTML += receivedMessage;
                            chatBodyInner.appendChild(MessageContainer);
                        }
                    }
                } else {
                    receivedMessage = `<div class="message" data-message-id="${data.message_id}">
                        <a href="#" data-bs-toggle="modal" data-bs-target="#modal-profile" class="avatar avatar-responsive">
                            <img class="avatar-img" src="${data.sender_profile_picture}" alt="">
                        </a>
                        <div class="message-inner">
                            <div class="message-body">
                                <div class="message-content">
                                    <div class="message-text">
                                    ${reply_blockquote}
                                        <div class="row align-items-center gx-4">
                                            <div class="col-auto">
                                                <a href="${data.file_urls}" class="avatar avatar-sm">
                                                    <div class="avatar-text bg-white text-primary">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-down"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                                                    </div>
                                                </a>
                                            </div>
                                            <div class="col overflow-hidden">
                                                <h5 class="text-truncate text-reset">
                                                    <a href="${data.file_urls}" class="text-reset">${data.files_name}</a>
                                                    <input type="hidden" class="file-${data.message_id}" value="${data.files_name}">
                                                </h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="message-content">
                                    <div class="message-text">
                                        <pre class="group-message-content" style="font-family: var(--bs-body-font-family);font-size: 15px;font-weight: 400;margin-bottom: 0px;">${data.message}</pre>
                                    </div>
                                    <div class="message-action">
                                        <div class="dropdown">
                                            <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                            </a>
                        
                                            <ul class="dropdown-menu">
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center group-reply-btn" href="#">
                                                        <span class="me-auto">Reply</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                                <li>
                                                    <hr class="dropdown-divider">
                                                </li>
                                                <li>
                                                    <a class="dropdown-item d-flex align-items-center text-danger group-delete-btn" href="#">
                                                        <span class="me-auto">Delete</span>
                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                        </div>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            
                            </div>
                            
                            <div class="message-footer">
                                <span class="extra-small text-muted">${data.timestamp}</span>
                            </div>
                        </div>
                    </div>`

                    if (MessageContainer) {
                        MessageContainer.innerHTML += receivedMessage;
                    } else {
                        if (chatEmpty) {
                            chatEmpty.remove();
                            chatBodyInner.classList.remove('h-100')
                            MessageContainer = document.createElement('div');
                            MessageContainer.classList.add('py-6', 'py-lg-12');
                            MessageContainer.innerHTML += receivedMessage;
                            chatBodyInner.appendChild(MessageContainer);
                        }
                    }
                }
                })

            }
        }
    }

    chatSocket.onerror = function (error) {
        console.error('WebSocket error:', error);
    };

    window.addEventListener('click', function(event) {
        if (event.target.matches('.group-send-btn')) {
            event.preventDefault();
            event.stopPropagation();
            if (!isReplying) {
                const container = event.target.closest('.chat-form');
                const messageInput = container.querySelector(".chat_message");
                const message = messageInput.value;
                if (message !== "") {
                    const data = {
                        'action': 'send_message',
                        'message': message,
                        'group_id': group_id,
                    };
    
                    chatSocket.send(JSON.stringify(data));
                    messageInput.value = "";
                }
            }
        } else if (event.target.matches('.group-name')) {
            event.preventDefault();
            event.stopPropagation();
            var groupNameElement = event.target;
            var currentName = groupNameElement.textContent.trim();
            var inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.value = currentName;
            groupNameElement.textContent = '';
            groupNameElement.appendChild(inputElement);
            inputElement.focus();
            inputElement.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    let newContent = inputElement.value.trim();
                    chatSocket.send(JSON.stringify({
                        'action': 'edit_group_name',
                        'newContent': newContent,
                        'group_id': group_id,
                    }));
                    inputElement.remove();
                }
            });

        } else if (event.target.matches('.group-edit-btn')) {
            event.preventDefault();
            event.stopPropagation();
            const messageContainer = event.target.closest('.message');
            const messageText = messageContainer.querySelector('.message-text');
            if (messageText) {
                const messageContent = messageText.querySelector('.group-message-content');
                const originalContent = messageContent.textContent;
                messageContent.remove();
                
                const inputField = document.createElement('textarea');
                inputField.className = 'form-control';
                inputField.style.backgroundColor = '#4fa1ff';
                inputField.style.borderRadius = '.6rem';
                inputField.style.borderColor = '#2787f5';
                inputField.style.color = '#fff';
                inputField.value = originalContent
                
                messageText.appendChild(inputField);
                inputField.focus();
                inputField.addEventListener('keypress', function(event) {
                    if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        let newContent = inputField.value;
                        if (newContent === '') {
                            newContent = originalContent;
                        }
                        const messageId = messageContainer.dataset.messageId;
                        chatSocket.send(JSON.stringify({
                            'action': 'edit_message',
                            'messageId': messageId,
                            'newContent': newContent,
                        }));
                        inputField.remove();
                    }
                });
            }

        } else if (event.target.matches('.group-reply-btn')) {
            event.preventDefault();
            const existingReply = conversationThread.querySelector('.reply');
            let groupSendBtn = conversationThread.querySelector('.group-send-btn')
            if (existingReply) {
                existingReply.remove();
            }

            isReplying = true;
            let replyMessage;
            const messageContainer = event.target.closest('.message');
            replyMessageId = messageContainer.dataset.messageId;
            const image = messageContainer.querySelector(`.message-gallery .image-${replyMessageId}`);
            const file = messageContainer.querySelector(`.message-text .file-${replyMessageId}`);
            const messageText = messageContainer.querySelector('.message-text .group-message-content');
            let replyContent;
            if (image) {
                replyContent = image.value;
                if (file) {
                    replyContent = file.value
                } else if (messageText) {
                    replyContent = messageText.textContent
                }
                subAction = 'reply_image'

                replyMessage = `
                <div class="dz-preview reply bg-dark pb-5 pt-5 px-2">
                    <blockquote class="blockquote overflow-hidden ms-4">
                    <a class="badge badge-circle bg-body text-white position-absolute top-0 end-0 m-3 reply-remove" href="#">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </a>
                        <h6 class="text-reset text-truncate">Reply to</h6>
                        <p class="small text-truncate">${replyContent}</p>
                    </blockquote>
                </div>
                `

            } else if (file) {
                replyContent = file.value;
                if (image) {
                    replyContent = image.value
                } else if (messageText) {
                    replyContent = messageText.textContent
                }
                subAction = 'reply_file'

                replyMessage = `
                    <div class="dz-preview reply bg-dark pb-5 pt-5 px-2">
                        <blockquote class="blockquote overflow-hidden ms-4">
                        <a class="badge badge-circle bg-body text-white position-absolute top-0 end-0 m-3 reply-remove" href="#">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </a>
                            <h6 class="text-reset text-truncate">Reply to</h6>
                            <p class="small text-truncate">${replyContent}</p>
                        </blockquote>
                    </div>
                `

            } else if (messageText) {
                replyContent = messageText.textContent
                if (image) {
                    replyContent = image.value
                } else if (file) {
                    replyContent = file.value
                }

                replyMessage = `
                    <div class="dz-preview reply bg-dark pb-5 pt-5 px-2">
                        <blockquote class="blockquote overflow-hidden ms-4">
                        <a class="badge badge-circle bg-body text-white position-absolute top-0 end-0 m-3 reply-remove" href="#">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </a>
                            <h6 class="text-reset text-truncate">Reply to</h6>
                            <p class="small text-truncate">${replyContent}</p>
                        </blockquote>
                    </div>
                `
            }

            const chatFooter = conversationThread.querySelector('.chat-footer');

            chatFooter.insertAdjacentHTML('afterbegin', replyMessage);
            replyRemove = chatFooter.querySelector('.reply');
            
            if (groupSendBtn) {
                groupSendBtn.addEventListener('click', function(event) {
                    event.preventDefault();
                    if (isReplying) {
                        const messageInput = conversationThread.querySelector(".chat_message");
                        const message = messageInput.value;

                        if (message !== "") {
                            chatSocket.send(JSON.stringify({
                                'action': 'reply_message',
                                'subAction': subAction,
                                'replyTo': replyMessageId,
                                'message': message,
                                'group_id': group_id,
                            }));

                            messageInput.value = "";
                            replyRemove.remove();
                            isReplying = false;
                            
                        }
                    }
                });
            }

            replyRemove.addEventListener('click', function(event) {
                event.preventDefault();
                replyRemove.remove();
                isReplying = false;
                subAction = null;
                groupSendBtn.classList.remove('group-reply-message');
            });
        } else if (event.target.matches('.group-delete-btn')) {
            event.preventDefault();
            event.stopPropagation();
            const messageContainer = event.target.closest('.message');
            const messageId = messageContainer.dataset.messageId;
            chatSocket.send(JSON.stringify({
                'action': 'delete_message',
                'messageId': messageId,
            }));
        } else if (event.target.matches('.leave-group')) {
            event.preventDefault();
            event.stopPropagation();
            chatSocket.send(JSON.stringify({
                'action': 'leave_group',
                'group_id': group_id,
            }));
        } else if (event.target.matches('.delete-group')) {
            event.preventDefault();
            event.stopPropagation();
            chatSocket.send(JSON.stringify({
                'action': 'delete_group',
                'group_id': group_id,
            }));
        } else if (event.target.matches('.kick-member')) {
            event.preventDefault();
            event.stopPropagation();
            container = event.target;
            member_id = container.dataset.memberId;
            chatSocket.send(JSON.stringify({
                'action': 'kick_member',
                'group_id': group_id,
                'member_id': member_id,
            }));
        } else if (event.target.matches('.mute-member')) {
            event.preventDefault();
            event.stopPropagation();
            container = event.target;
            member_id = container.dataset.memberId;
            chatSocket.send(JSON.stringify({
                'action': 'mute_member',
                'sender_id': conversationThread.dataset.senderId,
                'group_id': group_id,
                'member_id': member_id,

            }));
        }
    });
}
