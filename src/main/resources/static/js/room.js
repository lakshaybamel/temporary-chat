const roomNameElement = document.getElementById("roomName");
const joinCodeElement = document.getElementById("joinCode");
const sidebarJoinCodeElement =
    document.getElementById("sidebarJoinCode");

const expiryTimeElement =
    document.getElementById("expiryTime");

const qrCodeElement =
    document.getElementById("qrCode");

const copyLinkBtn =
    document.getElementById("copyLinkBtn");

const leaveRoomBtn =
    document.getElementById("leaveRoomBtn");


/* =========================
   GET JOIN CODE FROM URL
   ========================= */

const pathParts =
    window.location.pathname.split("/");

const joinCode =
    pathParts[pathParts.length - 1].toUpperCase();


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

        const response = await fetch(
            `/api/rooms/${encodeURIComponent(joinCode)}`
        );


        const data = await response.json();


        if (!response.ok) {

            alert(
                data.message || "Unable to access room."
            );

            window.location.href = "/";

            return;
        }


        room = data;

        displayRoom(data);

    } catch (error) {

        console.error(error);

        alert("Unable to connect to the server.");

        window.location.href = "/";
    }
}


/* =========================
   DISPLAY ROOM
   ========================= */

function displayRoom(room) {

    roomNameElement.textContent =
        room.name;

    joinCodeElement.textContent =
        room.joinCode;

    sidebarJoinCodeElement.textContent =
        room.joinCode;


    /* QR Code */

    qrCodeElement.src =
        `/api/rooms/${encodeURIComponent(room.joinCode)}/qr`;


    /* Countdown */

    startCountdown(
        new Date(room.expiresAt)
    );
}


/* =========================
   COUNTDOWN
   ========================= */

function startCountdown(expiryDate) {

    updateCountdown(expiryDate);

    countdownInterval =
        setInterval(() => {

            updateCountdown(expiryDate);

        }, 1000);
}


function updateCountdown(expiryDate) {

    const now = new Date();

    const difference =
        expiryDate.getTime() - now.getTime();


    if (difference <= 0) {

        clearInterval(countdownInterval);

        expiryTimeElement.textContent =
            "Expired";

        return;
    }


    const totalSeconds =
        Math.floor(difference / 1000);


    const hours =
        Math.floor(totalSeconds / 3600);

    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );

    const seconds =
        totalSeconds % 60;


    expiryTimeElement.textContent =
        `${String(hours).padStart(2, "0")}:` +
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`;
}


/* =========================
   COPY ROOM LINK
   ========================= */

copyLinkBtn.addEventListener(
    "click",
    async () => {

        const roomUrl =
            `${window.location.origin}/room/${room.joinCode}`;

        try {

            await navigator.clipboard.writeText(roomUrl);

            copyLinkBtn.textContent =
                "Copied!";

            setTimeout(() => {

                copyLinkBtn.textContent =
                    "Copy Room Link";

            }, 1500);

        } catch (error) {

            console.error(error);

            alert(
                "Unable to copy room link."
            );
        }
    }
);


/* =========================
   LEAVE ROOM
   ========================= */

leaveRoomBtn.addEventListener(
    "click",
    () => {

        window.location.href = "/";
    }
);


/* =========================
   START
   ========================= */

loadRoom();