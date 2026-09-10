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
    Assura OK
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
