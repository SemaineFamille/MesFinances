console.log("APP VERSION 21-06-2026 15h55");

function showScreen(screenId){

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

function toggleFinanceForm() {
  const form = document.getElementById("financeForm");
  form.style.display =
    form.style.display === "none" ? "block" : "none";
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
  const date =
    document.getElementById("kptDate").value;

  const assurance =
    document.getElementById("kptAssurance").value;

  const type =
    document.getElementById("kptType").value;

  const facture =
    document.getElementById("kptFacture").value;

  if (!date || !facture) {

    alert("Veuillez remplir les champs");

    return;
    
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
    date,
    assurance,
    type,
    facture
  });

  alert("Ajouté ✅");

}

  }

async function saveKpt(data) {

  return await apiPost({
    action: "addKpt",
    ...data
  });

}
  async function loadFinanceScreen() {
  const stats = document.getElementById("financeStats");

  try {
    const data = await getFinanceDashboard();

    const vue = data.filter(r => r.Bloc === "Vue générale");
    const reserves = data.filter(r => r.Bloc === "Réserves / Postes");

    stats.innerHTML = `
      <h3>Vue générale</h3>
      <ul>
        ${vue.map(v => `
          <li><b>${v.Libellé}</b>: ${v.Valeur}</li>
        `).join("")}
      </ul>

      <h3>Réserves</h3>
      <ul>
        ${reserves.map(v => `
          <li><b>${v.Libellé}</b>: ${v.Valeur}</li>
        `).join("")}
      </ul>
    `;

  } catch (e) {
    stats.innerHTML = "Erreur chargement";
  }
}
  async function addFinanceMovement() {

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

  await postSheetData("addFinanceMovement", {
    date,
    compte,
    sens,
    poste,
    montant,
    description
  });

  toggleFinanceForm();
  loadFinanceScreen();
  loadFinanceResume();
}
async function loadFinanceResume() {
  try {
    const data = await getFinanceDashboard();

    const solde = data.find(row => row.Libellé === "Solde Factures");

    document.getElementById("financeResume").innerText =
      solde
        ? `💰 ${solde.Valeur} CHF`
        : "Aucune donnée";

  } catch (e) {
    document.getElementById("financeResume").innerText =
      "Erreur";
  }
}
async function updateKptData(data) {

  return await apiPost({
    action: "updateKptData",
    ...data
  });

}

  await saveKpt({
    id,
    date,
    assurance,
    type,
    facture
  });

  alert("Prestation enregistrée");

  loadKpt();
}
window.onload = async () => {

  await loadAssura();

  await loadKpt();

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
window.toggleKptRemboursement = toggleKptRemboursement;
window.showScreen = showScreen;
window.toggleAssuraForm = toggleAssuraForm;
window.toggleKptForm = toggleKptForm;
window.addAssuraFacture = addAssuraFacture;
window.addKptFacture = addKptFacture;
window.editKpt = editKpt;
