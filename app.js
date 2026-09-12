console.log("APP VERSION 12-09-2026 17h17");

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

    const virements =
  await getMonthlyTransfers();

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
window.toggleReservesCard = toggleReservesCard;
window.toggleDisponibleCard = toggleDisponibleCard;
window.addEventListener("click", function(event) {

  const modal = document.getElementById("financeModal");

  if (event.target === modal) {
    closeFinanceModal();
  }

});

