let matches = [];
let editIndex = -1;

const matchesBox = document.getElementById("matches");
const modal = document.getElementById("modal");
const form = document.getElementById("matchForm");

async function loadMatches() {
  try {
    const response = await fetch("../data/matches.json", {
      cache: "no-store"
    });

    matches = await response.json();
    render();
  } catch (error) {
    console.error(error);
    matchesBox.innerHTML =
      "<p>تعذر تحميل المباريات.</p>";
  }
}

function render() {

  const search =
    document.getElementById("search").value.toLowerCase();

  matchesBox.innerHTML = "";

  matches
    .filter(match => {

      const text =
        `${match.league} ${match.home} ${match.away}`
          .toLowerCase();

      return text.includes(search);
    })
    .forEach((match, index) => {

      const div = document.createElement("div");

      div.className = "match";

      div.innerHTML = `
        <div class="match-top">
          <span>
            ${match.leagueIcon || ""} ${match.league}
          </span>

          <span class="${match.status}">
            ${match.status.toUpperCase()}
          </span>
        </div>

        <div class="teams">

          <strong>${match.home}</strong>

          <div>
            <div class="score">
              ${match.score || "VS"}
            </div>
            <small>${match.time}</small>
          </div>

          <strong>${match.away}</strong>

        </div>

        <div class="actions">

          <button
            class="edit"
            onclick="editMatch(${index})">
            ✏️ تعديل
          </button>

          <button
            class="delete"
            onclick="deleteMatch(${index})">
            🗑️ حذف
          </button>

        </div>
      `;

      matchesBox.appendChild(div);
    });
}

function openModal(index = -1) {

  editIndex = index;

  document.getElementById("modalTitle").textContent =
    index === -1 ? "إضافة مباراة" : "تعديل المباراة";

  if (index === -1) {

    form.reset();

    document.getElementById("score").value = "VS";

  } else {

    const m = matches[index];

    document.getElementById("league").value = m.league || "";
    document.getElementById("leagueIcon").value = m.leagueIcon || "";
    document.getElementById("home").value = m.home || "";
    document.getElementById("away").value = m.away || "";
    document.getElementById("time").value = m.time || "";
    document.getElementById("status").value = m.status || "upcoming";
    document.getElementById("score").value = m.score || "VS";
    document.getElementById("channel").value = m.channel || "";
    document.getElementById("commentator").value =
      m.commentator || "";
  }

  modal.classList.remove("hidden");
}

function editMatch(index) {
  openModal(index);
}

function deleteMatch(index) {

  if (!confirm("هل تريد حذف هذه المباراة؟")) {
    return;
  }

  matches.splice(index, 1);

  render();
}

form.addEventListener("submit", event => {

  event.preventDefault();

  const match = {
    league: document.getElementById("league").value.trim(),
    leagueIcon: document.getElementById("leagueIcon").value.trim(),
    home: document.getElementById("home").value.trim(),
    away: document.getElementById("away").value.trim(),
    time: document.getElementById("time").value,
    status: document.getElementById("status").value,
    score: document.getElementById("score").value.trim(),
    channel: document.getElementById("channel").value.trim(),
    commentator:
      document.getElementById("commentator").value.trim()
  };

  if (editIndex === -1) {
    matches.push(match);
  } else {
    matches[editIndex] = match;
  }

  modal.classList.add("hidden");

  render();
});

document.getElementById("addBtn")
  .addEventListener("click", () => openModal());

document.getElementById("closeModal")
  .addEventListener("click", () => {
    modal.classList.add("hidden");
  });

document.getElementById("search")
  .addEventListener("input", render);

document.getElementById("saveBtn")
  .addEventListener("click", async () => {

    const response = await fetch("/api/update-matches", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        matches
      })
    });

    if (response.ok) {
      alert("✅ تم تحديث المباريات");
    } else {
      alert("❌ حدث خطأ أثناء الحفظ");
    }
  });

loadMatches();
