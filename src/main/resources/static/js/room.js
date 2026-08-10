const roomNameElement = document.getElementById("roomName");

const joinCodeElement = document.getElementById("joinCode");

const sidebarJoinCodeElement = document.getElementById("sidebarJoinCode");

const expiryTimeElement = document.getElementById("expiryTime");

const qrCodeElement = document.getElementById("qrCode");

const copyLinkBtn = document.getElementById("copyLinkBtn");

const leaveRoomBtn = document.getElementById("leaveRoomBtn");

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

                <p>
                    📎
                    ${escapeHtml(message.fileName)}
                </p>

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
	});
}

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
   LEAVE ROOM
   ========================= */

leaveRoomBtn.addEventListener("click", () => {
	window.location.href = "/";
});

/* =========================
   START
   ========================= */

loadRoom().then((roomLoaded) => {
	if (roomLoaded) {
		loadMessages();
	}
});
