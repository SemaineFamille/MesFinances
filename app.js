console.log("APP VERSION 19-06-2026 13h40");

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

  const container =
    document.getElementById("assuraList");

  container.innerHTML = "";

  data.forEach(item => {

    container.innerHTML += `
      <div class="card">
        <strong>${item.Prestataire}</strong><br>
        ${item.Type}<br>
        ${item.Montant} CHF
      </div>
    `;

  });

}
function renderKpt(data) {

  const container =
    document.getElementById("kptList");

  container.innerHTML = "";

  data.forEach(item => {

    container.innerHTML += `
      <div class="card">
        <strong>${item.Assurance}</strong><br>
        ${item.Type}<br>
        ${item.Facture} CHF
      </div>
    `;

  });

}
