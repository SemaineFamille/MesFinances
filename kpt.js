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
window.addKptFacture = addKptFacture;
window.toggleKptRemboursement = toggleKptRemboursement;
window.editKpt = editKpt;
window.deleteKpt = deleteKpt;
