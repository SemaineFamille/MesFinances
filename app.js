
console.log("APP VERSION 19-06-2026 11h35");

const API_URL ="https://script.google.com/macros/s/AKfycbxcQPcOYKJDse5gU2dAHYk7bzmep0oZ9vEKZZt7b_pdKyDUUGOjWc3_nJPFr3Fk6JOWIg/exec";


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
function addAssuraFacture() {

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

  console.log({
    date,
    prestataire,
    type,
    montant,
    notes
  });

  alert("Facture enregistrée !");
}
function addKptFacture() {

  const date =
    document.getElementById("kptDate").value;

  const assurance =
    document.getElementById("kptAssurance").value;

  const type =
    document.getElementById("kptType").value;

  const facture =
    document.getElementById("kptFacture").value;

  console.log({
    date,
    assurance,
    type,
    facture
  });

  alert("Prestation enregistrée !");
}
