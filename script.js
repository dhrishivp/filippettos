// Opening hours in minutes after midnight, keyed by day (0 = Sunday).
const HOURS = {
  2: [480, 1050],
  3: [480, 1050],
  4: [480, 1050],
  5: [480, 1050],
  6: [480, 1020],
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const h12 = h % 12 || 12;
  return h12 + (m ? ":" + String(m).padStart(2, "0") : "") + (h < 12 ? "am" : "pm");
}

// Current day and time in the UK, whatever the visitor's own timezone.
function nowInLondon() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type).value;
  return {
    day: DAY_NAMES.indexOf(get("weekday")),
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

function nextOpening(day) {
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    if (HOURS[d]) return { day: d, offset: i };
  }
}

function updateStatus() {
  const { day, minutes } = nowInLondon();
  const status = document.querySelector("[data-status]");
  const detail = document.querySelector("[data-status-detail]");
  const today = HOURS[day];

  if (today && minutes >= today[0] && minutes < today[1]) {
    status.textContent = "Open now";
    status.className = "status is-open";
    detail.textContent = "until " + formatTime(today[1]) + " today";
  } else {
    status.textContent = "Closed now";
    status.className = "status is-closed";
    if (today && minutes < today[0]) {
      detail.textContent = "opens at " + formatTime(today[0]) + " today";
    } else {
      const next = nextOpening(day);
      const when = next.offset === 1 ? "tomorrow" : DAY_NAMES[next.day];
      detail.textContent = "opens " + when + " at " + formatTime(HOURS[next.day][0]);
    }
  }

  document.querySelectorAll(".hours tr").forEach((row) => {
    row.classList.toggle("today", Number(row.dataset.day) === day);
  });
}

updateStatus();
setInterval(updateStatus, 60 * 1000);
