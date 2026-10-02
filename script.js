(function () {
  var root = document.documentElement;

  // Tema claro/escuro (preferência guardada só neste navegador)
  var btn = document.querySelector('.theme-toggle');
  function current() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function label() {
    if (!btn) return;
    var dark = current() === 'dark';
    btn.setAttribute('aria-label', dark ? 'Mudar para tema claro' : 'Mudar para tema escuro');
    btn.textContent = dark ? '☀' : '☾';
  }
  if (btn) {
    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('tema', next); } catch (e) {}
      label();
    });
    label();
  }

  // Barra de progresso de leitura e botão de voltar ao topo
  var bar = document.querySelector('.progress span');
  var top = document.querySelector('.to-top');
  var ticking = false;
  function onScroll() {
    var h = root.scrollHeight - root.clientHeight;
    var p = h > 0 ? root.scrollTop / h : 0;
    if (bar) bar.style.transform = 'scaleX(' + p + ')';
    if (top) top.classList.toggle('show', root.scrollTop > 700);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // Entrada suave dos blocos ao rolar
  var items = document.querySelectorAll('main h2, .card, .block, .table-wrap, .annex, .stat, .chain, .callout');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }

  // Índice lateral: destaca a seção visível
  var tocLinks = document.querySelectorAll('.side-toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          tocLinks.forEach(function (a) { a.classList.remove('active'); });
          var a = map[e.target.id]; if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  // Anexos: abrir pelo link do índice e abrir/fechar todos
  function openFromHash() {
    var id = location.hash.slice(1);
    var el = id && document.getElementById(id);
    var d = el && (el.tagName === 'DETAILS' ? el : el.querySelector('details'));
    if (d) d.open = true;
  }
  window.addEventListener('hashchange', openFromHash);
  openFromHash();
  var all = document.querySelector('.toggle-all');
  if (all) {
    all.addEventListener('click', function () {
      var ds = document.querySelectorAll('details.annex');
      var open = all.getAttribute('data-open') !== '1';
      ds.forEach(function (d) { d.open = open; });
      all.setAttribute('data-open', open ? '1' : '0');
      all.textContent = open ? 'Fechar todos' : 'Abrir todos';
    });
  }

  // Celular: rótulos nas células para as tabelas virarem cartões
  document.querySelectorAll('.table-wrap').forEach(function (w) {
    var t = w.querySelector('table');
    if (!t || !t.tHead || !t.tHead.rows.length) return;
    var heads = Array.prototype.map.call(t.tHead.rows[0].cells, function (c) { return c.textContent.trim(); });
    if (heads.length < 2) return;
    Array.prototype.forEach.call(t.tBodies, function (b) {
      Array.prototype.forEach.call(b.rows, function (r) {
        Array.prototype.forEach.call(r.cells, function (c, i) { if (heads[i]) c.setAttribute('data-label', heads[i]); });
      });
    });
    w.classList.add('stack');
  });

  // Celular: deixa a seção atual visível no menu que rola de lado
  var cur = document.querySelector('.nav a[aria-current="page"]');
  var nav = document.querySelector('.nav');
  if (cur && nav && nav.scrollWidth > nav.clientWidth) {
    nav.scrollLeft = cur.offsetLeft - (nav.clientWidth - cur.offsetWidth) / 2;
  }
  // Menu: a roda do mouse rola o menu para o lado quando ele não cabe
  if (nav) {
    nav.addEventListener('wheel', function (e) {
      if (nav.scrollWidth <= nav.clientWidth || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      nav.scrollLeft += e.deltaY;
      e.preventDefault();
    }, { passive: false });
  }
})();
