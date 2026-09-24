// Static gallery viewer for the Öresund Trophic Levels habitat suitability
// results. Mirrors 05_Shiny_App/app.R (same role grouping/colors), but is a
// plain static page -- no server needed, since none of this involves live
// computation, just swapping which pre-rendered image is shown.

const ROLE_ORDER = ["Top_Predator", "Mesopredator", "Forage_Prey", "Diadromous", "Freshwater_Stray", "Invasive_Species"];

function roleLabel(role) {
  return role.replace(/_/g, " ");
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

  // ---- animation tab ----
  const animSelect = document.getElementById("anim-species");
  const animBadge = document.getElementById("anim-badge");
  const animGif = document.getElementById("anim-gif");
  buildGroupedSelect(animSelect, window.SPECIES_DATA);

  function updateAnim() {
    const prefix = animSelect.value;
    animGif.src = `assets/animations/${prefix}.gif`;
    animGif.alt = `Monthly suitability animation for ${prefix}`;
    setBadge(animBadge, prefix, window.SPECIES_DATA);
  }
  animSelect.addEventListener("change", updateAnim);
  if (animSelect.options.length > 0) updateAnim();
});
