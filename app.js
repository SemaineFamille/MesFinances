console.log("APP VERSION 11-09-2026 17h15");

/* =========================
   OUTILS GENERAUX
========================= */

function normalizeLabel(label) {
  return (label || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
function openFinanceModal(title, content) {

  document.getElementById("financeModalTitle").innerHTML = title;

  document.getElementById("financeModalBody").innerHTML = content;

  document.getElementById("financeModal").style.display = "flex";
}

function closeFinanceModal() {
  document.getElementById("financeModal").style.display = "none";
}

window.closeFinanceModal = closeFinanceModal;
function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleDateString("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
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

/* =========================
   NAVIGATION / UI
========================= */

function showScreen(screenId) {
  document
    .querySelectorAll(".screen")
    .forEach(screen => screen.classList.remove("active"));

  document
    .getElementById(screenId)
    .classList.add("active");

  if (screenId === "financeScreen") {
    loadFinanceScreen();
  }
}

function toggleAssuraForm() {
  const form = document.getElementById("assuraForm");
  form.style.display = form.style.display === "none" ? "block" : "none";
}

function toggleKptForm() {
  const form = document.getElementById("kptForm");
  form.style.display = form.style.display === "none" ? "block" : "none";
}

function toggleFinanceForm() {
  const form = document.getElementById("financeForm");
  form.style.display = form.style.display === "none" ? "block" : "none";
}
function toggleEpargneForm() {
  const form = document.getElementById("epargneForm");

  form.style.display =
    form.style.display === "none" ? "block" : "none";
}
function toggleHistory() {
  const container = document.getElementById("financeHistoryContainer");
  const arrow = document.getElementById("historyArrow");

  if (!container || !arrow) return;

  const isVisible = container.style.display === "block";

  container.style.display = isVisible ? "none" : "block";
  arrow.style.transform = isVisible ? "rotate(0deg)" : "rotate(180deg)";
}

function handleFinanceCompteChange() {
  const compte = document.getElementById("financeCompte").value;
  const subContainer = document.getElementById("financeSubCategoryContainer");
  const posteField = document.getElementById("financePoste");

  if (!subContainer || !posteField) return;

  const isFactures = compte === "Factures";

  subContainer.style.display = isFactures ? "block" : "none";
  posteField.disabled = isFactures;
  if (isFactures) {
    posteField.value = "";
  }
}

/* =========================
   DEMARRAGE
========================= */

window.onload = async () => {
  await loadAssura();
  await loadKpt();
  await loadFinanceResume();
  handleFinanceCompteChange();
   // ✅ Restaurer les valeurs sauvegardées
const savedSalaire = localStorage.getItem("calcSalaire");
const savedDepenses = localStorage.getItem("calcDepenses");

if (savedSalaire !== null) {
  document.getElementById("calcSalaire").value = savedSalaire;
}

if (savedDepenses !== null) {
  document.getElementById("calcDepenses").value = savedDepenses;
}

// ✅ recalcul automatique
updateMonthlyCalc();
};



/* =========================
   KPT
========================= */

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

async function updateKptData(data) {
  return await apiPost({
    action: "updateKptData",
    ...data
  });
}

function renderKpt(data) {
  const container = document.getElementById("kptList");
  container.innerHTML = "";

  data.sort((a, b) => new Date(b.Date) - new Date(a.Date));

  data.forEach(item => {
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
  if (!confirm("Supprimer cette prestation ?")) return;

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
function updateMonthlyCalc() {

  const salaire = Number(document.getElementById("calcSalaire")?.value || 0);
  const depenses = Number(document.getElementById("calcDepenses")?.value || 0);

  // ✅ Sauvegarde locale
  localStorage.setItem("calcSalaire", salaire);
  localStorage.setItem("calcDepenses", depenses);

  const reste = salaire - depenses;

  const container = document.getElementById("calcResult");

  let color = "black";
  if (reste > 0) color = "green";
  if (reste < 0) color = "red";

  container.innerHTML = `
    Résultat : 
    <span style="color:${color}; font-weight:bold;">
      ${formatCHF(reste)}
    </span>
  `;
}

function formatCHF(value) {
  const number = Number(value || 0);
  return number.toLocaleString("fr-CH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + " CHF";
}
function computeEpargneSplit(movements) {

  let libre = 0;
  let treize = 0;

  movements.forEach(m => {

    if (m["Compte"] !== "Epargne") return;

    const montant = Number(m["Montant"] || 0);

    if (m["Poste"] === "13eme salaire") {
      treize += (m["Sens"] === "Entrée" ? montant : -montant);
    } else if (m["Poste"] === "Epargne libre") {
      libre += (m["Sens"] === "Entrée" ? montant : -montant);
    }
  });

  return { libre, treize };
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

    const solde = data.find(row =>
      normalizeLabel(row["Libellé"]).includes("solde factures")
    );

    document.getElementById("financeResume").innerText =
      solde ? `💰 ${formatCHF(solde["Valeur"])}` : "Aucune donnée";
  } catch (e) {
    document.getElementById("financeResume").innerText = "Erreur";
    console.error(e);
  }
}
async function toggleDisponibleCard() {

  try {

    const postes = await getFinancePostes();

    const postesFactures =
      postes.filter(p =>
        (p["Compte"] || "")
          .toLowerCase()
          .includes("facture")
      );

    openFinanceModal(
      "💸 Détail des postes",

      `
      <div class="postes-table">

        <div class="postes-row postes-header">
          <div>Poste</div>
          <div>Budget annuel</div>
          <div>Montant mensuel</div>
        </div>

        ${postesFactures.map(p => `

          <div class="postes-row">

            <div>${p["Poste"] || ""}</div>

            <div>
              ${formatCHF(
                p["Budget annuel"] || 0
              )}
            </div>

            <div>
              ${formatCHF(
                p["Montant mensuel"] || 0
              )}
            </div>

          </div>

        `).join("")}

      </div>
      `
    );

  } catch (e) {

    console.error(
      "Erreur chargement postes",
      e
    );

    openFinanceModal(
      "Erreur",
      "<div>Impossible de charger les postes.</div>"
    );

  }

}
function renderFinancePieChart(dashboardRows) {
  const chart = document.getElementById("financeChart");
  if (!chart) return;

  const getValue = (labelPart) => {
    const row = dashboardRows.find(r =>
      normalizeLabel(r["Libellé"]).includes(labelPart)
    );
    return Number(row?.["Valeur"] || 0);
  };

  const factures = getValue("factures");
  const epargne = getValue("epargne");
  const vacances = getValue("vacances");
  const total = factures + epargne + vacances;

  if (total <= 0) {
    chart.innerHTML = `<div class="finance-stat-item">Aucune donnée</div>`;
    return;
  }

  const pFactures = (factures / total) * 100;
  const pEpargne = (epargne / total) * 100;
  const pVacances = (vacances / total) * 100;

  chart.innerHTML = `
    <div class="pie-chart-wrap">
      <div class="pie-chart"></div>
      <div class="pie-legend">
        <div><span class="dot seg-factures"></span> Factures : ${formatCHF(factures)}</div>
        <div><span class="dot seg-epargne"></span> Épargne : ${formatCHF(epargne)}</div>
        <div><span class="dot seg-vacances"></span> Vacances : ${formatCHF(vacances)}</div>
      </div>
    </div>
  `;

  const pie = chart.querySelector(".pie-chart");
  pie.style.background = `
    conic-gradient(
      #4f46e5 0% ${pFactures}%,
      #16a34a ${pFactures}% ${pFactures + pEpargne}%,
      #f59e0b ${pFactures + pEpargne}% 100%
    )
  `;
}

function renderFinanceStats(dashboardRows) {

  const stats =
    document.getElementById("financeStats");

  if (!stats) return;

  const getValue = (labelPart) => {
    const row = dashboardRows.find(r =>
      normalizeLabel(r["Libellé"])
        .includes(labelPart)
    );

    return Number(
      row?.["Valeur"] || 0
    );
  };

  const factures =
    getValue("solde factures");

  const epargne =
    getValue("solde epargne");

  const vacances =
    getValue("solde vacances");

  const totalGlobal =
    factures +
    epargne +
    vacances;
const epargne13 = window.__lastMovements
  ? window.__lastMovements
      .filter(m =>
        m["Compte"] === "Epargne" &&
        normalizeLabel(m["Poste"]).includes("13eme")
      )
      .reduce((sum, m) => {
        const montant = Number(m["Montant"] || 0);

        return sum +
          (m["Sens"] === "Entrée"
            ? montant
            : -montant);
      }, 0)
  : 0;

const epargneLibre =
  epargne - epargne13;

const pctEpargneLibre =
  epargne > 0
    ? (epargneLibre / epargne) * 100
    : 0;

const pctEpargne13 =
  epargne > 0
    ? (epargne13 / epargne) * 100
    : 0;
 
   const mouvementsVacances =
  window.__lastMovements
    ? window.__lastMovements.filter(
        m => m["Compte"] === "Vacances"
      )
    : [];

let totalReserves = 0;
let totalVacances = 0;

mouvementsVacances.forEach(m => {

  const montant =
    Number(m["Montant"] || 0);

  const valeur =
    m["Sens"] === "Entrée"
      ? montant
      : -montant;

  const poste =
    normalizeLabel(m["Poste"]);

  if (
    poste.includes("voiture") ||
    poste.includes("lunette") ||
    poste.includes("cadeau") ||
    poste.includes("impot") ||
    poste.includes("tatto")
  ) {
    totalReserves += valeur;
  } else {
    totalVacances += valeur;
  }

});

const totalVacancesGlobal =
  totalVacances + totalReserves;

const pctVacances =
  totalVacancesGlobal > 0
    ? (totalVacances / totalVacancesGlobal) * 100
    : 0;

const pctReserves =
  totalVacancesGlobal > 0
    ? (totalReserves / totalVacancesGlobal) * 100
    : 0;
   
   stats.innerHTML = `

    <div class="finance-stat-list">

      <div
        class="finance-stat-item clickable-card"
        onclick="toggleDisponibleCard()">

        <strong>💳 Factures</strong><br>
        ${formatCHF(factures)}

        <div class="small-hint">
          👆 Voir le détail
        </div>

      </div>

     <div class="finance-stat-item">

  <strong>🏦 Épargne</strong><br>
  ${formatCHF(epargne)}

  <div class="stacked-bar">

    <div
      class="seg seg-epargne-libre"
      style="width:${pctEpargneLibre}%">
    </div>

    <div
      class="seg seg-13eme"
      style="width:${pctEpargne13}%">
    </div>

  </div>

  <div class="stacked-legend">

    <span>
      <span class="dot seg-epargne-libre"></span>
      Épargne libre ${formatCHF(epargneLibre)}
    </span>

    <span>
      <span class="dot seg-13eme"></span>
      13ème salaire ${formatCHF(epargne13)}
    </span>

  </div>

</div>

    <div
  class="finance-stat-item clickable-card"
  onclick="toggleReservesCard()">

  <strong>🏖️ Vacances & Réserves</strong><br>

  ${formatCHF(totalVacancesGlobal)}

  <div class="stacked-bar">

    <div
      class="seg seg-vacances"
      style="width:${pctVacances}%">
    </div>

    <div
      class="seg seg-impots"
      style="width:${pctReserves}%">
    </div>

  </div>

  <div class="stacked-legend">

    <span>
      <span class="dot seg-vacances"></span>
      Vacances ${formatCHF(totalVacances)}
    </span>

    <span>
      <span class="dot seg-impots"></span>
      Réserves ${formatCHF(totalReserves)}
    </span>

  </div>

  <div class="small-hint">
    👆 Voir le détail
  </div>

</div>

    </div>

  `;
}

async function toggleReservesPreview() {
  let container = document.getElementById("reservesPreview");

  if (!container) {
    container = document.createElement("div");
    container.id = "reservesPreview";
    container.className = "finance-block postes-preview";

    const statsBlock = document.getElementById("financeStats");
    statsBlock.parentNode.insertBefore(container, statsBlock.nextSibling);
  }

  const isVisible = container.style.display === "block";

  if (isVisible) {
    container.style.display = "none";
    return;
  }

  try {
    const postes = await getFinancePostes();

    // ✅ maintenant on affiche TOUT
    const allPostes = postes;

    container.innerHTML = `
      <h3>📋 Tous les postes</h3>

      <div class="postes-table">
        <div class="postes-row postes-header">
          <div>Poste</div>
          <div>Budget annuel</div>
          <div>Montant mensuel</div>
        </div>

        ${allPostes.map(p => `
          <div class="postes-row">
            <div>${p["Poste"] || ""}</div>
            <div>${formatCHF(p["Budget annuel"] || 0)}</div>
            <div>${formatCHF(p["Montant mensuel"] || 0)}</div>
          </div>
        `).join("")}
      </div>
    `;

    container.style.display = "block";

  } catch (e) {
    console.error("Erreur chargement postes", e);
    container.innerHTML = `
      <div class="finance-stat-item">
        Erreur chargement postes
      </div>
    `;
    container.style.display = "block";
  }
}
async function toggleReservesCard() {

  try {

    const postes = await getFinancePostes();

    const postesVacances =
      postes.filter(p =>
        (p["Compte"] || "")
          .toLowerCase()
          .includes("vacances")
      );

    const movements =
      await getFinanceMovements();

    let voiture = 0;
    let lunettes = 0;
    let cadeaux = 0;
    let impots = 0;
    let vacances = 0;

    movements
      .filter(m => m["Compte"] === "Vacances")
      .forEach(m => {

        const montant =
          Number(m["Montant"] || 0);

        const valeur =
          m["Sens"] === "Entrée"
            ? montant
            : -montant;

        const poste =
          normalizeLabel(m["Poste"]);

        if (poste.includes("voiture")) {
          voiture += valeur;
        }
        else if (poste.includes("lunette")) {
          lunettes += valeur;
        }
        else if (poste.includes("cadeau")) {
          cadeaux += valeur;
        }
        else if (poste.includes("impot")) {
          impots += valeur;
        }
        else {
          vacances += valeur;
        }

      });

    const totalReserves =
      voiture +
      lunettes +
      cadeaux +
      impots;

    const soldeCompte =
      totalReserves +
      vacances;

    openFinanceModal(
      "🏖️ Vacances & Réserves",

      `
      <div style="margin-bottom:15px;">
        <strong>
          💰 Solde du compte Vacances :
          ${formatCHF(soldeCompte)}
        </strong>
      </div>

      <div class="postes-table">

        <div class="postes-row postes-header">
          <div>Poste</div>
          <div>Budget annuel</div>
          <div>Montant mensuel</div>
          <div>Solde actuel</div>
        </div>

        ${postesVacances.map(p => {

          let solde = 0;

          if ((p["Poste"] || "").includes("Voiture")) {
            solde = voiture;
          }
          else if ((p["Poste"] || "").includes("Lunettes")) {
            solde = lunettes;
          }
          else if ((p["Poste"] || "").includes("Cadeaux")) {
            solde = cadeaux;
          }
          else if ((p["Poste"] || "").includes("Impôts")) {
            solde = impots;
          }

          return `
            <div class="postes-row">

              <div>${p["Poste"] || ""}</div>

              <div>
                ${formatCHF(p["Budget annuel"] || 0)}
              </div>

              <div>
                ${formatCHF(p["Montant mensuel"] || 0)}
              </div>

              <div>
                ${formatCHF(solde)}
              </div>

            </div>
          `;

        }).join("")}

      </div>

      <div style="margin-top:20px;">

        <strong>
          🔒 Total réserves :
          ${formatCHF(totalReserves)}
        </strong>

        <br><br>

        <strong>
          ⛱️ Vacances disponibles :
          ${formatCHF(vacances)}
        </strong>

      </div>
      `
    );

  } catch (e) {

    console.error(e);

    openFinanceModal(
      "Erreur",
      "Impossible de charger les réserves."
    );

  }

}
async function addFinanceMovementManual() {
  const date = document.getElementById("financeDate").value;
  const compte = document.getElementById("financeCompte").value;
  const sens = document.getElementById("financeSens").value;

  let poste = document.getElementById("financePoste").value;
  const sub = document.getElementById("financeSubCategory").value;

  if (compte === "Factures" && sub) {
    poste = sub;
  }

  const montant = document.getElementById("financeMontant").value;
  const description = document.getElementById("financeDescription").value;

  if (!montant) {
    alert("Montant requis");
    return;
  }

  // ✅ UN SEUL mouvement manuel
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

  const subField = document.getElementById("financeSubCategory");
  if (subField) subField.value = "";

  toggleFinanceForm();
  await loadFinanceScreen();
  await loadFinanceResume();
}

async function addEpargne3Entry() {

  const compte = document.getElementById("epargneCompte").value;
  const date = document.getElementById("epargneDate").value;
  const solde = document.getElementById("epargneSolde").value;

  if (!date || !solde) {
    alert("Remplis les champs");
    return;
  }

  await addEpargne3({
    compte,
    date,
    solde
  });

  alert("Solde enregistré ✅");

  toggleEpargneForm();

  await loadFinanceScreen(); // recharge tout (courbe + résumé)
}
function renderEpargneSummary(data) {

  const container = document.getElementById("epargneSummary");
  if (!container) return;

  const comptes = prepareLineData(data);

  let html = "";

  Object.keys(comptes).forEach(compte => {

    const list = comptes[compte];
    if (list.length === 0) return;

    const last = list[list.length - 1];

    html += `
      <div class="finance-stat-item">
        <strong>${compte}</strong><br>
        ${formatCHF(last.solde)}
      </div>
    `;
  });

  container.innerHTML = `
    <div class="finance-stat-list">
      ${html}
    </div>
  `;
}

async function prepareMonthlyTransfers() {
  const container = document.getElementById("financeMonthlyTransfers");
  if (!container) return;

  try {
    const postes = await getFinancePostes();

    const totalAnnuel = postes.reduce(
      (sum, p) => sum + Number(p["Budget annuel"] || 0),
      0
    );

    const totalMensuel = totalAnnuel / 12;

    const defaultFactures = 815;
    const defaultEpargne = 500;
    const defaultVacances = 80;
    const defaultEpargne13 = 400; // adapte cette valeur à ton besoin réel

    container.innerHTML = `
      <div class="finance-monthly-simple">

        <div class="monthly-line">
          <label>💳 Factures</label>
          <input type="number" id="monthlyFactures" value="${defaultFactures}">
        </div>
        <small>Recommandé : ${Math.round(totalMensuel)} CHF</small>

        <div class="monthly-line">
          <label>🏦 Epargne</label>
          <input type="number" id="monthlyEpargne" value="${defaultEpargne}">
        </div>

        <div class="monthly-line">
          <label>🎁 13ème salaire</label>
          <input type="number" id="monthlyEpargne13" value="${defaultEpargne13}">
        </div>

        <div class="monthly-line">
          <label>⛱️ Vacances</label>
          <input type="number" id="monthlyVacances" value="${defaultVacances}">
        </div>

        <button onclick="applyMonthlyTransfersSimple()">
          ✅ Appliquer les virements
        </button>

      </div>
    `;

  } catch (e) {
    console.error("Erreur préparation virements", e);
    container.innerHTML = "Erreur préparation virements";
  }
}

async function applyMonthlyTransfersSimple() {
  const date = new Date().toISOString().slice(0, 10);

  const factures = Number(document.getElementById("monthlyFactures").value || 0);
  const epargne = Number(document.getElementById("monthlyEpargne").value || 0);
  const epargne13 = Number(document.getElementById("monthlyEpargne13").value || 0);
  const vacances = Number(document.getElementById("monthlyVacances").value || 0);

  // =========================
  // FACTURES = 1/12 exact de chaque poste
  // + surplus éventuel
  // =========================
  if (factures > 0) {
    const postes = await getFinancePostes();

  const monthlyItems = postes.map(p => ({
  poste: p["Poste"],
  compte: p["Compte"] || "Factures",
  mensuel: Number(p["Budget annuel"] || 0) / 12
})).filter(item => item.mensuel > 0);


    const totalMensuelTheorique = monthlyItems.reduce((sum, item) => sum + item.mensuel, 0);

    if (factures < totalMensuelTheorique) {
      alert(
        `Le montant Factures (${formatCHF(factures)}) est inférieur au besoin mensuel théorique (${formatCHF(totalMensuelTheorique)}).`
      );
      return;
    }

    // 1/12 exact pour chaque poste
    for (const item of monthlyItems) {
     await addFinanceMovementApi({
  date,
  compte: item.compte,
  sens: "Entrée",
  poste: item.poste,
  montant: item.mensuel.toFixed(2),
  description: "Provision mensuelle"
});
    }

    // surplus éventuel
    const surplus = factures - totalMensuelTheorique;

    if (surplus > 0) {
      await addFinanceMovementApi({
        date,
        compte: "Factures",
        sens: "Entrée",
        poste: "Disponible facture",
        montant: surplus.toFixed(2),
        description: "Surplus mensuel"
      });
    }
  }

  // =========================
  // EPARGNE LIBRE
  // =========================
  if (epargne > 0) {
    await addFinanceMovementApi({
      date,
      compte: "Epargne",
      sens: "Entrée",
      poste: "Epargne libre",
      montant: epargne,
      description: "Epargne mensuelle"
    });
  }

  // =========================
  // 13ÈME SALAIRE
  // =========================
  if (epargne13 > 0) {
    await addFinanceMovementApi({
      date,
      compte: "Epargne",
      sens: "Entrée",
      poste: "13eme salaire",
      montant: epargne13,
      description: "Provision 13ème"
    });
  }

  // =========================
  // VACANCES
  // =========================
  if (vacances > 0) {
    await addFinanceMovementApi({
      date,
      compte: "Vacances",
      sens: "Entrée",
      poste: "Versement mensuel",
      montant: vacances,
      description: "Versement mensuel"
    });
  }

  await loadFinanceScreen();
  await loadFinanceResume();

  alert("✅ Virements appliqués");
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

/* =========================
   EPARGNE 3 - COURBE
========================= */

function prepareLineData(data) {
   const oneYearAgo = new Date();
oneYearAgo.setMonth(oneYearAgo.getMonth() - 12);

data = data.filter(row =>
  new Date(row.Date) >= oneYearAgo
);
  let byCompte = {};

  data.forEach(row => {
    if (!byCompte[row.Compte]) {
      byCompte[row.Compte] = [];
    }

    byCompte[row.Compte].push({
      date: new Date(row.Date),
      solde: Number(row.Solde || 0)
    });
  });

  Object.values(byCompte).forEach(list => {
    list.sort((a, b) => a.date - b.date);

    for (let i = 1; i < list.length; i++) {
      list[i].interet = list[i].solde - list[i - 1].solde;
    }
  });

  return byCompte;
}

function renderEpargneLineChart(data){

  const comptes = {};

  data.forEach(row => {

    if(!comptes[row.Compte]){
      comptes[row.Compte] = [];
    }

    comptes[row.Compte].push({
      date: new Date(row.Date),
      solde: Number(row.Solde || 0)
    });

  });

  Object.values(comptes)
    .forEach(list =>
      list.sort((a,b)=>a.date-b.date)
    );

  const labels =
    comptes[
      Object.keys(comptes)[0]
    ]?.map(v =>
      v.date.toLocaleDateString("fr-CH")
    ) || [];

  const ctx =
    document.getElementById(
      "epargneChart"
    );

  if(!ctx) return;

  if(window.epargneGraph){
    window.epargneGraph.destroy();
  }

  const couleurs = [
    "#2563eb",
    "#16a34a"
  ];

  window.epargneGraph =
    new Chart(ctx,{

      type:"line",

      data:{

        labels,

        datasets:
          Object.keys(comptes)
          .map((compte,index)=>({

            label: compte,

            data:
              comptes[compte]
              .map(v=>v.solde),

            borderColor:
              couleurs[index],

            backgroundColor:
              couleurs[index] + "20",

            fill:false,

            tension:0.3,

            pointRadius:4

          }))

      },

      options:{
        responsive:true,
        maintainAspectRatio:false
      }

    });

}
/* =========================
   CHARGEMENT FINANCES
========================= */

async function loadFinanceScreen() {
  try {
    const dashboard = await getFinanceDashboard();
    const movements = await getFinanceMovements();

    // ✅ on garde les mouvements en mémoire pour les graphiques/barres
    window.__lastMovements = movements;

    renderFinancePieChart(dashboard);
 renderFinanceStats(dashboard);
renderFinanceHistory(movements);


    try {
      const epargneChart = document.getElementById("epargneChart");
      if (epargneChart && typeof getEpargne3 === "function") {
        const epargne3 = await getEpargne3();
        renderEpargneSummary(epargne3);
        renderEpargneLineChart(epargne3);
      }
    } catch (epargneErr) {
      console.error("Erreur chargement Epargne 3", epargneErr);
    }

 } catch (e) {
  console.error("LOAD FINANCE ERROR", e);

  document.getElementById("financeStats").innerHTML =
    "Erreur : " + e.message;
}
`
}

/* =========================
   EXPOSITION AU HTML
========================= */

window.showScreen = showScreen;

window.toggleAssuraForm = toggleAssuraForm;
window.toggleKptForm = toggleKptForm;
window.toggleFinanceForm = toggleFinanceForm;
window.toggleHistory = toggleHistory;
window.handleFinanceCompteChange = handleFinanceCompteChange;

window.addAssuraFacture = addAssuraFacture;
window.addKptFacture = addKptFacture;
window.addFinanceMovement = addFinanceMovementManual;

window.prepareMonthlyTransfers = prepareMonthlyTransfers;
window.applyMonthlyTransfers = applyMonthlyTransfers;

window.toggleKptRemboursement = toggleKptRemboursement;
window.editKpt = editKpt;
window.deleteKpt = deleteKpt;
window.applyMonthlyTransfersSimple = applyMonthlyTransfersSimple;
window.toggleReservesPreview = toggleReservesPreview;
window.toggleReservesCard = toggleReservesCard;
window.toggleDisponibleCard = toggleDisponibleCard;
window.addEventListener("click", function(event) {

  const modal = document.getElementById("financeModal");

  if (event.target === modal) {
    closeFinanceModal();
  }

});

