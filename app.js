console.log("APP VERSION 27-06-2026 10h25");

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
};

/* =========================
   ASSURA
========================= */

async function addAssuraFacture() {
  const id = Date.now();

  const date = document.getElementById("assuraDate").value;
  const prestataire = document.getElementById("assuraPrestataire").value;
  const type = document.getElementById("assuraType").value;
  const montant = document.getElementById("assuraMontant").value;
  const notes = document.getElementById("assuraNotes").value;

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

function renderAssura(data) {
  const container = document.getElementById("assuraList");
  const stats = document.getElementById("assuraStats");

  container.innerHTML = "";

  data.sort((a, b) => new Date(b.Date) - new Date(a.Date));

  const franchiseAtteinte = data.reduce(
    (sum, item) => sum + Number(item.PartFranchise || 0),
    0
  );

  const quotePartAtteinte = data.reduce(
    (sum, item) => sum + Number(item.PartQuotePart || 0),
    0
  );

  const totalVotrePart = data.reduce(
    (sum, item) => sum + Number(item.VotrePart || 0),
    0
  );

  const totalRembourse = data.reduce(
    (sum, item) => sum + Number(item.RemboursementAssura || 0),
    0
  );

  const franchise = 300;
  const quotePartMax = 700;

  const franchisePct = Math.min((franchiseAtteinte / franchise) * 100, 100);
  const quotePartPct = Math.min((quotePartAtteinte / quotePartMax) * 100, 100);

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
  const stats = document.getElementById("financeStats");
  const reservesEl = document.getElementById("financeReserves");
  if (!stats || !reservesEl) return;

  const getValue = (labelPart) => {
    const row = dashboardRows.find(r =>
      normalizeLabel(r["Libellé"]).includes(labelPart)
    );
    return Number(row?.["Valeur"] || 0);
  };

  const factures = getValue("solde factures");
  const epargne = getValue("solde epargne");
  const vacances = getValue("solde vacances");
  const totalGlobal = factures + epargne + vacances;

  const reserveRows = dashboardRows.filter(r =>
    normalizeLabel(r["Bloc"]).includes("reserv")
  );

  const voiture = Number(
    reserveRows.find(r => normalizeLabel(r["Libellé"]).includes("voiture"))?.["Valeur"] || 0
  );
  const lunettes = Number(
    reserveRows.find(r => normalizeLabel(r["Libellé"]).includes("lunette"))?.["Valeur"] || 0
  );
  const cadeaux = Number(
    reserveRows.find(r => normalizeLabel(r["Libellé"]).includes("cadeau"))?.["Valeur"] || 0
  );
  const impots = Number(
    reserveRows.find(r => normalizeLabel(r["Libellé"]).includes("impot"))?.["Valeur"] || 0
  );

  const totalReserves = voiture + lunettes + cadeaux + impots;
  const disponibleFactures = factures - totalReserves;

  // ✅ Calcul épargne libre / 13ème depuis les mouvements
  // On lit directement la liste affichée dans la page actuelle
  // pour éviter de dépendre du dashboard
  // (si tu préfères, on peut aussi faire cet appel dans loadFinanceScreen)
const epargne13 = window.__lastMovements
  ? window.__lastMovements
      .filter(m =>
        m["Compte"] === "Epargne" &&
        normalizeLabel(m["Poste"]).includes("13eme")
      )
      .reduce((sum, m) => {
        const montant = Number(m["Montant"] || 0);
        return sum + (m["Sens"] === "Entrée" ? montant : -montant);
      }, 0)
  : 0;

// ✅ L'épargne libre = total épargne - 13ème
const epargneLibre = epargne - epargne13;

  const safePercent = (value, total) => {
    if (!total || total <= 0) return 0;
    return Math.max(0, Math.min(100, (value / total) * 100));
  };

  const pctVoiture = safePercent(voiture, totalReserves);
  const pctLunettes = safePercent(lunettes, totalReserves);
  const pctCadeaux = safePercent(cadeaux, totalReserves);
  const pctImpots = safePercent(impots, totalReserves);

  const pctDisponible = safePercent(disponibleFactures, factures);
  const pctReserveDansFactures = safePercent(totalReserves, factures);

  const pctFactures = safePercent(factures, totalGlobal);
  const pctEpargne = safePercent(epargne, totalGlobal);
  const pctVacances = safePercent(vacances, totalGlobal);

  const pctEpargneLibre = safePercent(epargneLibre, epargne);
  const pctEpargne13 = safePercent(epargne13, epargne);

  stats.innerHTML = `
    <div class="finance-stat-list">

      <div class="finance-stat-item">
        <strong>🔒 Total réserves</strong><br>
        ${formatCHF(totalReserves)}

        <div class="stacked-bar">
          <div class="seg seg-voiture" style="width:${pctVoiture}%"></div>
          <div class="seg seg-lunettes" style="width:${pctLunettes}%"></div>
          <div class="seg seg-cadeaux" style="width:${pctCadeaux}%"></div>
          <div class="seg seg-impots" style="width:${pctImpots}%"></div>
        </div>

        <div class="stacked-legend">
          <span><span class="dot seg-voiture"></span> Voiture ${formatCHF(voiture)}</span>
          <span><span class="dot seg-lunettes"></span> Lunettes ${formatCHF(lunettes)}</span>
          <span><span class="dot seg-cadeaux"></span> Cadeaux ${formatCHF(cadeaux)}</span>
          <span><span class="dot seg-impots"></span> Impôts ${formatCHF(impots)}</span>
        </div>
      </div>

      <div class="finance-stat-item">
        <strong>💸 Disponible réel (Factures)</strong><br>
        ${formatCHF(disponibleFactures)}

        <div class="stacked-bar">
          <div class="seg seg-disponible" style="width:${pctDisponible}%"></div>
          <div class="seg seg-reserve-total" style="width:${pctReserveDansFactures}%"></div>
        </div>

        <div class="stacked-legend">
          <span><span class="dot seg-disponible"></span> Disponible ${formatCHF(disponibleFactures)}</span>
          <span><span class="dot seg-reserve-total"></span> Réservé ${formatCHF(totalReserves)}</span>
          <span><strong>Total compte Factures : ${formatCHF(factures)}</strong></span>
        </div>
      </div>

      <div class="finance-stat-item">
        <strong>🏦 Épargne</strong><br>
        ${formatCHF(epargne)}

        <div class="stacked-bar">
          <div class="seg seg-epargne-libre" style="width:${pctEpargneLibre}%"></div>
          <div class="seg seg-13eme" style="width:${pctEpargne13}%"></div>
        </div>

        <div class="stacked-legend">
          <span><span class="dot seg-epargne-libre"></span> Épargne libre ${formatCHF(epargneLibre)}</span>
          <span><span class="dot seg-13eme"></span> 13ème salaire ${formatCHF(epargne13)}</span>
        </div>
      </div>

      <div class="finance-stat-item">
        <strong>💰 Total global</strong><br>
        ${formatCHF(totalGlobal)}

        <div class="stacked-bar">
          <div class="seg seg-factures" style="width:${pctFactures}%"></div>
          <div class="seg seg-epargne" style="width:${pctEpargne}%"></div>
          <div class="seg seg-vacances" style="width:${pctVacances}%"></div>
        </div>

        <div class="stacked-legend">
          <span><span class="dot seg-factures"></span> Factures ${formatCHF(factures)}</span>
          <span><span class="dot seg-epargne"></span> Épargne ${formatCHF(epargne)}</span>
          <span><span class="dot seg-vacances"></span> Vacances ${formatCHF(vacances)}</span>
        </div>
      </div>

    </div>
  `;

  reservesEl.innerHTML = `
    <div class="finance-stat-list">
      ${reserveRows.length > 0
        ? reserveRows.map(v => `
          <div class="finance-stat-item">
            <strong>${v["Libellé"]}</strong><br>
            ${formatCHF(v["Valeur"])}
          </div>
        `).join("")
        : `<div class="finance-stat-item">Aucune réserve détectée</div>`
      }
    </div>
  `;
}

function renderFinanceHistory(movements) {
  const list = document.getElementById("financeList");
  if (!list) return;

  const currentMonth = getCurrentMonthKey();

  const filtered = movements.filter(item =>
    getMonthKeyFromDate(item["Date"]) === currentMonth
  );

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
    const defaultEpargne13 = 500; // adapte cette valeur à ton besoin réel

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
        compte: "Factures",
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

function renderEpargneLineChart(data) {
  const container = document.getElementById("epargneChart");
  if (!container) return;

  const comptes = prepareLineData(data);

  let max = 0;

  Object.values(comptes).forEach(list => {
    list.forEach(p => {
      if (p.solde > max) max = p.solde;
    });
  });

  if (max === 0) {
    container.innerHTML = `<div class="finance-stat-item">Aucune donnée</div>`;
    return;
  }

  const width = 100;
  const height = 180;

  let svg = `<svg viewBox="0 0 ${width} ${height}" width="100%" height="180">`;

  const colors = ["#4f46e5", "#16a34a"];
  let colorIndex = 0;

  let labelsHTML = "";

  Object.keys(comptes).forEach(compte => {

    const list = comptes[compte];
    if (list.length === 0) return;

    const stepX = width / (list.length - 1 || 1);

    let path = "";
    let gainsRow = `<div class="epargne-gains-row"><strong>${compte}</strong><br>`;

    list.forEach((point, index) => {

      const x = index * stepX;
      const y = height - (point.solde / max) * (height - 20);

      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }

      // ✅ calcul gain
      let gain = 0;
      if (index > 0) {
        gain = point.solde - list[index - 1].solde;
      }

      const gainColor = gain >= 0 ? "green" : "red";
      const sign = gain > 0 ? "+" : "";

      gainsRow += `
        <span class="gain" style="color:${gainColor}">
          ${index === 0 ? "-" : sign + gain.toFixed(0)}
        </span>
      `;
    });

    gainsRow += `</div>`;
    labelsHTML += gainsRow;

    const color = colors[colorIndex % colors.length];
    colorIndex++;

    // ✅ ligne
    svg += `<path d="${path}" stroke="${color}" fill="none" stroke-width="2" />`;

    // ✅ points
    list.forEach((point, index) => {
      const x = index * stepX;
      const y = height - (point.solde / max) * (height - 20);

      svg += `<circle cx="${x}" cy="${y}" r="3" fill="${color}" />`;
    });

  });

  svg += `</svg>`;

  container.innerHTML = `
    ${svg}
    <div class="epargne-gains">
      ${labelsHTML}
    </div>
  `;
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
    console.error(e);
    document.getElementById("financeStats").innerHTML =
      "Erreur chargement finances";
  }
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
