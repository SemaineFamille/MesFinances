console.log("APP VERSION 19-06-2026 17h00");

function showScreen(screenId){

  document
    .querySelectorAll(".screen")
    .forEach(screen =>
      screen.classList.remove("active")
    );

  document
    .getElementById(screenId)
    .classList.add("active");
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
  }

  await saveKpt({
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

  const container = document.getElementById("assuraList");
  const stats = document.getElementById("assuraStats");

  container.innerHTML = "";

  // ✅ TRI PAR DATE (du plus récent au plus ancien)
  data.sort((a, b) => new Date(b.Date) - new Date(a.Date));

  const totalPaye =
    data.reduce(
      (sum, item) => sum + Number(item.Montant || 0),
      0
    );

  const franchise = 300;

  const pourcentage =
    Math.min((totalPaye / franchise) * 100, 100);

  stats.innerHTML = `
    <div class="progress-card">
      <div class="progress-header">Franchise</div>

      <div class="progress-bar">
        <div style="width:${pourcentage}%"></div>
      </div>

      <div>
        ${totalPaye.toFixed(2)} / ${franchise} CHF
      </div>
    </div>

    <div class="progress-card">
      💳 Total payé : ${totalPaye.toFixed(2)} CHF
    </div>
  `;

  data.forEach(item => {

    container.innerHTML += `
      <div class="card">

        <strong>${item.Prestataire}</strong><br>

        🗓 ${item.Date}<br>

        ${item.Type}<br>

        💳 Payé : ${item.Montant} CHF

      </div>
    `;

  });

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

        🗓 ${item.Date}<br>

        ${item.Type}<br>

        Facture : ${item.Facture} CHF<br>

        Remboursement prévu :
        ${item.Remboursé} CHF<br><br>

        <label class="checkbox-label">

          <input
            type="checkbox"
            ${checked ? "checked" : ""}
            onchange="toggleKptRemboursement(${index}, this.checked)"
          >

          ${checked ? "💸 Remboursé" : "⏳ En attente"}

        </label>

      </div>
    `;

  });

}
async function toggleKptRemboursement(index, value) {

  await updateKptRemboursement(index, value);

  loadKpt();

}
