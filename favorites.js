// ====== Replace with your Spoonacular API key ======
const apiKey = "your_api_key";
// ==================================================

const favContainer = document.getElementById("favoriteRecipes");
const modal = document.getElementById("recipeModal");
const modalDetails = document.getElementById("modalDetails");
const closeModalBtn = document.getElementById("closeModalBtn") || document.querySelector("#recipeModal .close");

function loadFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favContainer.innerHTML = "";

  if (favorites.length === 0) {
    favContainer.innerHTML = "<p>No favorites saved yet.</p>";
    return;
  }

  favorites.forEach(recipe => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    const img = document.createElement("img");
    img.src = recipe.image;
    img.alt = recipe.title;

    const info = document.createElement("div");
    info.className = "recipe-info";

    const title = document.createElement("h3");
    title.textContent = recipe.title;

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const viewBtn = document.createElement("button");
    viewBtn.textContent = "👀 View";
    viewBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      viewRecipe(recipe.id);
    });

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌ Remove";
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeFavorite(recipe.id);
    });

    actions.appendChild(viewBtn);
    actions.appendChild(removeBtn);

    info.appendChild(title);
    info.appendChild(actions);

    card.appendChild(img);
    card.appendChild(info);

    favContainer.appendChild(card);
  });
}

async function viewRecipe(id) {
  try {
    modalDetails.innerHTML = "<p>Loading recipe...</p>";
    modal.setAttribute("aria-hidden", "false");

    const url = `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=false&apiKey=${apiKey}`;
    const res = await fetch(url);

    if (!res.ok) {
      const txt = await res.text();
      console.error("Recipe info API error:", res.status, txt);
      throw new Error(`API ${res.status}`);
    }

    const data = await res.json();
    const ingredients = (data.extendedIngredients || []).map(i => `<li>${escapeHtml(i.original)}</li>`).join("");
    const instructions = data.instructions || data.summary || "No instructions available.";

    modalDetails.innerHTML = `
      <h2>${escapeHtml(data.title)}</h2>
      <img src="${data.image || ""}" alt="${escapeHtml(data.title)}" />
      <p><strong>Ready in:</strong> ${data.readyInMinutes ?? "N/A"} mins • <strong>Servings:</strong> ${data.servings ?? "N/A"}</p>
      <h3>Ingredients</h3>
      <ul>${ingredients}</ul>
      <h3>Instructions</h3>
      <div>${instructions}</div>
    `;
  } catch (err) {
    console.error("viewRecipe error:", err);
    modalDetails.innerHTML = "<p>Error loading recipe details. Try again later.</p>";
  }
}

function removeFavorite(id) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter(r => r.id !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  loadFavorites();
}

function closeModal() {
  modal.setAttribute("aria-hidden", "true");
  modalDetails.innerHTML = "";
}

closeModalBtn && closeModalBtn.addEventListener("click", closeModal);
window.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

document.addEventListener("DOMContentLoaded", loadFavorites);
