/* ============================================================
   UniTravels — Idea of Place (destination guide), data-driven
   ============================================================ */
(function () {
    'use strict';
    var DATA = window.UniTravelsData;
    var UT = window.UniTravels;

    var fromEl = document.getElementById('location');
    var toEl = document.getElementById('destination');
    var msgEl = document.getElementById('loginMessage');
    var area = document.getElementById('Iavail');
    var webCard = document.getElementById('web');

    /* ---------- city datalist ---------- */
    function fillCityList() {
        var dl = document.getElementById('cityList');
        if (!dl) return;
        dl.innerHTML = '';
        DATA.getCities().forEach(function (c) {
            var o = document.createElement('option');
            o.value = c.name;
            var st = DATA.RAIL[c.name];
            o.textContent = c.name + ' — ' + c.state + (st ? ' • ' + st.code : '');
            dl.appendChild(o);
            if (st) {
                var oc = document.createElement('option');
                oc.value = st.code;
                oc.textContent = st.code + ' — ' + st.name + ' (' + c.name + ')';
                dl.appendChild(oc);
            }
        });
    }

    /* ---------- popular guide chips ---------- */
    function fillPopular() {
        var box = document.getElementById('popularRoutes');
        if (!box) return;
        box.innerHTML = '<span class="popularLabel">🔥 Popular guides:</span>';
        DATA.guideCities().forEach(function (city) {
            var chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'routeChip';
            chip.textContent = city;
            chip.addEventListener('click', function () {
                toEl.value = city;
                search();
            });
            box.appendChild(chip);
        });
    }

    /* ---------- search + render ---------- */
    function search() {
        msgEl.textContent = '';
        var to = DATA.findCity(toEl.value);

        if (!toEl.value.trim()) { msgEl.textContent = 'Please select a destination city'; return; }
        if (!to) { msgEl.textContent = 'City ya station code sahi likhein — e.g. Jaipur / JP, Kolkata / HWH'; return; }

        var guide = DATA.getGuide(to.name);
        if (!guide) {
            msgEl.textContent = '😕 ' + to.name + ' ka curated guide jald aa raha hai. Abhi in guides ko try karo: ' +
                DATA.guideCities().slice(0, 8).join(', ') + '…';
            return;
        }

        var from = fromEl.value.trim() ? DATA.findCity(fromEl.value) : null;
        webCard.style.display = 'none';
        area.style.display = 'block';
        render(from, to, guide);
        if (typeof area.scrollIntoView === 'function') area.scrollIntoView({ behavior: 'smooth' });
    }
    window.search = search;

    function card(icon, cls, title, items, city, linkMode) {
        var lis = items.map(function (x) {
            if (city && linkMode) {
                var q, href, ic;
                if (linkMode === 'img') {
                    q = encodeURIComponent(x + ' ' + city + ' India');
                    href = 'https://www.google.com/search?tbm=isch&q=' + q;
                    ic = '📷';
                } else {
                    q = encodeURIComponent(x + ' ' + city + ' ' + linkMode);
                    href = 'https://www.google.com/search?q=' + q;
                    ic = '🔗';
                }
                return '<li><a class="placeLink" target="_blank" rel="noopener" ' +
                    'href="' + href + '" title="' + x + ' — photos & info">' +
                    x + ' <span class="cam">' + ic + '</span></a></li>';
            }
            return '<li>' + x + '</li>';
        }).join('');
        return '<div class="guideCard ' + cls + '">' +
            '<div class="guideHead"><span class="guideIcon">' + icon + '</span>' +
            '<span class="guideTitle">' + title + '</span></div>' +
            '<ul>' + lis + '</ul>' +
            '</div>';
    }

    function render(from, to, g) {
        area.innerHTML = '';

        var bar = document.createElement('div');
        bar.className = 'resultsBar';
        bar.innerHTML =
            '<div><h3>🗺️ ' + to.name + ' Travel Guide</h3>' +
            '<p>' + (from ? '🧭 ' + from.name + ' → ' + to.name + ' trip ke liye ' : '') +
            'curated real picks — hotels, sights, restaurants &amp; local food</p></div>' +
            '<button type="button" id="newGuideBtn">↺ New search</button>';
        area.appendChild(bar);
        bar.querySelector('#newGuideBtn').addEventListener('click', function () {
            area.style.display = 'none';
            webCard.style.display = 'flex';
            toEl.value = '';
            toEl.focus();
        });

        var grid = document.createElement('div');
        grid.className = 'guideGrid';
        grid.innerHTML =
            card('🏨', 'g-hotels', 'Best Hotels in ' + to.name, g.hotels, to.name, 'hotel') +
            card('📍', 'g-places', 'Best Places in ' + to.name, g.places, to.name, 'img') +
            card('🍽️', 'g-resto', 'Best Restaurants in ' + to.name, g.restaurants, to.name, 'restaurant') +
            card('🍛', 'g-food', 'Must-Try Food of ' + to.name, g.food, to.name, 'img');
        area.appendChild(grid);
    }

    /* ---------- boot ---------- */
    fillCityList();
    fillPopular();
    var btn = document.getElementById('ideaSearchBtn');
    if (btn) btn.addEventListener('click', search);
    [fromEl, toEl].forEach(function (el) {
        if (!el) return;
        el.addEventListener('keydown', function (e) { if (e.key === 'Enter') search(); });
    });
    var swapBtn = document.getElementById('swapBtn');
    if (swapBtn) swapBtn.addEventListener('click', function () {
        var t = fromEl.value; fromEl.value = toEl.value; toEl.value = t;
    });
})();
