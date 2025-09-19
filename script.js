// ====== Replace with your Spoonacular API key ======
const apiKey = "391ff3bb9618468c819b4781c4092f5e";
// ==================================================

const searchBtn = document.getElementById("searchBtn");
const ingredientInput = document.getElementById("ingredientInput");
const recipesContainer = document.getElementById("recipes");

const modal = document.getElementById("recipeModal");
const modalDetails = document.getElementById("modalDetails");
const closeModalBtn = document.getElementById("closeModalBtn") || document.querySelector("#recipeModal .close");

searchBtn.addEventListener("click", fetchRecipes);
ingredientInput.addEventListener("keydown", (e) => { if (e.key === "Enter") fetchRecipes(); });

async function fetchRecipes() {
  const q = ingredientInput.value.trim();
  if (!q) return alert("Please enter ingredients!");

  recipesContainer.innerHTML = "<p>Loading recipes...</p>";

  try {
    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(q)}&number=12&apiKey=${apiKey}`;
    const res = await fetch(url);
    console.log("Fetch status:", res.status, res.statusText);

    if (!res.ok) {
      const text = await res.text();
      console.error("API error response:", text);
      throw new Error(`API error ${res.status}`);
    }

    const data = await res.json();
    displayRecipes(data);
  } catch (err) {
    console.error("Fetch failed:", err);
    recipesContainer.innerHTML = "<p>Error loading recipes. Check console for details.</p>";
  }
}

function displayRecipes(recipes) {
  recipesContainer.innerHTML = "";
  if (!recipes || recipes.length === 0) {
    recipesContainer.innerHTML = "<p>No recipes found for those ingredients.</p>";
    return;
  }

  recipes.forEach(recipe => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    const img = document.createElement("img");
    img.src = recipe.image;
    img.alt = recipe.title;

    const info = document.createElement("div");
    info.className = "recipe-info";

    const title = document.createElement("h3");
    title.textContent = recipe.title;

    const meta = document.createElement("p");
    meta.textContent = `Used: ${recipe.usedIngredientCount} • Missing: ${recipe.missedIngredientCount}`;

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const viewBtn = document.createElement("button");
    viewBtn.textContent = "👀 View";
    viewBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      viewRecipe(recipe.id);
    });

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "⭐ Save";
    saveBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      saveFavorite({ id: recipe.id, title: recipe.title, image: recipe.image });
    });

    actions.appendChild(viewBtn);
    actions.appendChild(saveBtn);

    info.appendChild(title);
    info.appendChild(meta);
    info.appendChild(actions);

    card.appendChild(img);
    card.appendChild(info);

    recipesContainer.appendChild(card);
  });
}

// Save favorite (store id/title/image)
function saveFavorite(obj) {
  let fav = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!fav.some(r => r.id === obj.id)) {
    fav.push(obj);
    localStorage.setItem("favorites", JSON.stringify(fav));
    alert("Saved to favorites!");
  } else {
    alert("Already in favorites");
  }
}

// Fetch and show full recipe in modal
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

function closeModal() {
  modal.setAttribute("aria-hidden", "true");
  modalDetails.innerHTML = "";
}

closeModalBtn && closeModalBtn.addEventListener("click", closeModal);
window.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// small helper to prevent basic HTML injection in text (titles/ingredients)
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
