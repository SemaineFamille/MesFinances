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

  const soldeVacances =
  getValue("solde vacances");


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
 
const getDashboardValue = (label) => {

  const row = dashboardRows.find(r =>
    normalizeLabel(r["Libellé"])
      .includes(normalizeLabel(label))
  );

  const valeur = String(
    row?.["Valeur"] || "0"
  )
    .replace("Fr. ", "")
    .replace(/'/g, "");

  return Number(valeur);
};

const totalReserves =
  getDashboardValue("total réserves");

const totalVacancesGlobal =
  getValue("solde vacances");

const vacancesDisponibles =
  totalVacancesGlobal;

const soldeCompte =
  totalVacancesGlobal + totalReserves;

const pctVacances =
  soldeCompte > 0
    ? (totalVacancesGlobal / soldeCompte) * 100
    : 0;

const pctReserves =
  soldeCompte > 0
    ? (totalReserves / soldeCompte) * 100
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

${formatCHF(soldeCompte)}

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
     Vacances disponibles ${formatCHF(vacancesDisponibles)}
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
        <div>${formatCHF(p["Budget annuel"] || 0)}</div>
        <div>${formatCHF(p["Montant mensuel"] || 0)}</div>
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
async function toggleReservesCard() {

  try {

    const postes = await getFinancePostes();

    const postesVacances =
      postes.filter(p =>
        (p["Compte"] || "")
          .toLowerCase()
          .includes("vacances")
      );

   
    const dashboard =
      await getFinanceDashboard();

    const getDashboardValue = (label) => {

      const row = dashboard.find(r =>
        normalizeLabel(r["Libellé"])
          .includes(normalizeLabel(label))
      );

      const valeur = String(
        row?.["Valeur"] || "0"
      )
        .replace("Fr. ", "")
        .replace(/'/g, "");

      return Number(valeur);
    };

    const voiture =
      getDashboardValue("voiture");

    const lunettes =
      getDashboardValue("lunettes");

    const cadeaux =
      getDashboardValue("cadeaux");

    const impots =
      getDashboardValue("impôts");

    const totalReserves =
      getDashboardValue("total réserves");

    const vacances =
      getDashboardValue("solde vacances") -
      totalReserves;

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
function renderFinanceHistory(movements) {

  const container =
  document.getElementById("financeList");

  if (!container) return;

  const sorted = [...movements]
    .sort((a, b) =>
      new Date(b.Date) - new Date(a.Date)
    )
    .slice(0, 20);

  container.innerHTML = sorted.map(m => `
    <div class="card">

      <strong>${m["Compte"] || ""}</strong><br>

      📅 ${formatDate(m["Date"])}<br>

      ${m["Poste"] || ""}<br>

      ${m["Sens"] === "Sortie" ? "🔻" : "🔹"}
      ${formatCHF(m["Montant"] || 0)}

      ${m["Description"]
        ? `<br><small>${m["Description"]}</small>`
        : ""}

    </div>
  `).join("");
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

}

