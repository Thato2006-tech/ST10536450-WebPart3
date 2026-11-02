// ===== EVENTS DATA (change these to your real events) =====
const events = [
  { name: "Winter Car Meet", type: "Car Meet", date: "2027-06-06", area: "Johannesburg", lat: -26.2041, lng: 28.0473, desc: "Our Sunday meet. Bring a blanket and your car." },
  { name: "Blanket Collection Drive", type: "Collection Drive", date: "2027-06-20", area: "Pretoria", lat: -25.7479, lng: 28.2293, desc: "Drop off blankets, jackets and warm clothes." },
  { name: "Shelter Delivery Day", type: "Delivery Day", date: "2027-07-04", area: "Soweto", lat: -26.2485, lng: 27.8540, desc: "Volunteers deliver donations to local shelters." },
  { name: "Mid-Winter Meet", type: "Car Meet", date: "2027-07-18", area: "Sandton", lat: -26.1076, lng: 28.0567, desc: "Final big meet of the drive." }
];

// ===== RUN EVERYTHING WHEN THE PAGE LOADS =====
document.addEventListener("DOMContentLoaded", function () {
  setupFadeIn();
  setupAccordion();
  setupLightbox();
  setupEvents();
  setupEnquiry();
  setupContact();
});

// ===== FADE IN ON SCROLL =====
function setupFadeIn() {
  const items = document.querySelectorAll("section, .stat-box");
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  });
  items.forEach(function (item) {
    item.classList.add("fade-in");
    observer.observe(item);
  });
}

// ===== ACCORDION (FAQ) =====
function setupAccordion() {
  const buttons = document.querySelectorAll(".accordion-btn");
  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      const panel = button.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });
}

// ===== GALLERY LIGHTBOX =====
function setupLightbox() {
  const images = document.querySelectorAll(".gallery-grid img");
  if (images.length === 0) return;

  let current = 0;

  // build the lightbox
  const box = document.createElement("div");
  box.className = "lightbox";
  box.hidden = true;
  box.innerHTML =
    '<button class="lb-close">&times;</button>' +
    '<button class="lb-prev">&#10094;</button>' +
    '<img alt="">' +
    '<p class="lb-caption"></p>' +
    '<button class="lb-next">&#10095;</button>';
  document.body.appendChild(box);

  const bigImage = box.querySelector("img");
  const caption = box.querySelector(".lb-caption");

  function showImage(number) {
    if (number < 0) number = images.length - 1;
    if (number >= images.length) number = 0;
    current = number;
    bigImage.src = images[current].src;
    bigImage.alt = images[current].alt;
    caption.textContent = images[current].alt;
  }

  images.forEach(function (img, number) {
    img.addEventListener("click", function () {
      showImage(number);
      box.hidden = false;
    });
  });

  box.querySelector(".lb-close").onclick = function () { box.hidden = true; };
  box.querySelector(".lb-prev").onclick = function () { showImage(current - 1); };
  box.querySelector(".lb-next").onclick = function () { showImage(current + 1); };
}

// ===== EVENTS: SEARCH, FILTER, SORT, MAP =====
function setupEvents() {
  const list = document.getElementById("eventList");
  if (list === null) return;

  const search = document.getElementById("eventSearch");
  const typeBox = document.getElementById("eventType");
  const sortBox = document.getElementById("eventSort");
  const count = document.getElementById("eventCount");

  // map
  let markers = null;
  if (window.L && document.getElementById("map")) {
    const map = L.map("map").setView([-26.0, 28.0], 9);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);
    markers = L.layerGroup().addTo(map);
  }

  function showEvents() {
    const word = search.value.toLowerCase();

    // filter
    const results = events.filter(function (e) {
      const text = (e.name + " " + e.area + " " + e.desc).toLowerCase();
      const typeOk = typeBox.value === "all" || e.type === typeBox.value;
      return typeOk && text.includes(word);
    });

    // sort
    results.sort(function (a, b) {
      if (sortBox.value === "name") {
        return a.name.localeCompare(b.name);
      }
      return a.date.localeCompare(b.date);
    });

    list.innerHTML = "";
    results.forEach(function (e) {
      const card = document.createElement("div");
      card.className = "event-card";
      card.innerHTML =
        "<h3>" + e.name + "</h3>" +
        "<p><strong>Date:</strong> " + e.date + "</p>" +
        "<p><strong>Area:</strong> " + e.area + " | <strong>Type:</strong> " + e.type + "</p>" +
        "<p>" + e.desc + "</p>";
      list.appendChild(card);
    });

    if (results.length === 0) {
      count.textContent = "No events found.";
    } else {
      count.textContent = results.length + " event(s) found";
    }

    if (markers) {
      markers.clearLayers();
      results.forEach(function (e) {
        L.marker([e.lat, e.lng]).addTo(markers).bindPopup("<strong>" + e.name + "</strong><br>" + e.area);
      });
    }
  }

  search.addEventListener("input", showEvents);
  typeBox.addEventListener("change", showEvents);
  sortBox.addEventListener("change", showEvents);
  showEvents();
}

