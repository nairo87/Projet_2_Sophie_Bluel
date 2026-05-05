const loginApi = "http://localhost:5678/api/users/login";
document.getElementById("loginform").addEventListener("submit", handleSubmit);

function handleSubmit(event) {
  event.preventDefault();
  let user = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  };

  fetch(loginApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  })
    .then((response) => {
      if (response.status != 200) {
        const errorBox = document.createElement("div");
        errorBox.className = "error-login";
        errorBox.innerHTML =
          "Veuillez vérifier votre email et/ou votre mot de passe";
        document.querySelector("form").prepend(errorBox);
      } else {
        return response.json().then((result) => {
          const token = result.token;
          sessionStorage.setItem("authToken", token);
          window.location.href = "index.html";
        });
      }
    })
    .catch((error) => console.error(error));
}
