// Çerez onayı: varsayılan onaylıdır. "Tamam" ya da ✕ onayı kalıcı yapar; "Reddet" Google Analytics'in çerez
// saklamasını durdurur. Seçim tarayıcıda "cerez" anahtarıyla saklanır.
(function () {
  var KEY = "cerez", choice = null;
  try { choice = localStorage.getItem(KEY); } catch (e) {}
  if (choice) return;
  var lift = document.currentScript && document.currentScript.dataset.lift; // atlasta sağ alttaki düğmelerin üstünde durur

  function save(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    if (typeof window.gtag === "function") window.gtag("consent", "update", { analytics_storage: v === "red" ? "denied" : "granted" });
    box.remove();
  }

  var css = document.createElement("style");
  css.textContent =
    ".cerez{position:fixed;z-index:50;right:max(16px,env(safe-area-inset-right,0px));bottom:calc(" + (lift || "16px") + " + env(safe-area-inset-bottom,0px));" +
    "max-width:min(320px,calc(100vw - 32px));display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;padding:10px 34px 10px 14px;" +
    "background:rgba(8,10,14,.92);border:1px solid rgba(224,185,104,.25);border-radius:12px;color:#cfc6b4;" +
    "font:12.5px/1.45 'IBM Plex Sans',system-ui,-apple-system,'Segoe UI',sans-serif;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}" +
    ".cerez p{margin:0;flex:1 1 160px}" +
    ".cerez .b{display:flex;gap:6px}" +
    ".cerez button{font:inherit;cursor:pointer;border-radius:999px;padding:5px 12px;border:1px solid rgba(255,255,255,.12);background:transparent;color:#9a8f7c}" +
    ".cerez button:hover{color:#ece4d3}" +
    ".cerez .ok{background:#e0b968;border-color:#e0b968;color:#04060a}" +
    ".cerez .ok:hover{background:#ecc77a;color:#04060a}" +
    ".cerez .x{position:absolute;top:6px;right:6px;width:22px;height:22px;padding:0;border:0;line-height:22px;text-align:center;font-size:12px}" +
    ".cerez button:focus-visible{outline:2px solid #e0b968;outline-offset:2px}";

  var box = document.createElement("div");
  box.className = "cerez";
  box.setAttribute("role", "region");
  box.setAttribute("aria-label", "Çerez onayı");
  box.innerHTML = '<p>Siteyi geliştirmek için çerez kullanıyoruz.</p>' +
    '<div class="b"><button type="button" data-c="red">Reddet</button><button type="button" class="ok" data-c="ok">Tamam</button></div>' +
    '<button type="button" class="x" data-c="ok" aria-label="Kapat">✕</button>';
  box.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (b) save(b.getAttribute("data-c"));
  });

  function show() { document.head.appendChild(css); document.body.appendChild(box); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", show); else show();
})();
