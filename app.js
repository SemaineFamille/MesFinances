console.log("APP VERSION 22-06-2026 13h30");


function normalizeLabel(label) {
  return (label || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}


function showScreen(screenId) {
  document
    .querySelectorAll(".screen")
    .forEach(screen =>
      screen.classList.remove("active")
    );

  document
    .getElementById(screenId)
    .classList.add("active");

  if (screenId === "financeScreen") {
    loadFinanceScreen();
  }
}

function toggleAssuraForm(){

  const form =
    document.getElementById("assuraForm");

  form.style.display =
    form.style.display === "none"
      ? "block"
      : "none";
}

function toggleKptForm(){

  const form =
    document.getElementById("kptForm");

  form.style.display =
    form.style.display === "none"
      ? "block"
      : "none";
}



async function addAssuraFacture() {
  const id = Date.now();

  const date =
    document.getElementById("assuraDate").value;

  const prestataire =
    document.getElementById("assuraPrestataire").value;

  const type =
    document.getElementById("assuraType").value;

  const montant =
    document.getElementById("assuraMontant").value;

  const notes =
    document.getElementById("assuraNotes").value;

  if (!date || !montant) {

    alert("Veuillez remplir les champs");

    return;
  }

  await saveAssura({
    id,
    date,
    prestataire,
    type,
    montant,
    notes
  });

  alert("Facture enregistrée");

  loadAssura();
}
async function addKptFacture() {
  const id = Date.now();

  const date = document.getElementById("kptDate").value;
  const assurance = document.getElementById("kptAssurance").value;
  const type = document.getElementById("kptType").value;
  const facture = document.getElementById("kptFacture").value;

  if (!date || !facture) {
    alert("Veuillez remplir les champs");
    return;
  }

  if (window.currentKptEditId) {
    await updateKptData({
      id: window.currentKptEditId,
      date,
      assurance,
      type,
      facture
    });

    window.currentKptEditId = null;
    alert("Modifié ✅");
  } else {
    await saveKpt({
      id,
      date,
      assurance,
      type,
      facture
    });

    alert("Prestation enregistrée");
  }

  loadKpt();
}

async function saveKpt(data) {
  return await apiPost({
    action: "addKpt",
    ...data
  });
}

async function updateKptData(data) {
  return await apiPost({
    action: "updateKptData",
    ...data
  });
}

window.onload = async () => {
  await loadAssura();
  await loadKpt();
  await loadFinanceResume();
};

function renderAssura(data) {
console.log("DATA ASSURA");
console.log(data);
  const container =
    document.getElementById("assuraList");

  const stats =
    document.getElementById("assuraStats");

  container.innerHTML = "";

  data.sort((a, b) => new Date(b.Date) - new Date(a.Date));

  const franchiseAtteinte =
    data.reduce(
      (sum, item) => sum + Number(item.PartFranchise || 0),
      0
    );

  const quotePartAtteinte =
    data.reduce(
      (sum, item) => sum + Number(item.PartQuotePart || 0),
      0
    );

  const totalVotrePart =
    data.reduce(
      (sum, item) => sum + Number(item.VotrePart || 0),
      0
    );

  const totalRembourse =
    data.reduce(
      (sum, item) => sum + Number(item.RemboursementAssura || 0),
      0
    );

  const franchise = 300;
  const quotePartMax = 700;

  const franchisePct =
    Math.min((franchiseAtteinte / franchise) * 100, 100);

  const quotePartPct =
    Math.min((quotePartAtteinte / quotePartMax) * 100, 100);

  stats.innerHTML = `
    <div class="progress-card">
      <div class="progress-header">Franchise</div>
      <div class="progress-bar">
        <div style="width:${franchisePct}%"></div>
      </div>
      <div>${franchiseAtteinte.toFixed(2)} / ${franchise} CHF</div>
    </div>

    <div class="progress-card">
      <div class="progress-header">Quote-part</div>
      <div class="progress-bar">
        <div style="width:${quotePartPct}%"></div>
      </div>
      <div>${quotePartAtteinte.toFixed(2)} / ${quotePartMax} CHF</div>
    </div>

    <div class="progress-card">
      💳 Total à votre charge : ${totalVotrePart.toFixed(2)} CHF
    </div>

    <div class="progress-card">
      🏥 Total remboursé par Assura : ${totalRembourse.toFixed(2)} CHF
    </div>
  `;

  data.forEach(item => {
    container.innerHTML += `
      <div class="card">
        <strong>${item.Prestataire}</strong><br>
        🗓 ${formatDate(item.Date)}<br>
        ${item.Type}<br><br>

        Facture : ${Number(item.MontantFacture || 0).toFixed(2)} CHF<br>
        Franchise : ${Number(item.PartFranchise || 0).toFixed(2)} CHF<br>
        Quote-part : ${Number(item.PartQuotePart || 0).toFixed(2)} CHF<br>
        💳 Votre part : ${Number(item.VotrePart || 0).toFixed(2)} CHF<br>
        ✅ Remboursé par Assura : ${Number(item.RemboursementAssura || 0).toFixed(2)} CHF
      </div>
    `;
  });
}
function formatDate(dateString) {

  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleDateString("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}
async function deleteKpt(id) {

  if (!confirm(
    "Supprimer cette prestation ?"
  )) return;

  await deleteKptFacture(id);

  loadKpt();
}
function renderKpt(data) {

  const container = document.getElementById("kptList");

  container.innerHTML = "";

  // ✅ TRI PAR DATE
  data.sort((a, b) => new Date(b.Date) - new Date(a.Date));

  data.forEach((item, index) => {

    const checked =
      item["Reçu"] === true ||
      item["Reçu"] === "TRUE";

container.innerHTML += `
  <div class="card">

    <strong>${item.Assurance}</strong><br>

    🗓 ${formatDate(item.Date)}<br>

    ${item.Type}<br><br>

    Facture : ${item.Facture} CHF<br>

    💸 Remboursement prévu :
    ${item.Remboursé} CHF<br><br>

    <label class="checkbox-label">

      <input
        type="checkbox"
        ${checked ? "checked" : ""}
        onchange="toggleKptRemboursement(${item._rowNumber}, this.checked)"
      >

      ${checked ? "💰 Reçu" : "🕒 En attente"}

    </label>

    <div class="card-actions">

      <button onclick="editKpt('${item.ID}')">
        ✏️ Modifier
      </button>

      <button onclick="deleteKpt('${item.ID}')">
        🗑️ Supprimer
      </button>

    </div>

  </div>
`;

  });

}
function editKpt(id) {

  alert(
    "Modification de la prestation " + id +
    "\n(à connecter ensuite au formulaire)"
  );

}
async function deleteKpt(id) {

  if (
    !confirm(
      "Supprimer cette prestation ?"
    )
  ) return;

  await deleteKptFacture(id);

  loadKpt();

}
async function toggleKptRemboursement(index, value) {

  await updateKptRemboursement(index, value);

  loadKpt();
  }

/* =========================
FINANCES
========================= */

function computeReservesFromMovements(movements) {

  let reserves = {};

  movements.forEach(m => {

    const poste = m["Poste"] || "";
    const montant = Number(m["Montant"] || 0);

    // On considère qu'une réserve est un poste contenant "réserve"
    if (
 poste.toLowerCase().includes("réserve")) 
    {

      if (!reserves[poste]) {
        reserves[poste] = 0;
      }

      if (m["Sens"] === "Entrée") {
        reserves[poste] += montant;
      } else {
        reserves[poste] -= montant;
      }
    }

  });

  return reserves;
}

function computeBalancesFromMovements(movements) {

  let comptes = {
    Factures: 0,
    Epargne: 0,
    Vacances: 0
  };

  movements.forEach(m => {
    const montant = Number(m["Montant"] || 0);

    if (m["Sens"] === "Entrée") {
      comptes[m["Compte"]] += montant;
    } else {
      comptes[m["Compte"]] -= montant;
    }
  });

  return comptes;
}
function formatCHF(value) {
  const number = Number(value || 0);

  return number.toLocaleString("fr-CH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + " CHF";
}

function parseFrDate(dateStr) {
  if (!dateStr) return new Date(0);

  if (dateStr.includes("-")) {
    return new Date(dateStr);
  }

  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }

  return new Date(dateStr);
}

function getCurrentMonthKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function getMonthKeyFromDate(dateStr) {
  const d = parseFrDate(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function toggleFinanceForm() {
  const form = document.getElementById("financeForm");
  form.style.display =
    form.style.display === "none" ? "block" : "none";
}

async function loadFinanceResume() {
  try {
    const data = await getFinanceDashboard();
    const solde = data.find(row => row["Libellé"] === "Solde Factures");

    document.getElementById("financeResume").innerText =
      solde ? `💰 ${formatCHF(solde["Valeur"])}` : "Aucune donnée";
  } catch (e) {
    document.getElementById("financeResume").innerText = "Erreur";
    console.error(e);
  }
}


function renderFinanceChartFromBalances(comptes) {

  const chart = document.getElementById("financeChart");
  if (!chart) return;

  const factures = comptes["Factures"] || 0;
  const epargne = comptes["Epargne"] || 0;
  const vacances = comptes["Vacances"] || 0;

  const total = factures + epargne + vacances;

  if (total === 0) {
    chart.innerHTML = "Aucune donnée";
    return;
  }

  const pFactures = (factures / total) * 100;
  const pEpargne = (epargne / total) * 100;
  const pVacances = (vacances / total) * 100;

  chart.innerHTML = `
    <div class="pie-chart"></div>

    <div class="pie-legend">
      <div>🔵 Factures : ${formatCHF(factures)}</div>
      <div>🟢 Epargne : ${formatCHF(epargne)}</div>
      <div>🟠 Vacances : ${formatCHF(vacances)}</div>
    </div>
  `;

  const pie = chart.querySelector(".pie-chart");

  pie.style.background = `
    conic-gradient(
      #4da6ff 0% ${pFactures}%,
      #66cc99 ${pFactures}% ${pFactures + pEpargne}%,
      #ff9933 ${pFactures + pEpargne}% 100%
    )
  `;
}


function renderFinanceStats(dashboardRows) {
  const stats = document.getElementById("financeStats");
  const reserves = document.getElementById("financeReserves");
  if (!stats || !reserves) return;

  // ✅ Récupération des valeurs
  const getValue = (labelPart) => {
    const row = dashboardRows.find(r =>
      normalizeLabel(r["Libellé"]).includes(labelPart)
    );
    return Number(row?.["Valeur"] || 0);
  };

  const totalReserves = getValue("total reserves");
  const dispoFactures = getValue("disponible");
  const soldeFactures = getValue("factures");
  const soldeEpargne = getValue("epargne");
  const soldeVacances = getValue("vacances");

  const totalGlobal =
    soldeFactures + soldeEpargne + soldeVacances;

  // ✅ Nouvelle Vue générale (utile)
  stats.innerHTML = `
    <div class="finance-stat-list">

      <div class="finance-stat-item">
        <strong>🔒 Total réserves</strong><br>
        ${formatCHF(totalReserves)}
      </div>

      <div class="finance-stat-item">
        <strong>💸 Disponible réel (Factures)</strong><br>
        ${formatCHF(dispoFactures)}
      </div>

      <div class="finance-stat-item">
        <strong>💰 Total global</strong><br>
        ${formatCHF(totalGlobal)}
      </div>

    </div>
  `;

  // ✅ Partie Réserves (inchangée)
  const reserveRows = dashboardRows.filter(r =>
    normalizeLabel(r["Bloc"]).includes("reserv")
  );

  reserves.innerHTML = `
    <div class="finance-stat-list">
      ${reserveRows.map(v => `
        <div class="finance-stat-item">
          <strong>${v["Libellé"]}</strong><br>
          ${formatCHF(v["Valeur"])}
        </div>
      `).join("")}
    </div>
  `;
}



function renderFinanceHistory(movements) {
  const list = document.getElementById("financeList");
  if (!list) return;

  const currentMonth = getCurrentMonthKey();

  // ✅ Filtrer uniquement le mois en cours
  const filtered = movements.filter(item =>
    getMonthKeyFromDate(item["Date"]) === currentMonth
  );

  // ✅ Trier et limiter (optionnel)
  const sorted = [...filtered]
    .sort((a, b) => parseFrDate(b["Date"]) - parseFrDate(a["Date"]))
    .slice(0, 20);

  list.innerHTML = `
    <div class="finance-history-list">
      ${sorted.length > 0
        ? sorted.map(item => {
            const isEntry = item["Sens"] === "Entrée";
            return `
              <div class="finance-history-item">
                <div class="finance-history-top">
                  <strong>${formatDate(item["Date"])}</strong>
                  <span class="${isEntry ? "finance-positive" : "finance-negative"}">
                    ${isEntry ? "+" : "-"} ${formatCHF(item["Montant"])}
                  </span>
                </div>
                <div><strong>Compte :</strong> ${item["Compte"] || ""}</div>
                <div><strong>Poste :</strong> ${item["Poste"] || "-"}</div>
                <div><strong>Description :</strong> ${item["Description"] || "-"}</div>
              </div>
            `;
          }).join("")
        : `<div class="finance-history-item">Aucun mouvement ce mois</div>`
      }
    </div>
  `;
}


async function loadFinanceScreen() {
  try {
    const dashboard = await getFinanceDashboard();
    const movements = await getFinanceMovements();

    const comptes = computeBalancesFromMovements(movements);
    const reserves = computeReservesFromMovements(movements);

    renderFinanceChartFromBalances(comptes);
    renderFinanceStats(dashboard, reserves);
    renderFinanceHistory(movements);

  } catch (e) {
    console.error(e);
    document.getElementById("financeStats").innerHTML =
      "Erreur chargement finances";
  }
}
function renderFinanceAccounts(dashboardRows) {

  const container = document.getElementById("financeChart"); // on réutilise la zone
  if (!container) return;

  const getValue = (labelPart) => {
    const row = dashboardRows.find(r =>
      normalizeLabel(r["Libellé"]).includes(labelPart)
    );
    return Number(row?.["Valeur"] || 0);
  };

  const factures = getValue("factures");
  const epargne = getValue("epargne");
  const vacances = getValue("vacances");

  container.innerHTML = `
    <div class="finance-stat-list">

      <div class="finance-stat-item">
        <strong>Factures</strong><br>
        ${formatCHF(factures)}
      </div>

      <div class="finance-stat-item">
        <strong>Epargne</strong><br>
        ${formatCHF(epargne)}
      </div>

      <div class="finance-stat-item">
        <strong>Vacances</strong><br>
        ${formatCHF(vacances)}
      </div>

    </div>
  `;
}

async function addFinanceMovementManual() {
  const date = document.getElementById("financeDate").value;
  const compte = document.getElementById("financeCompte").value;
  const sens = document.getElementById("financeSens").value;
  const poste = document.getElementById("financePoste").value;
  const montant = document.getElementById("financeMontant").value;
  const description = document.getElementById("financeDescription").value;

  if (!montant) {
    alert("Montant requis");
    return;
  }

  await addFinanceMovementApi({
    date,
    compte,
    sens,
    poste,
    montant,
    description
  });

  document.getElementById("financeDate").value = "";
  document.getElementById("financePoste").value = "";
  document.getElementById("financeMontant").value = "";
  document.getElementById("financeDescription").value = "";

  toggleFinanceForm();
  await loadFinanceScreen();
  await loadFinanceResume();
}

async function prepareMonthlyTransfers() {
  const container = document.getElementById("financeMonthlyTransfers");
  if (!container) return;

  try {
    const postes = await getFinancePostes();
    const movements = await getFinanceMovements();
    const monthKey = getCurrentMonthKey();

    const activePostes = postes.filter(row =>
      String(row["Budget mensuel"] || "").trim() !== "" &&
      Number(row["Budget mensuel"] || 0) > 0
    );

    const existingThisMonth = movements.filter(m =>
      getMonthKeyFromDate(m["Date"]) === monthKey &&
      m["Compte"] === "Factures" &&
      m["Sens"] === "Entrée"
    );

    const proposals = activePostes.map(poste => {
      const posteName = poste["Poste"];
      const alreadyExists = existingThisMonth.some(m => m["Poste"] === posteName);

      return {
        poste: posteName,
        montant: Number(poste["Budget mensuel"] || 0),
        alreadyExists
      };
    });

    container.innerHTML = `
      <div class="finance-monthly-list">
        ${proposals.map((item, index) => `
          <div class="finance-monthly-item">
            <div class="finance-monthly-top">
              <strong>${item.poste}</strong>
              <span>${item.alreadyExists ? "Déjà ajouté ce mois" : "À prévoir"}</span>
            </div>
            <input
              type="number"
              step="0.01"
              id="monthlyAmount_${index}"
              value="${item.montant}"
              ${item.alreadyExists ? "disabled" : ""}
            />
            <input
              type="hidden"
              id="monthlyPoste_${index}"
              value="${item.poste}"
            />
          </div>
        `).join("")}
      </div>

      <div class="finance-monthly-actions">
        <button onclick="applyMonthlyTransfers(${proposals.length})">
          ✅ Appliquer les virements du mois
        </button>
      </div>
    `;

  } catch (e) {
    console.error("Erreur préparation virements", e);
    container.innerHTML = "Erreur préparation virements";
  }
}

async function applyMonthlyTransfers(count) {
  const today = new Date();
  const date = today.toISOString().slice(0, 10);

  for (let i = 0; i < count; i++) {
    const posteEl = document.getElementById(`monthlyPoste_${i}`);
    const amountEl = document.getElementById(`monthlyAmount_${i}`);

    if (!posteEl || !amountEl || amountEl.disabled) continue;

    const poste = posteEl.value;
    const montant = Number(amountEl.value || 0);

    if (montant <= 0) continue;

    await addFinanceMovementApi({
      date,
      compte: "Factures",
      sens: "Entrée",
      poste,
      montant,
      description: `Provision mensuelle ${poste}`
    });
  }

  await loadFinanceScreen();
  await loadFinanceResume();
  alert("Virements mensuels ajoutés.");
}

window.toggleKptRemboursement = toggleKptRemboursement;
window.showScreen = showScreen;
window.toggleAssuraForm = toggleAssuraForm;
window.toggleKptForm = toggleKptForm;
window.toggleFinanceForm = toggleFinanceForm;

window.addAssuraFacture = addAssuraFacture;
window.addKptFacture = addKptFacture;

/* IMPORTANT :
   si ton HTML appelle onclick="addFinanceMovement()",
   il faut exposer la fonction correcte */
window.addFinanceMovement = addFinanceMovementManual;

window.prepareMonthlyTransfers = prepareMonthlyTransfers;
window.applyMonthlyTransfers = applyMonthlyTransfers;
window.editKpt = editKpt;
window.deleteKpt = deleteKpt;

  
