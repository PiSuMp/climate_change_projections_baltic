// Static gallery viewer for the Öresund Trophic Levels habitat suitability
// results. Mirrors 05_Shiny_App/app.R (same role grouping/colors), but is a
// plain static page -- no server needed, since none of this involves live
// computation, just swapping which pre-rendered image is shown.

const ROLE_ORDER = ["Large_Predator", "Mesopredator", "Forage_Prey", "Diadromous", "Freshwater_Stray", "Invasive_Species"];

const ROLE_LABELS = { Large_Predator: "Large Predators", Forage_Prey: "Forage/Prey" };
function roleLabel(role) {
  return ROLE_LABELS[role] || role.replace(/_/g, " ");
}

function buildGroupedSelect(selectEl, speciesList) {
  selectEl.innerHTML = "";
  for (const role of ROLE_ORDER) {
    const group = speciesList.filter(s => s.role === role);
    if (group.length === 0) continue;
    const optgroup = document.createElement("optgroup");
    optgroup.label = roleLabel(role);
    for (const sp of group) {
      const opt = document.createElement("option");
      opt.value = sp.prefix;
      opt.textContent = sp.common;
      optgroup.appendChild(opt);
    }
    selectEl.appendChild(optgroup);
  }
}

function setBadge(badgeEl, prefix, speciesList) {
  const sp = speciesList.find(s => s.prefix === prefix);
  if (!sp) { badgeEl.textContent = ""; badgeEl.className = "role-badge"; return; }
  badgeEl.textContent = roleLabel(sp.role);
  badgeEl.className = "role-badge " + sp.role;
}

document.addEventListener("DOMContentLoaded", () => {
  // ---- tabs ----
  document.querySelectorAll(".tab-btn").forEach(btn => {
    if (btn.disabled) return;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
    });
  });

  // ---- animation tab (gif + seasonal-cycle plot side by side) ----
  const animSelect = document.getElementById("anim-species");
  const animBadge = document.getElementById("anim-badge");
  const animGif = document.getElementById("anim-gif");
  const seasonalImg = document.getElementById("anim-seasonal");
  const seasonalMissing = document.getElementById("anim-seasonal-missing");
  buildGroupedSelect(animSelect, window.SPECIES_DATA);

  function updateAnim() {
    const prefix = animSelect.value;
    const sp = window.SPECIES_DATA.find(s => s.prefix === prefix);
    animGif.src = `assets/animations/${prefix}.gif?v=4`;
    animGif.alt = `Monthly suitability animation for ${prefix}`;
    setBadge(animBadge, prefix, window.SPECIES_DATA);

    if (sp && sp.season) {
      seasonalImg.src = `assets/seasonal/${prefix}_seasonal_periodavg.png?v=2`;
      seasonalImg.alt = `Seasonal cycle for ${prefix}`;
      seasonalImg.style.display = "";
      seasonalMissing.style.display = "none";
    } else {
      seasonalImg.style.display = "none";
      seasonalMissing.style.display = "";
    }
  }
  animSelect.addEventListener("change", updateAnim);
  if (animSelect.options.length > 0) updateAnim();

  // ---- future projections tab (delta method: animation + seasonal cycle, stacked) ----
  const futSelect = document.getElementById("future-species");
  const futBadge = document.getElementById("future-badge");
  const futGif = document.getElementById("future-gif");
  const futSeasonal = document.getElementById("future-seasonal");
  const futMissing = document.getElementById("future-missing");
  const futureSpecies = window.SPECIES_DATA.filter(s => s.future);
  buildGroupedSelect(futSelect, futureSpecies);

  function updateFuture() {
    const prefix = futSelect.value;
    const sp = futureSpecies.find(s => s.prefix === prefix);
    setBadge(futBadge, prefix, futureSpecies);
    if (sp) {
      futGif.src = `assets/future_animations/${prefix}.gif?v=2`;
      futGif.alt = `Future monthly suitability animation for ${sp.common}`;
      futSeasonal.src = `assets/future_seasonal/${prefix}.png?v=2`;
      futSeasonal.alt = `Future seasonal cycle for ${sp.common}`;
      futGif.style.display = futSeasonal.style.display = "";
      futMissing.style.display = "none";
    } else {
      futGif.style.display = futSeasonal.style.display = "none";
      futMissing.style.display = "";
    }
  }
  futSelect.addEventListener("change", updateFuture);
  if (futSelect.options.length > 0) updateFuture();
});
