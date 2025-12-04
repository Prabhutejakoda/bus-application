let availableSeats = parseInt(localStorage.getItem("availableSeats")) || 0;
let passengers = JSON.parse(localStorage.getItem("passengers")) || [];
let travelDetails = {};
let bookingIdCounter = Date.now();
let currentPassengerCount = 0;

function bookTicket() {
  let count = parseInt(prompt("Enter number of tickets:"));
  if (!count || count <= 0) {
    alert("Invalid ticket count!");
    return;
  }
  if (count > availableSeats) {
    alert("Not enough seats available! Only " + availableSeats + " left.");
    return;
  }
  currentPassengerCount = count;
  document.getElementById("welcomePage").classList.add("hidden");
  document.getElementById("bookingPage").classList.remove("hidden");
  generatePassengerForms(count);
}

function adminLogin() {
  let pwd = prompt("Enter Admin Password:");
  if (pwd === "Prabhu@123") {
    document.getElementById("welcomePage").classList.add("hidden");
    document.getElementById("adminPage").classList.remove("hidden");
    loadAdminData();
  } else {
    alert("Incorrect Password!");
  }
}

function setSeats() {
  availableSeats = parseInt(document.getElementById("seatCount").value);
  if (isNaN(availableSeats) || availableSeats <= 0) {
    alert("Enter valid seat count!");
  } else {
    alert("Available seats set to " + availableSeats);
    localStorage.setItem("availableSeats", availableSeats);
  }
}

function generatePassengerForms(count) {
  let form = document.getElementById("passengerForms");
  form.innerHTML = "";
  for (let i = 1; i <= count; i++) {
    form.innerHTML += `
      <h3>Passenger ${i}</h3>
      <input type="text" id="name${i}" placeholder="Name">
      <input type="number" id="age${i}" placeholder="Age">
      <input type="text" id="phone${i}" placeholder="10-digit Phone Number">
      <input type="text" id="aadhaar${i}" placeholder="12-digit Aadhaar Number">
    `;
  }
  form.innerHTML += `<button type="button" onclick="savePassengerDetails(${count})">Save Details</button>`;
}

function savePassengerDetails(count) {
  let aadhaarSet = new Set(passengers.map(p => p.aadhaar));
  let newPassengers = [];

  for (let i = 1; i <= count; i++) {
    let name = document.getElementById("name" + i).value.trim();
    let age = parseInt(document.getElementById("age" + i).value);
    let phone = document.getElementById("phone" + i).value.trim();
    let aadhaar = document.getElementById("aadhaar" + i).value.trim();

    if (!name || !age || !phone || !aadhaar) {
      alert("Please fill all fields for Passenger " + i);
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      alert("Phone number must be exactly 10 digits for Passenger " + i);
      return;
    }
    if (!/^\d{12}$/.test(aadhaar)) {
      alert("Aadhaar must be 12 digits for Passenger " + i);
      return;
    }
    if (aadhaarSet.has(aadhaar)) {
      alert("Duplicate Aadhaar not allowed: " + aadhaar);
      return;
    }

    let fare = (age < 10 || age > 50) ? 0 : 500;

    newPassengers.push({
      id: "BID" + (bookingIdCounter++),
      name, age, phone, aadhaar, fare
    });
    aadhaarSet.add(aadhaar);
  }

  passengers = passengers.concat(newPassengers);
  availableSeats -= count;
  localStorage.setItem("passengers", JSON.stringify(passengers));
  localStorage.setItem("availableSeats", availableSeats);
  alert("Passenger details saved!");
  document.getElementById("bookingPage").classList.add("hidden");
  document.getElementById("travelPage").classList.remove("hidden");
}

function confirmPayment() {
  let from = document.getElementById("from").value.trim();
  let to = document.getElementById("to").value.trim();

  if (!from || !to) {
    alert("Fill all travel details!");
    return;
  }

  let basePrice = currentPassengerCount * 500;

  let freeAdjustment = passengers.slice(-currentPassengerCount)
    .reduce((sum, p) => sum + (p.fare === 0 ? 500 : 0), 0);

  let totalFare = basePrice - freeAdjustment;

  if (confirm(`Proceed with payment of Rs.${totalFare}?`)) {
    travelDetails = { from, to, payment: totalFare };
    localStorage.setItem("travelDetails", JSON.stringify(travelDetails));
    document.getElementById("travelPage").classList.add("hidden");
    document.getElementById("confirmPage").classList.remove("hidden");
    showConfirmation();
  }
}

function showConfirmation() {
  let details = "<h3>Booking Details</h3>";
  passengers.slice(-currentPassengerCount).forEach(p => {
    details += `
      <p><b>ID:</b> ${p.id}, <b>Name:</b> ${p.name}, <b>Age:</b> ${p.age}, 
      <b>Phone:</b> ${p.phone}, <b>Aadhaar:</b> ${p.aadhaar}, 
      <b>Fare:</b> Rs.${p.fare}</p>
    `;
  });
  details += `<h4>From: ${travelDetails.from} → To: ${travelDetails.to}</h4>
              <h4>Total Payment: Rs.${travelDetails.payment}</h4>`;
  document.getElementById("confirmDetails").innerHTML = details;
}

function loadAdminData() {
  let storedPassengers = JSON.parse(localStorage.getItem("passengers")) || [];
  let storedTravel = JSON.parse(localStorage.getItem("travelDetails")) || {};
  let pList = "";
  storedPassengers.forEach(p => {
    pList += `<p><b>${p.id}</b> - ${p.name}, Age: ${p.age}, Aadhaar: ${p.aadhaar}, Fare: Rs.${p.fare}</p>`;
  });
  document.getElementById("passengerList").innerHTML = pList || "No Passengers";
  let tList = "";
  if (storedTravel.from) {
    tList += `<p>From: ${storedTravel.from}, To: ${storedTravel.to}, Payment: Rs.${storedTravel.payment}</p>`;
  }
  document.getElementById("travelList").innerHTML = tList || "No Travel Details";
}

function backToWelcome() {
  document.querySelectorAll(".container").forEach(div => div.classList.add("hidden"));
  document.getElementById("welcomePage").classList.remove("hidden");
}
