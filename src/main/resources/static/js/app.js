const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");

const roomNameInput = document.getElementById("roomName");
const joinCodeInput = document.getElementById("joinCode");

const message = document.getElementById("message");


function showMessage(text, isError = false) {

    message.textContent = text;

    if (isError) {
        message.style.color = "#dc2626";
    } else {
        message.style.color = "#16a34a";
    }
}


/* =========================
   CREATE ROOM
   ========================= */

createRoomBtn.addEventListener("click", async () => {

    const roomName = roomNameInput.value.trim();

    if (!roomName) {
        showMessage("Please enter a room name.", true);
        return;
    }

    try {

        createRoomBtn.disabled = true;
        createRoomBtn.textContent = "Creating...";

        const response = await fetch("/api/rooms", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: roomName
            })
        });


        const data = await response.json();


        if (!response.ok) {

            showMessage(
                data.message || "Failed to create room.",
                true
            );

            return;
        }


        // Room successfully created

        window.location.href = `/room/${data.joinCode}`;

    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to connect to the server.",
            true
        );

    } finally {

        createRoomBtn.disabled = false;
        createRoomBtn.textContent = "Create Room";
    }
});


/* =========================
   JOIN ROOM
   ========================= */

joinRoomBtn.addEventListener("click", async () => {

    const joinCode = joinCodeInput.value
        .trim()
        .toUpperCase();


    if (!joinCode) {

        showMessage(
            "Please enter a room code.",
            true
        );

        return;
    }


    try {

        joinRoomBtn.disabled = true;
        joinRoomBtn.textContent = "Joining...";


        const response = await fetch(
            `/api/rooms/${encodeURIComponent(joinCode)}`
        );


        const data = await response.json();


        if (!response.ok) {

            showMessage(
                data.message || "Unable to join room.",
                true
            );

            return;
        }


        // Room exists and is active

        window.location.href = `/room/${data.joinCode}`;

    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to connect to the server.",
            true
        );

    } finally {

        joinRoomBtn.disabled = false;
        joinRoomBtn.textContent = "Join Room";
    }
});