const API_URL ="https://script.google.com/macros/s/AKfycbxcQPcOYKJDse5gU2dAHYk7bzmep0oZ9vEKZZt7b_pdKyDUUGOjWc3_nJPFr3Fk6JOWIg/exec";

/* =========================
   APPEL API
========================= */

async function apiGet(action) {

  const response = await fetch(
    `${API_URL}?action=${action}`
  );

  return await response.json();
}

async function apiPost(data) {

  const formData = new FormData();

  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });

  const response = await fetch(API_URL, {
    method: "POST",
    body: formData
  });

  return await response.json();
}

/* =========================
   CHARGEMENT DONNEES
========================= */

async function loadAssura() {

  try {

    const data = await apiGet("getAssura");

    console.log("ASSURA", data);

    renderAssura(data);

  } catch (err) {

    console.error(err);

  }
}

async function loadKpt() {

  try {

    const data = await apiGet("getKpt");

    console.log("KPT", data);

    renderKpt(data);

  } catch (err) {

    console.error(err);

  }
}
async function deleteKptFacture(id) {

  return await apiPost({
    action: "deleteKpt",
    id
  });

}

async function updateKptRemboursement(row, value) {

  return await apiPost({
    action: "updateKpt",
    row: row,
    recu: value
  });

}


async function loadParams() {

  try {

    const data = await apiGet("getParams");

    console.log("PARAMS", data);

    return data;

  } catch (err) {

    console.error(err);

    return [];

  }
}

/* =========================
   AJOUT ASSURA
========================= */

async function saveAssura(data) {

  return await apiPost({
    action: "addAssura",
    ...data
  });

}

/* =========================
   AJOUT KPT
========================= */

async function saveKpt(data) {

  return await apiPost({
    action: "addKpt",
    ...data
  });

}
