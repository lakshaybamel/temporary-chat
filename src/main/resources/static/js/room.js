const roomNameElement = document.getElementById("roomName");

const joinCodeElement = document.getElementById("joinCode");

const sidebarJoinCodeElement = document.getElementById("sidebarJoinCode");

const expiryTimeElement = document.getElementById("expiryTime");

const qrCodeElement = document.getElementById("qrCode");

const copyLinkBtn = document.getElementById("copyLinkBtn");

const leaveRoomBtn = document.getElementById("leaveRoomBtn");

const messageInput = document.getElementById("messageInput");

const sendMessageBtn = document.getElementById("sendMessageBtn");

/* =========================
   GET JOIN CODE FROM URL
   ========================= */

const pathParts = window.location.pathname.split("/");

const joinCode = pathParts[pathParts.length - 1].toUpperCase();

/* =========================
   ROOM DATA
   ========================= */

let room = null;
let countdownInterval = null;
let stompClient = null;

/* =========================
   LOAD ROOM
   ========================= */

async function loadRoom() {
	try {
		const response = await fetch(`/api/rooms/${encodeURIComponent(joinCode)}`);

		const data = await response.json();

		if (!response.ok) {
			alert(data.message || "Unable to access room.");

			window.location.href = "/";

			return false;
		}

		room = data;

		displayRoom(data);

		return true;
	} catch (error) {
		console.error("Failed to load room:", error);

		alert("Unable to connect to the server.");

		window.location.href = "/";

		return false;
	}
}

/* =========================
   LOAD MESSAGE HISTORY
   ========================= */

async function loadMessages() {
	try {
		const response = await fetch(
			`/api/rooms/${encodeURIComponent(joinCode)}/messages`,
		);

		const messages = await response.json();

		if (!response.ok) {
			console.error("Failed to load messages:", messages);

			return;
		}

		displayMessages(messages);
	} catch (error) {
		console.error("Failed to load message history:", error);
	}
}

/* =========================
   FILE DOWNLOAD FUNCTION
   ========================= */

async function downloadFile(messageId, button) {
	try {
		button.disabled = true;
		button.textContent = "Preparing...";

		const response = await fetch(
			`/api/rooms/${encodeURIComponent(joinCode)}/files/${messageId}`,
		);

		const data = await response.json();

		if (!response.ok) {
			alert(data.message || "Unable to download file.");

			return;
		}

		// Open the temporary signed URL
		window.open(data.downloadUrl, "_blank");
	} catch (error) {
		console.error("File download error:", error);

		alert("Unable to download file.");
	} finally {
		button.disabled = false;
		button.textContent = "Download";
	}
}

/* =========================
   DISPLAY ROOM
   ========================= */

function displayRoom(room) {
	roomNameElement.textContent = room.name;

	joinCodeElement.textContent = room.joinCode;

	sidebarJoinCodeElement.textContent = room.joinCode;

	/* =========================
       QR CODE
       ========================= */

	qrCodeElement.src = `/api/rooms/${encodeURIComponent(room.joinCode)}/qr`;

	/* =========================
       COUNTDOWN
       ========================= */

	startCountdown(new Date(room.expiresAt));
}

/* =========================
   COUNTDOWN
   ========================= */

function startCountdown(expiryDate) {
	updateCountdown(expiryDate);

	countdownInterval = setInterval(() => {
		updateCountdown(expiryDate);
	}, 1000);
}

function updateCountdown(expiryDate) {
	const now = new Date();

	const difference = expiryDate.getTime() - now.getTime();

	if (difference <= 0) {
		clearInterval(countdownInterval);

		expiryTimeElement.textContent = "Expired";

		return;
	}

	const totalSeconds = Math.floor(difference / 1000);

	const hours = Math.floor(totalSeconds / 3600);

	const minutes = Math.floor((totalSeconds % 3600) / 60);

	const seconds = totalSeconds % 60;

	expiryTimeElement.textContent =
		`${String(hours).padStart(2, "0")}:` +
		`${String(minutes).padStart(2, "0")}:` +
		`${String(seconds).padStart(2, "0")}`;
}

/* =========================
   DISPLAY MESSAGE HISTORY
   ========================= */

