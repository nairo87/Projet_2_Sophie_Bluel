const url = "http://localhost:5678/api";
let allWorks = [];
let currentFilter = null;
let allCategories = [];

getWorks();
getCategories();
displayAdminMode();
handlePictureSubmit();

// Toggle entre les deux modales
const addPhotoButton = document.querySelector(".add-photo-button");
const backButton = document.querySelector(".js-modal-back");
addPhotoButton.addEventListener("click", toggleModal);
backButton.addEventListener("click", toggleModal);

// Recuperation des travaux depuis l'API
function getWorks() {
  fetch(`${url}/works`)
    .then((response) => {
      if (!response.ok) throw new Error(`Response status: ${response.status}`);
      return response.json();
    })
    .then((json) => {
      allWorks = json;
      renderWorks();
    })
    .catch((error) => console.error(error.message));
}

// Affichage des travaux selon le filtre actif
function renderWorks() {
  document.querySelector(".gallery").innerHTML = "";
  document.querySelector(".modal-gallery").innerHTML = "";

  const items = currentFilter
    ? allWorks.filter((data) => data.categoryId === currentFilter)
    : allWorks;

  items.forEach((data) => {
    setFigure(data);
    setFigureModal(data);
  });

  document
    .querySelectorAll(".fa-trash-can")
    .forEach((e) => e.addEventListener("click", (event) => deleteWork(event)));
}

// Integration a la galerie des figures (image + titre)
function setFigure(data) {
  const figure = document.createElement("figure");
  figure.innerHTML = `<img src=${data.imageUrl} alt=${data.title}>
                    <figcaption>${data.title}</figcaption>`;
  document.querySelector(".gallery").append(figure);
}

// Integration a la modale des figures (image + titre)
function setFigureModal(data) {
  const figure = document.createElement("figure");
  figure.innerHTML = `<div class="image-container">
        <img src="${data.imageUrl}" alt="${data.title}">
        <figcaption>${data.title}</figcaption>
        <i id=${data.id} class="fa-solid fa-trash-can overlay-icon"></i>
    </div>`;
  document.querySelector(".modal-gallery").append(figure);
}

// Recuperation des categories depuis l'API
function getCategories() {
  fetch(`${url}/categories`)
    .then((response) => {
      if (!response.ok) throw new Error(`Response status: ${response.status}`);
      return response.json();
    })
    .then((json) => {
      allCategories = json;
      json.forEach((data) => setFilter(data));
      renderCategories();
    })
    .catch((error) => console.error(error.message));
}

function renderCategories() {
  const select = document.getElementById("category");
  select.innerHTML = "";

  allCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.innerHTML = category.name;
    select.appendChild(option);
  });
}

// Ajout des eventListeners aux filtres
function setFilter(data) {
  const div = document.createElement("div");
  div.className = data.id;
  div.addEventListener("click", () => {
    currentFilter = data.id;
    renderWorks();
  });
  div.addEventListener("click", (event) => toggleFilter(event));
  div.innerHTML = `${data.name}`;
  document.querySelector(".div-container").append(div);
}

// Affichage du filtre actif
function toggleFilter(event) {
  const container = document.querySelector(".div-container");
  Array.from(container.children).forEach((child) =>
    child.classList.remove("active-filter"),
  );
  event.target.classList.add("active-filter");
}

document.querySelector(".tous").addEventListener("click", () => {
  currentFilter = null;
  renderWorks();
});
document
  .querySelector(".tous")
  .addEventListener("click", (event) => toggleFilter(event));

// Utilisateur authentifié
function displayAdminMode() {
  if (sessionStorage.authToken) {
    document.querySelector(".div-container").style.display = "none";
    document.querySelector(".js-modal-2").style.display = "block";
    document.querySelector(".gallery").style.margin = "30px 0 0 0";
    const editBanner = document.createElement("div");
    editBanner.className = "edit";
    editBanner.innerHTML =
      '<p><a href="#modal1" class="js-modal"><i class="fa-regular fa-pen-to-square"></i> Mode édition</a></p>';
    document.body.prepend(editBanner);
    document.querySelector(".log-button").textContent = "logout";
    document.querySelector(".log-button").addEventListener("click", () => {
      sessionStorage.removeItem("authToken");
    });
  }
}

// MODALE
let modal = null;
const focusableSelector = "button, a, input, textarea";
let focusables = [];

const openModal = function (e) {
  e.preventDefault();
  modal = document.querySelector(e.target.getAttribute("href"));
  focusables = Array.from(modal.querySelectorAll(focusableSelector));
  focusables[0].focus();
  modal.style.display = null;
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", "true");
  modal.addEventListener("click", closeModal);
  modal
    .querySelectorAll(".js-modal-close")
    .forEach((e) => e.addEventListener("click", closeModal));
  modal
    .querySelector(".js-modal-stop")
    .addEventListener("click", stopPropagation);
};

const closeModal = function (e) {
  if (modal === null) return;
  e.preventDefault();
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  modal.removeAttribute("aria-modal");
  modal.removeEventListener("click", closeModal);
  modal
    .querySelector(".js-modal-close")
    .removeEventListener("click", closeModal);
  modal
    .querySelector(".js-modal-stop")
    .removeEventListener("click", stopPropagation);
  modal = null;
};

