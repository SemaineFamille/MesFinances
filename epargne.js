/* =========================
   EPARGNE 3
========================= */


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
window.addEpargne3Entry = addEpargne3Entry;

