/* Technolite — shared behaviour for all pages.
   Every block is guarded, so the same file works on the home page
   (hero slideshow, brand rail) and on division pages that have neither. */
(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function(s){ return document.querySelector(s); };
  var $$ = function(s){ return [].slice.call(document.querySelectorAll(s)); };

  /* ---------- scroll progress ---------- */
  var bar = $("#progress");
  if (bar) {
    var onScroll = function(){
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- mobile nav ---------- */
  var burger = $("#burger"), mnav = $("#mobile-nav");
  if (burger && mnav) {
    burger.addEventListener("click", function(){
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      burger.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      mnav.classList.toggle("is-open", !open);
    });
    mnav.addEventListener("click", function(e){
      if (e.target.closest("a")) {
        mnav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- hero slideshow (home only) ---------- */
  var slides = $$(".slide"), bars = $$(".hero-bar"), idx = $("#hero-index"), hero = $(".hero");
  if (slides.length && bars.length) {
    var cur = 0, timer = null, DUR = 6000;
    var show = function(i){
      cur = (i + slides.length) % slides.length;
      slides.forEach(function(s, n){ s.classList.toggle("is-active", n === cur); });
      bars.forEach(function(b, n){
        b.classList.remove("is-active", "is-done");
        if (n < cur) b.classList.add("is-done");
      });
      var active = bars[cur];
      void active.offsetWidth;
      active.classList.add("is-active");
      if (idx) idx.textContent = String(cur + 1).padStart(2, "0");
    };
    var stop = function(){ if (timer) { clearInterval(timer); timer = null; } };
    var play = function(){ if (reduce) return; stop(); timer = setInterval(function(){ show(cur + 1); }, DUR); };
    bars.forEach(function(b){
      b.addEventListener("click", function(){ show(Number(b.dataset.go)); play(); });
    });
    if (hero) {
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", play);
    }
    document.addEventListener("visibilitychange", function(){ document.hidden ? stop() : play(); });
    show(0); play();
  }

  /* ---------- product finder ---------- */
  var items = $$(".p-item"), cats = $$(".cat"), chips = $$(".chip");
  var input = $("#product-search"), empty = $("#empty");
  if (items.length && cats.length) {
    items.forEach(function(it){
      var label = it.querySelector("p");
      it.dataset.name = (label ? label.textContent : "").toLowerCase();
    });
    var activeCat = "all";
    var apply = function(){
      var q = input ? input.value.trim().toLowerCase() : "";
      var total = 0;
      cats.forEach(function(cat){
        var catOk = activeCat === "all" || cat.dataset.cat === activeCat;
        var shown = 0;
        [].slice.call(cat.querySelectorAll(".p-item")).forEach(function(it){
          var ok = catOk && (!q || it.dataset.name.indexOf(q) !== -1);
          it.style.display = ok ? "" : "none";
          if (ok) shown++;
        });
        cat.style.display = shown ? "" : "none";
        var c = cat.querySelector(".count");
        if (c) c.textContent = shown + (shown === 1 ? " item" : " items");
        total += shown;
      });
      if (empty) empty.classList.toggle("is-on", total === 0);
    };
    chips.forEach(function(ch){
      ch.addEventListener("click", function(){
        chips.forEach(function(c){ c.classList.remove("is-active"); });
        ch.classList.add("is-active");
        activeCat = ch.dataset.cat;
        apply();
      });
    });
    if (input) input.addEventListener("input", apply);
    apply();
  }

  /* ---------- reveal on scroll ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    $$(".rv").forEach(function(el){ io.observe(el); });
  } else {
    $$(".rv").forEach(function(el){ el.classList.add("in"); });
  }

  /* ---------- logo rails: duplicate each track for a seamless loop ---------- */
  $$(".rail-track").forEach(function(track){
    if (!track.dataset.looped) {
      track.innerHTML += track.innerHTML;
      track.dataset.looped = "1";
    }
  });

  /* ---------- quote form ---------- */
  var form = $("#contact-form"), status = $("#form-status");
  if (form) {
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var btn = form.querySelector("button[type=submit]");
      if (status) { status.className = ""; status.textContent = "Sending your request…"; }
      btn.disabled = true;
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function(r){
          if (!status) return;
          if (r.ok) {
            status.className = "ok";
            status.textContent = "Request sent. We'll reply from taher@technolite.me.";
            form.reset();
          } else {
            status.className = "err";
            status.textContent = "That didn't send. WhatsApp us on +971 52 514 5572 instead.";
          }
        })
        .catch(function(){
          if (!status) return;
          status.className = "err";
          status.textContent = "No connection. WhatsApp us on +971 52 514 5572 instead.";
        })
        .finally(function(){ btn.disabled = false; });
    });
  }

  /* ---------- current section in nav ---------- */
  var links = $$(".nav a.navlink[href^='#']");
  if (links.length) {
    var targets = links.map(function(a){ return document.querySelector(a.getAttribute("href")); });
    window.addEventListener("scroll", function(){
      var y = window.scrollY + 140, best = -1, top = -1;
      targets.forEach(function(t, i){
        if (t && t.offsetTop <= y && t.offsetTop > top) { top = t.offsetTop; best = i; }
      });
      links.forEach(function(a, i){ a.classList.toggle("is-current", i === best); });
    }, { passive: true });
  }

  var yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
