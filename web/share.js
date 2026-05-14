/**
 * share.js — URL deep linking to a filtered view.
 */

function encodeFilters() {
  const f = window.SMOL.getFilterState();
  const params = new URLSearchParams();
  if (f.provider) params.set("provider", f.provider);
  if (f.suite) params.set("suite", f.suite);
  if (f.search) params.set("q", f.search);
  return params.toString();
}

function decodeFilters() {
  const p = new URLSearchParams(window.location.search);
  return { provider: p.get("provider") ?? "", suite: p.get("suite") ?? "", search: p.get("q") ?? "" };
}

function applyUrlFilters() {
  const f = decodeFilters();
  const prov = document.getElementById("provider-filter");
  const suite = document.getElementById("suite-filter");
  const search = document.getElementById("search");
  if (prov && f.provider) prov.value = f.provider;
  if (suite && f.suite) suite.value = f.suite;
  if (search && f.search) search.value = f.search;
}

function shareCurrentView() {
  const params = encodeFilters();
  const url = window.location.origin + window.location.pathname + (params ? "?" + params : "");
  navigator.clipboard.writeText(url).then(() => showToast("Link copied!")).catch(() => showToast("Copy: " + url));
  // Update URL without reload
  history.replaceState(null, "", url);
}

function showToast(msg) {
  let toast = document.getElementById("share-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "share-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// Expose on SMOL for external callers
window.SMOL.shareCurrentView = shareCurrentView;
window.SMOL.applyUrlFilters = applyUrlFilters;
window.SMOL.decodeFilters = decodeFilters;
window.SMOL.encodeFilters = encodeFilters;

// Auto-apply URL filters on load
window.addEventListener("DOMContentLoaded", applyUrlFilters);