function displayMessages(messages) {
	const messagesContainer = document.getElementById("messages");

	messagesContainer.innerHTML = "";

	if (messages.length === 0) {
		messagesContainer.innerHTML = `
            <div class="empty-message">
                No messages yet.
            </div>
        `;

		return;
	}

	messages.forEach((message) => {
		const messageElement = document.createElement("div");

		messageElement.classList.add("message-item");

		/* =========================
           TEXT MESSAGE
           ========================= */

		if (message.messageType === "TEXT") {
			messageElement.innerHTML = `
                <strong>
                    ${escapeHtml(message.senderName)}
                </strong>

                <p>
                    ${escapeHtml(message.content)}
                </p>

                <small>
                    ${formatTime(message.createdAt)}
                </small>
            `;
		}

		/* =========================
           FILE MESSAGE
           ========================= */
		else if (message.messageType === "FILE") {
			messageElement.innerHTML = `
                <strong>
                    ${escapeHtml(message.senderName)}
                </strong>

                <div class="file-message">

                    <span class="file-name">
                        📎 ${escapeHtml(message.fileName)}
                    </span>

                    <button
                        class="download-file-btn"
                        data-message-id="${message.id}">
                        Download
                    </button>

                </div>
            `;
		}

		messagesContainer.appendChild(messageElement);
	});

	/* Scroll to latest message */

	messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/* =========================
   ESCAPE HTML
   ========================= */

function escapeHtml(text) {
	if (text === null || text === undefined) {
		return "";
	}

	const div = document.createElement("div");

	div.textContent = text;

	return div.innerHTML;
}

/* =========================
   FORMAT MESSAGE TIME
   ========================= */

function formatTime(dateString) {
	if (!dateString) {
		return "";
	}

	return new Date(dateString).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}

/* =========================
   WebSocket connection
   ========================= */

function connectWebSocket() {
	stompClient = new StompJs.Client({
		brokerURL: `ws://${window.location.host}/ws`,

		reconnectDelay: 5000,

		debug: function (message) {
			console.log("[STOMP]", message);
		},
	});

	stompClient.onConnect = function () {
		console.log("WebSocket connected");

		stompClient.subscribe(`/topic/room/${joinCode}`, function (message) {
			console.log("===== CHAT MESSAGE RECEIVED =====");

			console.log("Raw body:", message.body);

			try {
				const chatMessage = JSON.parse(message.body);

				console.log("Parsed message:", chatMessage);

				console.log("Message type:", chatMessage.messageType);

				displayNewMessage(chatMessage);
			} catch (error) {
				console.error("Failed to process WebSocket message:", error);
			}
		});
	};

	stompClient.onStompError = function (frame) {
		console.error("STOMP error:", frame.headers["message"]);
	};

	stompClient.onWebSocketError = function (error) {
		console.error("WebSocket error:", error);
	};

	stompClient.activate();
}

/* =========================
   Generate anonymous sender name
   ========================= */

function getSenderName() {
	let senderName = sessionStorage.getItem("senderName");

	if (!senderName) {
		const randomNumber = Math.floor(1000 + Math.random() * 9000);

		senderName = `Guest-${randomNumber}`;

		sessionStorage.setItem("senderName", senderName);
	}

	return senderName;
}

/* =========================
   SEND MESSAGE
   ========================= */

function sendMessage() {
	const content = messageInput.value.trim();

	if (!content) {
		return;
	}

	if (!stompClient || !stompClient.connected) {
		alert("Chat connection is not ready.");

		return;
	}

	stompClient.publish({
		destination: `/app/chat/${joinCode}`,

		body: JSON.stringify({
			content: content,

			senderName: getSenderName(),
		}),
	});

	messageInput.value = "";

	messageInput.focus();
}

/* =========================
   Display real-time messages
   ========================= */

function displayNewMessage(message) {
	console.log("Displaying message:", message);

	const messagesContainer = document.getElementById("messages");

	const emptyMessage = messagesContainer.querySelector(".empty-message");

	if (emptyMessage) {
		emptyMessage.remove();
	}

	const messageElement = document.createElement("div");

	messageElement.classList.add("message-item");

	if (message.messageType === "TEXT") {
		messageElement.innerHTML = `
            <strong>
                ${escapeHtml(message.senderName)}
            </strong>

            <p>
                ${escapeHtml(message.content)}
            </p>

            <small>
                ${formatTime(message.createdAt)}
            </small>
        `;
	} else if (message.messageType === "FILE") {
		messageElement.innerHTML = `
             <strong>
                 ${escapeHtml(message.senderName)}
             </strong>

             <div class="file-message">

                 <span class="file-name">
                     📎 ${escapeHtml(message.fileName)}
                 </span>

                 <button
                     class="download-file-btn"
                     data-message-id="${message.id}">
                     Download
                 </button>

             </div>

             <small>
                 ${formatTime(message.createdAt)}
             </small>
         `;
	} else {
		console.warn("Unknown message type:", message.messageType);

		return;
	}

	messagesContainer.appendChild(messageElement);

	messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/* =========================
   SEND MESSAGE BTN
   ========================= */

sendMessageBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (event) => {
	if (event.key === "Enter") {
		event.preventDefault();

		sendMessage();
	}
});

/* =========================
   COPY ROOM LINK
   ========================= */

copyLinkBtn.addEventListener("click", async () => {
	if (!room) {
		return;
	}

	const roomUrl = `${window.location.origin}/room/${room.joinCode}`;

	try {
		await navigator.clipboard.writeText(roomUrl);

		copyLinkBtn.textContent = "Copied!";

		setTimeout(() => {
			copyLinkBtn.textContent = "Copy Room Link";
		}, 1500);
	} catch (error) {
		console.error("Failed to copy room link:", error);

		alert("Unable to copy room link.");
	}
});

/* =========================
   CLICK HANDLER
   ========================= */

document.addEventListener("click", function (event) {
	const button = event.target.closest(".download-file-btn");

	if (!button) {
		return;
	}

	const messageId = button.dataset.messageId;

	if (!messageId) {
		return;
	}

	downloadFile(messageId, button);
});

/* =========================
   LEAVE ROOM
   ========================= */

leaveRoomBtn.addEventListener("click", () => {
	window.location.href = "/";
});

/* =========================
   START
   ========================= */

loadRoom().then(async (roomLoaded) => {
	if (!roomLoaded) {
		return;
	}

	await loadMessages();

	connectWebSocket();
});
