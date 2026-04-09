async function getWorks() {
  const url = "http://localhost:5678/api/works";
  try {
    const reponse = await fetch(url);
    if (!reponse.ok) {
      throw new Error(`Statut de réponse : ${reponse.status}`);
    }

    const json = await reponse.json();
    console.log(json);
    json.forEach((data) => {
      setFigure(data);
    });
  } catch (error) {
    console.error(error.message);
  }
}

getWorks();

function setFigure(data) {
  const figure = document.createElement("figure");
  figure.innerHTML = `<img src=${data.imageUrl} alt="${data.title}" />
            <figcaption>${data.title}</figcaption>`;

  document.querySelector(".gallery").append(figure);
}

async function getCategories() {
  const url = "http://localhost:5678/api/categories";
  try {
    const reponse = await fetch(url);
    if (!reponse.ok) {
      throw new Error(`Statut de réponse : ${reponse.status}`);
    }

    const json = await reponse.json();
    console.log(json);
    json.forEach((data) => {
      setFilter(data);
    });
  } catch (error) {
    console.error(error.message);
  }
}

getCategories();

function setFilter(data) {
  const div = document.createElement("div");
  div.innerHTML = `${data.name}`;
  document.querySelector(".div-container").append(div);
}
