// Liste sayfalarında şehit ve yer kartları: isme ya da yer adına dokununca künye ya da yer kartı açılır;
// kartlardan atlasa gidilir, paylaşılır, geri bildirim gönderilir. Betik çalışmazsa bağlantılar eskisi gibi sayfaya gider.
(() => {
  const SITE = "https://sehadetatlasi.com/";
  const FB_FORM = "https://docs.google.com/forms/d/e/1FAIpQLScTlkvKXTHw8YQfMEAyGrEhlLUkmG_sBGyqn3Bp5olKmYgCJg/formResponse";
  const FB = { konu: "entry.1709899388", mesaj: "entry.1087826175", kayit: "entry.620647150", eposta: "entry.262533170", ad: "entry.520107710" };
  const FB_TOPICS = ["Genel görüş", "Kayıtta hata", "Sistem hatası", "Öneri"];
  let rows = [];
  try { rows = JSON.parse((document.getElementById("kunyeler") || {}).textContent || "[]"); } catch (e) {}
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const fmt = (n) => Number(n).toLocaleString("tr-TR");
  const ICON = {
    fb: '<svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 3.5h11v7.2H6.8L3.6 13.2v-2.5H2.5z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M5.2 6.3h5.6M5.2 8.3h3.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    whatsapp: '<path d="M8 1.6a6.4 6.4 0 0 0-5.5 9.7L1.6 14.4l3.2-.8A6.4 6.4 0 1 0 8 1.6z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M5.9 5.1c.2-.3.6-.3.8 0l.6 1.2c.1.2 0 .5-.1.6l-.4.4c.4.9 1.1 1.6 2 2l.4-.4c.2-.2.4-.2.6-.1l1.2.6c.3.2.3.6 0 .8-.6.6-1.5.8-2.3.4A6 6 0 0 1 5.5 7.4c-.4-.8-.2-1.7.4-2.3z" fill="currentColor"/>',
    x: '<path d="M2.2 2h3.6l2.7 3.8L11.8 2h1.7L9.3 6.8 14 14h-3.6L7.4 9.8 3.9 14H2.2l4.5-5.2z" fill="currentColor"/>',
    facebook: '<path d="M9.2 15V9h2l.3-2.4H9.2V5.1c0-.7.2-1.2 1.2-1.2h1.2V1.8c-.2 0-.9-.1-1.8-.1-1.8 0-3 1.1-3 3.1v1.8h-2V9h2v6z" fill="currentColor"/>',
    telegram: '<path d="M14.3 2.2 1.9 7c-.6.2-.6 1 0 1.2l3 .9 1.2 3.8c.1.5.7.6 1 .3l1.8-1.6 3.2 2.3c.4.3 1 .1 1.1-.4l2-10.5c.1-.6-.4-1-.9-.8zM6.3 9.3l5.8-4.6-4.7 5.3-.3 2.1z" fill="currentColor"/>',
    linkedin: '<path d="M2.2 6h2.6v8H2.2zM3.5 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM6.4 6h2.5v1.1c.4-.7 1.2-1.3 2.5-1.3 2.6 0 3.1 1.7 3.1 3.9V14h-2.6v-3.8c0-.9 0-2.1-1.3-2.1s-1.5 1-1.5 2V14H6.4z" fill="currentColor"/>',
    mail: '<rect x="1.8" y="3.3" width="12.4" height="9.4" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="m2.3 4 5.7 4.6L13.7 4" fill="none" stroke="currentColor" stroke-width="1.3"/>',
    more: '<circle cx="3.5" cy="8" r="1.3" fill="currentColor"/><circle cx="8" cy="8" r="1.3" fill="currentColor"/><circle cx="12.5" cy="8" r="1.3" fill="currentColor"/>',
  };
  const svg = (k) => `<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">${ICON[k]}</svg>`;

  // tek bir pencere: kart, paylaş ve geri bildirim içeriğini sırayla taşır
  const wrap = document.createElement("div");
  wrap.className = "kart-wrap"; wrap.hidden = true;
  wrap.innerHTML = '<div class="kart" role="dialog" aria-modal="true" aria-labelledby="kart-baslik"><button type="button" class="kart-x" aria-label="Kapat">✕</button><div class="kart-ic"></div></div>';
  document.body.appendChild(wrap);
  const box = wrap.querySelector(".kart"), body = wrap.querySelector(".kart-ic");
  let last = null, back = null;
  const open = (html, onBack) => {
    if (wrap.hidden) last = document.activeElement;
    back = onBack || null;
    body.innerHTML = html; wrap.hidden = false; box.scrollTop = 0;
    wrap.querySelector(".kart-x").focus();
  };
  const close = () => { if (back) { const b = back; back = null; b(); return; } wrap.hidden = true; if (last && last.focus) last.focus(); };
  wrap.querySelector(".kart-x").addEventListener("click", close);
  wrap.addEventListener("click", (e) => { if (e.target === wrap) { back = null; close(); } });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !wrap.hidden) close(); });

  // ---- şehit kartı: [id, ad, baba, lakap, rütbe, memleket, doğum, yaş, harp, cephe, şehadet yeri, tarih, Miladi, birlik, yeri kesin]
  function personCard(r) {
    const [id, ad, baba, lakap, rutbe, mem, dogum, yas, harp, cephe, yer, tarih, mil, birlik, sy] = r;
    const row = (k, v) => (v ? `<dt>${k}</dt><dd>${v}</dd>` : "");
    const url = `${SITE}?sehit=${id}`;
    open(`<button type="button" class="kart-fb" aria-label="Bu kayıtla ilgili geri bildirim" title="Geri bildirim">${ICON.fb}</button>
      <div class="kart-yildiz">✦ ✦ ✦</div>
      <h2 id="kart-baslik">${esc(ad)}</h2>
      ${baba ? `<div class="kart-baba">${esc(baba)} oğlu</div>` : ""}${lakap ? `<div class="kart-baba">${esc(lakap)}</div>` : ""}
      ${rutbe ? `<div class="kart-rutbe">${esc(rutbe)}</div>` : ""}
      <dl>${row("Memleket", esc(mem))}${row("Doğum", esc(dogum))}${row("Şehadetinde", yas ? `${yas} yaşında` : "")}${row("Harp", esc(harp))}${row("Cephe", esc(cephe))}
        ${row("Şehadet yeri", esc(yer))}${row("Şehadet tarihi", tarih ? `${esc(tarih)}${mil ? ` <small>${/(^|\D)1[23]\d\d$/.test(tarih.trim()) ? "Rumi · " : ""}${/^\d+ /.test(mil) ? "Miladi" : "≈"} ${esc(mil)}</small>` : ""}` : "")}${row("Birlik", esc(birlik))}</dl>
      <p class="kart-not">Aziz hatırası önünde saygıyla.</p>
      <div class="kart-dugmeler"><a class="go" href="${url}&goster=memleket">Memleketini göster</a>${sy ? `<a class="hayalet" href="${url}&goster=yer">Şehadet yerini göster</a>` : ""}<button type="button" class="hayalet" data-paylas>Paylaş</button></div>`);
    const share = {
      head: `Şehit ${ad}`, url,
      text: [`Şehit ${ad}${baba ? `, ${baba} oğlu` : ""}${rutbe ? " · " + rutbe : ""}`, mem && `Memleketi: ${mem.replace(/ · /g, ", ")}`,
        (yer || mil) && `Şehadeti: ${[yer, mil].filter(Boolean).join(", ")}`, "Ruhu şad olsun."].filter(Boolean).join("\n"),
    };
    const again = () => personCard(r);
    body.querySelector("[data-paylas]").onclick = () => shareCard(share, again);
    body.querySelector(".kart-fb").onclick = () => feedbackCard({ head: `Şehit ${ad}${baba ? `, ${baba} oğlu` : ""}`, url, topic: "Kayıtta hata" }, again);
  }

  // ---- yer verisi: build_pages.py'nin place_* alanlarından bağlantılar ve paylaşım mesajı kurulur
  function placeData(raw) {
    const f = raw.split("|"), k = f[0];
    if (k === "i") { const [, s, ad, cnt, geo] = f; const liste = `${SITE}il/${s}/`;
      return { t: "Memleket", ad, n: +cnt, liste, harita: geo === "1" ? `${SITE}?il=${s}` : SITE, pay: geo === "1" ? `${SITE}s/il/${s}/` : liste, mesaj: `Memleketi ${ad} olan ${fmt(cnt)} şehidimiz ve şehit düştükleri yerler.` }; }
    if (k === "c") { const [, si, sc, ad, iln, cnt, geoC, geoI, anc] = f; const sayfa = anc ? `${SITE}il/${si}/#${anc}` : `${SITE}il/${si}/${sc}/`;
      return { t: "İlçe", ad, alt: iln, n: +cnt, liste: anc ? `#${anc}` : sayfa, harita: geoC === "1" ? `${SITE}?il=${si}&ilce=${sc}` : geoI === "1" ? `${SITE}?il=${si}` : SITE,
        pay: geoC === "1" ? `${SITE}s/il/${si}/${sc}/` : sayfa, mesaj: `Memleketi ${iln} ili ${ad} ilçesi olan ${fmt(cnt)} şehidimiz ve şehit düştükleri yerler.` }; }
    if (k === "k") { const [, si, sc, ad, icn, iln, cnt, anc, geoC, geoI] = f;
      return { t: "Köy · Mahalle", ad, alt: `${icn} · ${iln}`, n: +cnt, liste: `#${anc}`, harita: geoC === "1" ? `${SITE}?il=${si}&ilce=${sc}` : geoI === "1" ? `${SITE}?il=${si}` : SITE,
        pay: `${SITE}il/${si}/${sc}/#${anc}`, mesaj: `Memleketi ${ad} (${icn}, ${iln}) olan ${fmt(cnt)} şehidimiz.` }; }
    if (k === "b") { const [, s, ad, thn, cnt] = f;
      return { t: "Muharebe", ad, alt: thn, n: +cnt, liste: `${SITE}muharebe/${s}/`, harita: `${SITE}?muharebe=${s}`, pay: `${SITE}s/muharebe/${s}/`, mesaj: `${ad}: ${fmt(cnt)} şehidimiz ve memleketleri.` }; }
    if (k === "t") { const [, s, ad, years, cnt] = f;
      return { t: "Cephe", ad, alt: years, n: +cnt, liste: `${SITE}cephe/${s}/`, harita: `${SITE}?cephe=${s}`, pay: `${SITE}s/cephe/${s}/`, mesaj: `${ad} (${years}): ${fmt(cnt)} şehidimiz, muharebeleri ve memleketleri.` }; }
    return null;
  }

  // ---- yer kartı (köy, ilçe, il, cephe, muharebe)
  function placeCard(p, el) {
    const yerel = p.liste && p.liste[0] === "#";
    open(`<div class="eyebrow">${esc(p.t)}</div>
      <h2 id="kart-baslik" class="kart-yer">${esc(p.ad)}</h2>
      ${p.alt ? `<div class="kart-baba">${esc(p.alt)}</div>` : ""}
      <p class="kart-sayi"><b>${fmt(p.n)}</b> şehit</p>
      <div class="kart-dugmeler"><a class="go" href="${esc(p.liste)}" data-liste>${yerel ? "Listeyi göster" : "Listeyi aç"}</a><a class="hayalet" href="${esc(p.harita)}">Haritada göster</a><button type="button" class="hayalet" data-paylas>Paylaş</button></div>
      <button type="button" class="kart-fb" aria-label="Bununla ilgili geri bildirim" title="Geri bildirim">${ICON.fb}</button>`);
    if (yerel) body.querySelector("[data-liste]").onclick = (e) => { e.preventDefault(); back = null; wrap.hidden = true; const t = document.getElementById(p.liste.slice(1)); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); };
    const again = () => placeCard(p, el);
    body.querySelector("[data-paylas]").onclick = () => shareCard({ head: p.ad, url: p.pay, text: p.mesaj }, again);
    body.querySelector(".kart-fb").onclick = () => feedbackCard({ head: `${p.ad}${p.alt ? ` (${p.alt})` : ""}`, url: p.pay, topic: "Genel görüş" }, again);
  }

  // ---- paylaş
  function shareCard(s, onBack) {
    const links = (text) => {
      const u = encodeURIComponent(s.url), t = encodeURIComponent(text), full = encodeURIComponent(text + "\n\n" + s.url);
      return [["whatsapp", "WhatsApp", `https://api.whatsapp.com/send?text=${full}`], ["x", "X", `https://twitter.com/intent/tweet?text=${t}&url=${u}`],
        ["facebook", "Facebook", `https://www.facebook.com/sharer/sharer.php?u=${u}`], ["telegram", "Telegram", `https://t.me/share/url?url=${u}&text=${t}`],
        ["linkedin", "LinkedIn", `https://www.linkedin.com/sharing/share-offsite/?url=${u}`], ["mail", "E-posta", `mailto:?subject=${encodeURIComponent(s.head)}&body=${full}`]];
    };
    open(`<div class="eyebrow">Paylaş</div><h2 id="kart-baslik" class="kart-yer">${esc(s.head)}</h2>
      <label class="kart-etiket" for="kart-mesaj">Mesaj</label><textarea id="kart-mesaj" class="kart-alan" rows="4">${esc(s.text)}</textarea>
      <div class="kart-aglar"></div>
      <div class="kart-baglanti"><input readonly value="${esc(s.url)}" aria-label="Bağlantı"><button type="button" class="hayalet" data-kopya>Bağlantıyı kopyala</button></div>
      <p class="kart-durum" aria-live="polite"></p>`, onBack);
    const ta = body.querySelector("#kart-mesaj"), nets = body.querySelector(".kart-aglar"), note = (m) => { body.querySelector(".kart-durum").textContent = m; };
    const paint = () => {
      nets.innerHTML = links(ta.value.trim()).map(([k, n, h]) => `<a class="hayalet" href="${esc(h)}" target="_blank" rel="noopener">${svg(k)}${n}</a>`).join("") +
        `<button type="button" class="hayalet" data-metin>${svg("more")}Metni kopyala</button>` + (navigator.share ? `<button type="button" class="hayalet" data-yerel>${svg("more")}Diğer…</button>` : "");
      nets.querySelector("[data-metin]").onclick = () => copy(ta.value.trim() + "\n\n" + s.url, "Mesaj ve bağlantı kopyalandı.");
      const y = nets.querySelector("[data-yerel]"); if (y) y.onclick = () => navigator.share({ title: s.head, text: ta.value.trim(), url: s.url }).catch(() => {});
    };
    const copy = (txt, ok) => { try { navigator.clipboard.writeText(txt).then(() => note(ok), () => note("Kopyalanamadı; metni seçip kopyalayın.")); } catch (e) { note("Kopyalanamadı; metni seçip kopyalayın."); } };
    ta.addEventListener("input", paint); paint();
    body.querySelector("[data-kopya]").onclick = () => copy(s.url, "Bağlantı kopyalandı.");
  }

  // ---- geri bildirim (yanıtlar Google Forms'a gider)
  function feedbackCard(ctx, onBack) {
    const opened = Date.now();
    open(`<div class="eyebrow">Geri bildirim</div><h2 id="kart-baslik" class="kart-yer">${esc(ctx.head)}</h2>
      <div class="kart-hakkinda"><small>Hakkında</small><span>${esc(ctx.url)}</span></div>
      <form class="kart-form" novalidate>
        <div class="kart-konular" role="radiogroup" aria-label="Konu">${FB_TOPICS.map((t) => `<label><input type="radio" name="konu" value="${t}"${t === ctx.topic ? " checked" : ""}><span>${t}</span></label>`).join("")}</div>
        <label class="kart-etiket" for="kart-fb-mesaj">Mesajınız</label><textarea id="kart-fb-mesaj" class="kart-alan" rows="5" maxlength="4000"></textarea>
        <label class="kart-etiket" for="kart-fb-ad">Ad soyad <span>(isteğe bağlı)</span></label><input id="kart-fb-ad" class="kart-girdi" autocomplete="name" maxlength="120">
        <label class="kart-etiket" for="kart-fb-eposta">E-posta <span>(isteğe bağlı, yanıt almak isterseniz)</span></label><input id="kart-fb-eposta" class="kart-girdi" type="email" autocomplete="email" maxlength="200">
        <input class="kart-tuzak" name="web" tabindex="-1" autocomplete="off" aria-hidden="true">
        <div class="kart-gonder"><button type="submit" class="go">Gönder</button><p class="kart-durum" aria-live="polite"></p></div>
      </form>`, onBack);
    try { const k = JSON.parse(localStorage.getItem("fb-kim") || "{}"); body.querySelector("#kart-fb-ad").value = k.ad || ""; body.querySelector("#kart-fb-eposta").value = k.eposta || ""; } catch (e) {}
    const form = body.querySelector("form"), note = (m) => { body.querySelector(".kart-durum").textContent = m; };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = form.querySelector("#kart-fb-mesaj").value.trim(), ad = form.querySelector("#kart-fb-ad").value.trim(), mail = form.querySelector("#kart-fb-eposta").value.trim();
      if (msg.length < 3) { note("Lütfen mesajınızı yazın."); return; }
      if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) { note("E-posta adresi geçerli görünmüyor."); return; }
      const bot = form.querySelector(".kart-tuzak").value || Date.now() - opened < 2500;
      let lastSent = 0; try { lastSent = +localStorage.getItem("fb-last") || 0; } catch (e2) {}
      if (!bot && Date.now() - lastSent < 20000) { note("Az önce bir mesaj gönderdiniz; biraz bekleyip yeniden deneyin."); return; }
      if (navigator.onLine === false) { note("İnternet bağlantısı yok; bağlantı gelince yeniden deneyin."); return; }
      note("Gönderiliyor…");
      if (!bot) {
        const b = new URLSearchParams();
        b.set(FB.konu, (form.querySelector('input[name="konu"]:checked') || {}).value || "Genel görüş");
        b.set(FB.mesaj, msg); b.set(FB.kayit, `${ctx.head} — ${ctx.url}`);
        if (mail) b.set(FB.eposta, mail);
        if (ad) b.set(FB.ad, ad);
        try { await fetch(FB_FORM, { method: "POST", mode: "no-cors", body: b }); } catch (e3) { note("Gönderilemedi; bağlantınızı kontrol edip yeniden deneyin."); return; }
        try { localStorage.setItem("fb-last", String(Date.now())); localStorage.setItem("fb-kim", JSON.stringify({ ad, eposta: mail })); } catch (e4) {}
      }
      body.innerHTML = '<div class="kart-tamam"><div class="kart-yildiz">✦ ✦ ✦</div><h2 id="kart-baslik">Teşekkürler</h2><p>Mesajınız iletildi.</p></div>';
    });
  }

  // ---- tıklamalar
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const pl = e.target.closest("[data-place]");
    if (pl && !wrap.contains(pl)) { const d = placeData(pl.getAttribute("data-place")); if (d) { e.preventDefault(); placeCard(d, pl); } return; }
    const li = e.target.closest("li[data-i]");
    if (li && rows[+li.dataset.i]) personCard(rows[+li.dataset.i]);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const t = e.target;
    if (t.matches && t.matches("li[data-i], h3[data-place]")) { e.preventDefault(); t.click(); }
  });
  document.querySelectorAll("li[data-i]").forEach((li) => { li.tabIndex = 0; li.setAttribute("role", "button"); });
})();