// ===== FORM VALIDATION =====
// checks one field and shows an error message under it
function checkField(field) {
  const errorBox = field.parentElement.querySelector(".error");
  let message = "";

  if (field.validity.valueMissing) {
    message = "This field is required.";
  } else if (field.validity.tooShort) {
    message = "That is too short.";
  } else if (field.validity.patternMismatch) {
    message = "Phone must be 10 digits starting with 0.";
  } else if (field.validity.typeMismatch) {
    message = "Please enter a valid email address.";
  } else if (field.validity.rangeUnderflow || field.validity.rangeOverflow) {
    message = "Number must be between 1 and 1000.";
  }

  errorBox.textContent = message;
  if (message === "") {
    field.classList.remove("invalid");
    return true;
  }
  field.classList.add("invalid");
  return false;
}


function checkForm(form) {
  let allGood = true;
  const fields = form.querySelectorAll("input, select, textarea");
  fields.forEach(function (field) {
    if (checkField(field) === false) {
      allGood = false;
    }
  });
  return allGood;
}

// ===== ENQUIRY FORM =====
function setupEnquiry() {
  const form = document.getElementById("enquiryForm");
  if (form === null) return;
  const response = document.getElementById("enquiryResponse");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (checkForm(form) === false) return;

    // get what the user typed
    const name = document.getElementById("name").value;
    const type = document.getElementById("type").value;
    const qty = Number(document.getElementById("quantity").value);
    let message = "";

  
    if (type === "sponsor") {
      let tier = "Bronze";
      if (qty >= 100) tier = "Gold";
      else if (qty >= 50) tier = "Silver";
      message = "Thank you " + name + "! Sponsoring " + qty + " blankets puts you in our " + tier + " tier.";
    } else if (type === "volunteer") {
      message = "Thank you " + name + "! We have space for " + qty + " volunteer(s). We will email you to confirm.";
    } else {
      message = "Thank you " + name + "! You can drop off " + qty + " item(s) at any MSG event.";
    }

  
    response.hidden = false;
    response.className = "response success";
    response.textContent = message;


    fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    })
      .then(function (res) {
        if (res.ok) form.reset();
      })
      .catch(function () {
        response.textContent = message + " (We could not send your details online. Please email msgcharity@gmail.com.)";
      });
  });
}

// ===== CONTACT FORM =====
function setupContact() {
  const form = document.getElementById("contactForm");
  if (form === null) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

  
    if (checkForm(form) === false) return;

    // get what the user typed
    const name = document.getElementById("cname").value;
    const email = document.getElementById("cemail").value;
    const phone = document.getElementById("cphone").value;
    const type = document.getElementById("ctype").value;
    const text = document.getElementById("cmessage").value;

  
    const subject = type + " from " + name;
    const body = "Name: " + name + "\nEmail: " + email + "\nPhone: " + phone + "\n\n" + text;

    // show the email on the page
    document.getElementById("emailText").textContent =
      "To: molokommeoratile406@gmail.com\nSubject: " + subject + "\n\n" + body;

    
    document.getElementById("sendEmail").href =
      "mailto:molokommeoratile406@gmail.com?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);

    document.getElementById("emailPreview").hidden = false;
  });
}