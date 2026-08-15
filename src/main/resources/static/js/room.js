const roomNameElement = document.getElementById("roomName");

const joinCodeElement = document.getElementById("joinCode");

const sidebarJoinCodeElement = document.getElementById("sidebarJoinCode");

const expiryTimeElement = document.getElementById("expiryTime");

const qrCodeElement = document.getElementById("qrCode");

const copyLinkBtn = document.getElementById("copyLinkBtn");

const leaveRoomBtn = document.getElementById("leaveRoomBtn");

const messageInput = document.getElementById("messageInput");

const sendMessageBtn = document.getElementById("sendMessageBtn");

const fileInput = document.getElementById("fileInput");

const attachFileBtn = document.getElementById("attachFileBtn");

const selectedFile = document.getElementById("selectedFile");

const selectedFileName = document.getElementById("selectedFileName");

const removeFileBtn = document.getElementById("removeFileBtn");

const uploadFileBtn = document.getElementById("uploadFileBtn");

const activeUsersElement = document.getElementById("activeUsers");

const activeUsersCountElement = document.getElementById("activeUsersCount");

/* =========================
   GET JOIN CODE FROM URL
   ========================= */

const pathParts = window.location.pathname.split("/");

const joinCode = pathParts[pathParts.length - 1].toUpperCase();

/* =========================
   COPY ICON (used on TEXT messages only)
   ========================= */

const copyIconSvg = `<svg viewBox="0 0 24 24" fill="none" width="14" height="14" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

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
            `/api/rooms/${encodeURIComponent(joinCode)}/files/${messageId}`
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to download file.");
            return;
        }

        // Fetch the actual file from the signed URL
        const fileResponse = await fetch(data.downloadUrl);

        if (!fileResponse.ok) {
            throw new Error("Failed to fetch file.");
        }

        const blob = await fileResponse.blob();

        // Create a temporary download link
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = downloadUrl;
        link.download = data.fileName || "download";
        document.body.appendChild(link);
        link.click();

        link.remove();
        URL.revokeObjectURL(downloadUrl);

    } catch (error) {
        console.error("File download error:", error);
        alert("Unable to download file.");
    } finally {
        button.disabled = false;
        button.textContent = "Download";
    }
}

/* =========================
   FILE UPLOAD FUNCTION
   ========================= */

async function uploadFile(file) {
	if (!file) {
		return;
	}

	// 10 MB limit
	const maxFileSize = 10 * 1024 * 1024;

	if (file.size > maxFileSize) {
		alert("File size cannot exceed 10 MB.");

		return;
	}

	try {
		attachFileBtn.disabled = true;
		sendMessageBtn.disabled = true;
		uploadFileBtn.disabled = true;
        removeFileBtn.disabled = true;

		selectedFileName.textContent = `Uploading ${file.name}...`;

		const formData = new FormData();

		formData.append("file", file);

		formData.append("senderName", getSenderName());

		const response = await fetch(
			`/api/rooms/${encodeURIComponent(joinCode)}/files`,
			{
				method: "POST",
				body: formData,
			},
		);

		const data = await response.json();

		if (!response.ok) {
			alert(data.message || "Unable to upload file.");

			return;
		}

		console.log("File uploaded successfully:", data);

		// The FILE message will arrive through
		// the existing WebSocket subscription.

		fileInput.value = "";

		selectedFileName.textContent = "";

		selectedFile.style.display = "none";
	} catch (error) {
		console.error("File upload error:", error);

		alert("Unable to upload file.");
	} finally {
		attachFileBtn.disabled = false;
        sendMessageBtn.disabled = false;
        uploadFileBtn.disabled = false;
        removeFileBtn.disabled = false;
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
                <div class="message-head">
                    <strong>${escapeHtml(message.senderName)}</strong>
                    <button type="button" class="copy-message-btn" title="Copy message" aria-label="Copy message">${copyIconSvg}</button>
                </div>

                <p class="message-text">${escapeHtml(message.content)}</p>

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

                <div class="file-card">

                    <div class="file-info">

                        <div class="file-name">
                            📄 ${escapeHtml(message.fileName)}
                        </div>

                        <div class="file-size">
                            ${formatFileSize(message.fileSize)}
                        </div>

                    </div>

                    <button
                        type="button"
                        class="download-file-btn"
                        data-message-id="${message.id}">
                        Download
                    </button>

                </div>

                <small>
                    ${formatTime(message.createdAt)}
                </small>
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
		timeZone: "Asia/Kolkata",
	});
}

/* =========================
   FORMAT FILE SIZE
   ========================= */

function formatFileSize(bytes) {

    if (
        bytes === null ||
        bytes === undefined ||
        bytes === 0
    ) {
        return "Unknown size";
    }

    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];

    let size = bytes;
    let unitIndex = 0;

    while (
        size >= 1024 &&
        unitIndex < units.length - 1
    ) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(
        unitIndex === 0 ? 0 : 2
    )} ${units[unitIndex]}`;
}