const stopPropagation = function (e) {
  e.stopPropagation();
};

const focusInModal = function (e) {
  e.preventDefault();
  let index = focusables.findIndex((f) => f === modal.querySelector(":focus"));
  if (e.shiftKey === true) {
    index--;
  } else {
    index++;
  }
  if (index >= focusables.length) index = 0;
  if (index < 0) index = focusables.length - 1;
  focusables[index].focus();
};

window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" || e.key === "Esc") closeModal(e);
  if (e.key === "Tab" && modal !== null) focusInModal(e);
});

document.querySelectorAll(".js-modal").forEach((a) => {
  a.addEventListener("click", openModal);
});

// Fonction de suppression des travaux
function deleteWork(event) {
  event.stopPropagation();
  const id = event.srcElement.id;
  const token = sessionStorage.authToken;

  fetch(`${url}/works/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((response) => {
      if (response.status == 401 || response.status == 500) {
        const errorBox = document.createElement("div");
        errorBox.className = "error-login";
        errorBox.innerHTML = "Il y a eu une erreur";
        document.querySelector(".modal-button-container").prepend(errorBox);
      } else {
        allWorks = allWorks.filter((work) => work.id !== parseInt(id));
        renderWorks();
      }
    })
    .catch((error) => console.error("Erreur lors de la suppression:", error));
}

// Toggle entre les 2 modales
function toggleModal() {
  const galleryModal = document.querySelector(".gallery-modal");
  const addModal = document.querySelector(".add-modal");

  if (
    galleryModal.style.display === "block" ||
    galleryModal.style.display === ""
  ) {
    galleryModal.style.display = "none";
    addModal.style.display = "block";
  } else {
    galleryModal.style.display = "block";
    addModal.style.display = "none";
  }
}

// Gestion de l'ajout d'une nouvelle photo
function handlePictureSubmit() {
  const img = document.createElement("img");
  const fileInput = document.getElementById("file");
  let file;
  fileInput.style.display = "none";

  fileInput.addEventListener("change", function (event) {
    file = event.target.files[0];
    const maxFileSize = 4 * 1024 * 1024;
    const allowedFormats = ["image/jpeg", "image/png"];
    const allowedExtensions = ["jpg", "jpeg", "png"];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (
      file &&
      allowedFormats.includes(file.type) &&
      allowedExtensions.includes(fileExtension)
    ) {
      if (file.size > maxFileSize) {
        alert("La taille de l'image ne doit pas dépasser 4 Mo.");
        fileInput.value = "";
        file = undefined;
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
        img.alt = "Uploaded Photo";
        document.getElementById("photo-container").appendChild(img);
      };
      reader.readAsDataURL(file);
      document
        .querySelectorAll(".picture-loaded")
        .forEach((e) => (e.style.display = "none"));
    } else {
      alert("Veuillez sélectionner une image au format JPG ou PNG.");
      fileInput.value = "";
      file = undefined;
    }
  });

  const titleInput = document.getElementById("title");
  let titleValue = "";
  let selectedValue = "1";

  document.getElementById("category").addEventListener("change", function () {
    selectedValue = this.value;
  });

  titleInput.addEventListener("input", function () {
    titleValue = titleInput.value;
  });

  const addPictureForm = document.getElementById("picture-form");

  addPictureForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const hasImage = document.querySelector("#photo-container").firstChild;

    const fileExtension = file ? file.name.split(".").pop().toLowerCase() : "";
    const allowedExtensions = ["jpg", "jpeg", "png"];
    if (
      file &&
      (!allowedExtensions.includes(fileExtension) ||
        (file.type !== "image/jpeg" && file.type !== "image/png"))
    ) {
      alert("Veuillez sélectionner une image au format JPG ou PNG.");
      return;
    }

    if (hasImage && titleValue) {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("title", titleValue);
      formData.append("category", selectedValue);

      const token = sessionStorage.authToken;
      if (!token) {
        console.error("Token d'authentification manquant.");
        return;
      }

      fetch(`${url}/works`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
        },
        body: formData,
      })
        .then((response) => {
          if (response.status !== 201) {
            return response.text().then((errorText) => {
              console.error("Erreur : ", errorText);
              const errorBox = document.createElement("div");
              errorBox.className = "error-login";
              errorBox.innerHTML = `Il y a eu une erreur : ${errorText}`;
              document.querySelector("form").prepend(errorBox);
            });
          } else {
            return response.json().then((newWork) => {
              allWorks.push(newWork);
              renderWorks();
              toggleModal();
              addPictureForm.reset();
              img.src = "";
              img.alt = "";
              document.getElementById("photo-container").innerHTML = "";
              document
                .querySelectorAll(".picture-loaded")
                .forEach((e) => (e.style.display = ""));
              titleValue = "";
              selectedValue = "1";
            });
          }
        })
        .catch((error) => console.error(error));
    } else {
      alert("Veuillez remplir tous les champs");
    }
  });
}
