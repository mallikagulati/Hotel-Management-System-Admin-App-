function openPanel() {
    document.querySelector(".side-panel").classList.add("open");
}

function closePanel() {
    document.querySelector(".side-panel").classList.remove("open");
}

async function bookRoom(event) {
    event.preventDefault();

    const email = document.querySelector("#email").value;
    const roomType = document.querySelector("#room-type").value;
    const roomNumber = document.querySelector("#room-number").value;
    const startTime = document.querySelector("#start-time").value;
    const endTime = document.querySelector("#end-time").value;

    let cost = 0;

    switch (roomType) {
        case "A":
            cost = 100 * getHoursDifference(startTime, endTime);
            break;
        case "B":
            cost = 80 * getHoursDifference(startTime, endTime);
            break;
        case "C":
            cost = 50 * getHoursDifference(startTime, endTime);
            break;
    }

    const booking = {
        email,
        roomType,
        roomNumber,
        startTime,
        endTime,
        cost,
    };

    try {
        const response = await fetch("/bookRoom", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(booking),
        });

        console.log("Response:", response);

        if (!response.ok) {
            throw new Error("Failed to book room.");
        }

        console.log("Room booked successfully!");
        alert(`Room booked successfully! Total cost: ${cost}`);
    } catch (error) {
        console.error("Error booking room:", error);
    }
}

function getHoursDifference(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = Math.abs(end - start);
    const hours = Math.floor(diff / 1000 / 60 / 60);
    return hours;
}

//edit
const editBookingForm =
    document.querySelector("#edit-booking-form");
const updateBookingForm = document.querySelector(
    "#update-booking-form"
);
const bookingDetailsDiv =
    document.querySelector("#booking-details");
const cancelBtn = document.querySelector("#cancel-btn");

editBookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = event.target.email.value;
    const response = await fetch(`/bookings/search${email}`);
    const booking = await response.json();

    if (!booking) {
        alert("Booking not found");
        return;
    }

    updateBookingForm.querySelector("#booking-id").value =
        booking.id;
    updateBookingForm.querySelector("#room-type").value =
        booking.roomType;
    updateBookingForm.querySelector("#start-time").value =
        booking.startTime;
    updateBookingForm.querySelector("#end-time").value =
        booking.endTime;

    bookingDetailsDiv.style.display = "block";
});

updateBookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const bookingId =
        event.target.querySelector("#booking-id").value;
    const roomType = event.target.querySelector("#room-type").value;
    const startTime =
        event.target.querySelector("#start-time").value;
    const endTime = event.target.querySelector("#end-time").value;

    const response = await fetch(`/bookings/update${bookingId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            roomType,
            startTime,
            endTime,
        }),
    });

    if (response.ok) {
        alert("Booking updated successfully");
        location.reload(); 
    } else {
        alert("Failed to update booking");
    }
});

cancelBtn.addEventListener("click", () => {

    bookingDetailsDiv.style.display = "none";
});

//view

const viewBtn = document.getElementById("view-btn");


viewBtn.addEventListener("click", function () {
    try {
       
        const response = fetch("/bookings");
        console.log(response);
        const data = response.json();

        
        const bookingTable =
            document.getElementById("booking-table");

        
        bookingTable.querySelector("tbody").innerHTML = "";

        
        data.forEach((booking) => {
            const row = bookingTable.insertRow();
            row.innerHTML = `
                    <td>${booking.id}</td>
                    <td>${booking.room_number}</td>
                    <td>${booking.room_type}</td>
                    <td>${booking.start_time}</td>
                    <td>${booking.end_time}</td>
                    `;
        });
    } catch (error) {
        console.log(error);
    }
});

// displayBookings();

// //delete

async function cancelBooking(bookingId) {
    const response = await fetch(`/bookings/id:'${bookingId}`, {
        method: "DELETE",
    });
    const data = await response.json();
    alert(`${data.message}. Refund amount: $${data.refundAmount}`);
    location.reload(); // refresh the page to update the list of bookings
}