/* =========================
   WebSocket connection
   ========================= */

function connectWebSocket() {
	stompClient = new StompJs.Client({
		brokerURL: `${window.location.protocol === "https:" ? "wss://" : "ws://"}${window.location.host}/ws`,

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

		/* =========================
		   ACTIVE USERS (presence)
		   Only updates the badge when the backend actually
		   publishes a real count. No fake/random values.
		   ========================= */

		stompClient.subscribe(`/topic/room/${joinCode}/presence`, function (message) {
			try {
				const data = JSON.parse(message.body);

				updateActiveUsers(data);
			} catch (error) {
				console.error("Failed to process presence message:", error);
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
   ACTIVE USERS (presence)
   ========================= */

function updateActiveUsers(data) {
	const count = typeof data === "number" ? data : data && data.activeUsers;

	if (typeof count !== "number" || Number.isNaN(count)) {
		return;
	}

	activeUsersCountElement.textContent = count;

	activeUsersElement.classList.add("visible");
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

	resizeMessageInput();
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
            <div class="message-head">
                <strong>${escapeHtml(message.senderName)}</strong>
                <button type="button" class="copy-message-btn" title="Copy message" aria-label="Copy message">${copyIconSvg}</button>
            </div>

            <p class="message-text">${escapeHtml(message.content)}</p>

            <small>
                ${formatTime(message.createdAt)}
            </small>
        `;
	} else if (message.messageType === "FILE") {

          messageElement.innerHTML = `
              <strong>
                  ${escapeHtml(message.senderName)}
              </strong>

              <div class="file-card">

                  <div class="file-info">

                      <div class="file-name">
                          📄 ${escapeHtml(message.fileName)}
                      </div>

                      <div class="file-size">
                          ${formatFileSize(message.fileSize)}
                      </div>

                  </div>

                  <button
                      type="button"
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
	if (event.key === "Enter" && !event.shiftKey) {
		event.preventDefault();

		sendMessage();
	}

	// Shift + Enter falls through to the textarea's default
	// behavior, which inserts a new line.
});

/* =========================
   AUTO-RESIZE COMPOSER
   Grows the textarea with content up to a max height,
   then becomes internally scrollable.
   ========================= */

const MESSAGE_INPUT_MAX_HEIGHT = 160;

function resizeMessageInput() {
	messageInput.style.height = "auto";

	const newHeight = Math.min(messageInput.scrollHeight, MESSAGE_INPUT_MAX_HEIGHT);

	messageInput.style.height = `${newHeight}px`;

	messageInput.style.overflowY =
		messageInput.scrollHeight > MESSAGE_INPUT_MAX_HEIGHT ? "auto" : "hidden";
}

messageInput.addEventListener("input", resizeMessageInput);

resizeMessageInput();

/* =========================
   COPY MESSAGE TEXT
   Copies the exact original message content, formatting
   (newlines/tabs/spaces) intact. TEXT messages only.
   ========================= */

document.addEventListener("click", function (event) {
	const copyBtn = event.target.closest(".copy-message-btn");

	if (!copyBtn) {
		return;
	}

	const messageItem = copyBtn.closest(".message-item");

	const textElement = messageItem ? messageItem.querySelector(".message-text") : null;

	if (!textElement) {
		return;
	}

	navigator.clipboard
		.writeText(textElement.textContent)
		.then(() => {
			copyBtn.classList.add("copied");
			copyBtn.setAttribute("aria-label", "Copied!");

			setTimeout(() => {
				copyBtn.classList.remove("copied");
				copyBtn.setAttribute("aria-label", "Copy message");
			}, 1500);
		})
		.catch((error) => {
			console.error("Failed to copy message:", error);
		});
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
   DOWNLOAD CLICK HANDLER
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
   Open the file picker
   ========================= */

attachFileBtn.addEventListener("click", () => {
	fileInput.click();
});

/* =========================
   Display the selected file
   ========================= */

fileInput.addEventListener(
    "change",
    () => {

        if (!fileInput.files.length) {
            return;
        }

        const file =
            fileInput.files[0];

        const maxFileSize =
            10 * 1024 * 1024;


        // Validate size immediately
        if (file.size > maxFileSize) {

            alert(
                "File size cannot exceed 10 MB."
            );

            fileInput.value = "";

            selectedFileName.textContent = "";

            selectedFile.style.display =
                "none";

            return;
        }


        selectedFileName.textContent =
            `${file.name} (${formatFileSize(file.size)})`;

        selectedFile.style.display =
            "flex";
    }
);

/* =========================
   Remove selected file
   ========================= */

removeFileBtn.addEventListener("click", () => {
	fileInput.value = "";

	selectedFileName.textContent = "";

	selectedFile.style.display = "none";
});

/* =========================
   Upload button handler
   ========================= */

uploadFileBtn.addEventListener("click", () => {
	if (!fileInput.files.length) {
		return;
	}

	const file = fileInput.files[0];

	uploadFile(file);
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