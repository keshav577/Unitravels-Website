/* ============================================================
   UniTravels – dynamic train search (Indian Railways style)
   Real station codes, classes, fares, running days
   ============================================================ */
(function () {
    'use strict';

    var DATA = window.UniTravelsData;
    var UT = window.UniTravels;

    var fromEl = document.getElementById('location');
    var toEl = document.getElementById('destination');
    var dateEl = document.getElementById('date');
    var msgEl = document.getElementById('loginMessage');
    var resultsArea = document.getElementById('tavail');
    var webCard = document.getElementById('web');

    var allTrains = [];
    var routeMeta = null;
    var sortBy = 'departure';
    var typeFilter = 'all';
    var runningOnly = true;

    /* ---------- city datalist ---------- */
    function fillCityList() {
        var dl = document.getElementById('cityList');
        if (!dl) return;
        dl.innerHTML = '';
        DATA.getCities().forEach(function (c) {
            var o = document.createElement('option');
            o.value = c.name;
            o.textContent = c.name + ' — ' + c.state;
            dl.appendChild(o);
        });
    }

    /* ---------- popular train routes ---------- */
    var POPULAR = [
        ['Delhi', 'Mumbai'], ['Delhi', 'Kolkata'], ['Delhi', 'Lucknow'],
        ['Delhi', 'Agra'], ['Delhi', 'Katra'], ['Delhi', 'Pune'],
        ['Mumbai', 'Ahmedabad'], ['Chennai', 'Bengaluru'], ['Kolkata', 'Patna'],
        ['Hyderabad', 'Visakhapatnam'], ['Jaipur', 'Delhi'], ['Indore', 'Ratlam']
    ];
    function fillPopular() {
        var box = document.getElementById('popularRoutes');
        if (!box) return;
        box.innerHTML = '<span class="popularLabel">🔥 Popular:</span>';
        POPULAR.forEach(function (r) {
            var chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'routeChip';
            chip.textContent = r[0] + ' → ' + r[1];
            chip.addEventListener('click', function () {
                fromEl.value = r[0];
                toEl.value = r[1];
                search();
            });
            box.appendChild(chip);
        });
    }

    var swapBtn = document.getElementById('swapBtn');
    if (swapBtn) {
        swapBtn.addEventListener('click', function () {
            var t = fromEl.value;
            fromEl.value = toEl.value;
            toEl.value = t;
        });
    }

    /* ---------- helpers ---------- */
    function selectedDayIndex() {
        if (!dateEl.value) return -1;
        var d = new Date(dateEl.value + 'T00:00:00');
        return d.getDay(); /* JS: 0 = Sunday, matches DATA.DAY_NAMES order */
    }

    function lowestFare(tr) {
        var min = Infinity;
        tr.classes.forEach(function (c) { if (c.fare < min) min = c.fare; });
        return min;
    }

    /* ---------- search ---------- */
    function search() {
        msgEl.textContent = '';
        var from = DATA.findCity(fromEl.value);
        var to = DATA.findCity(toEl.value);

        if (!fromEl.value.trim() || !toEl.value.trim()) { msgEl.textContent = 'Please select both cities'; return; }
        if (!from || !to) { msgEl.textContent = 'Sorry, we could not find that city in our network'; return; }
        if (!dateEl.value) { msgEl.textContent = 'Please select a travel date'; return; }
        if (from.name.toLowerCase() === to.name.toLowerCase()) { msgEl.textContent = 'Origin and destination cannot be the same'; return; }

        var res = DATA.getTrainsForRoute(from.name, to.name);

        if (res.noRail) {
            msgEl.textContent = '🚫 ' + res.noRail + ' has no railway service. Try our Bus or Car options for this city.';
            return;
        }
        if (res.error || res.empty || !res.trains || !res.trains.length) {
            msgEl.textContent = '😕 No direct trains run on this route. Try the Bus section for this journey.';
            return;
        }

        allTrains = res.trains;
        routeMeta = { from: from, to: to, date: dateEl.value };

        webCard.style.display = 'none';
        resultsArea.style.display = 'block';
        render();
        if (typeof resultsArea.scrollIntoView === 'function') {
            resultsArea.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollTo(0, resultsArea.offsetTop);
        }
    }
    window.trainSearch = search;

    /* ---------- render ---------- */
    function render() {
        resultsArea.innerHTML = '';
        var st1 = DATA.RAIL[routeMeta.from.name], st2 = DATA.RAIL[routeMeta.to.name];

        var bar = document.createElement('div');
        bar.className = 'resultsBar';
        bar.innerHTML =
            '<h3>🚆 ' + routeMeta.from.name + ' (' + st1.code + ') → ' +
            routeMeta.to.name + ' (' + st2.code + ') &nbsp;•&nbsp; ' + UT.niceDate(routeMeta.date) + '</h3>' +
            '<p>' + allTrains.length + ' trains • approx ' + allTrains[0].distanceKm + ' km by rail</p>' +
            '<button id="modifySearchBtn">🔁 Modify Search</button>';
        resultsArea.appendChild(bar);
        document.getElementById('modifySearchBtn').addEventListener('click', modifySearch);

        /* controls */
        var controls = document.createElement('div');
        controls.className = 'sortBar';
        controls.innerHTML =
            '<label class="sortLabel" for="sortSel">Sort by</label>' +
            '<select id="sortSel">' +
            '<option value="departure">Departure time</option>' +
            '<option value="duration">Duration</option>' +
            '<option value="fare">Fare (lowest)</option>' +
            '<option value="number">Train number</option>' +
            '</select>' +
            '<span class="filterChips">' +
            '<label class="chipToggle"><input type="checkbox" id="fltRunning" checked> Only trains running on my date</label>' +
            '</span>' +
            '<span class="filterChips" id="typeChips">' +
            '<button type="button" class="routeChip typeChip active" data-type="all">All</button>' +
            '<button type="button" class="routeChip typeChip" data-type="vb">Vande Bharat</button>' +
            '<button type="button" class="routeChip typeChip" data-type="raj">Rajdhani</button>' +
            '<button type="button" class="routeChip typeChip" data-type="shat">Shatabdi</button>' +
            '<button type="button" class="routeChip typeChip" data-type="dur">Duronto</button>' +
            '<button type="button" class="routeChip typeChip" data-type="gr">Garib Rath</button>' +
            '<button type="button" class="routeChip typeChip" data-type="sf">Superfast</button>' +
            '<button type="button" class="routeChip typeChip" data-type="exp">Express</button>' +
            '</span>';
        resultsArea.appendChild(controls);

        document.getElementById('sortSel').addEventListener('change', function () {
            sortBy = this.value;
            renderCards();
        });
        document.getElementById('fltRunning').addEventListener('change', function () {
            runningOnly = this.checked;
            renderCards();
        });
        Array.prototype.forEach.call(controls.querySelectorAll('.typeChip'), function (chip) {
            chip.addEventListener('click', function () {
                typeFilter = chip.dataset.type;
                Array.prototype.forEach.call(controls.querySelectorAll('.typeChip'), function (c) {
                    c.classList.toggle('active', c === chip);
                });
                renderCards();
            });
        });

        var listWrap = document.createElement('div');
        listWrap.id = 'trainList';
        resultsArea.appendChild(listWrap);
        renderCards();
    }

    function sortTrains(list) {
        var s = list.slice();
        if (sortBy === 'departure') s.sort(function (a, b) { return a.departureMin - b.departureMin; });
        if (sortBy === 'duration') s.sort(function (a, b) { return a.durationMin - b.durationMin; });
        if (sortBy === 'fare') s.sort(function (a, b) { return lowestFare(a) - lowestFare(b); });
        if (sortBy === 'number') s.sort(function (a, b) { return a.number.localeCompare(b.number); });
        return s;
    }

    function renderCards() {
        var listWrap = document.getElementById('trainList');
        if (!listWrap) return;
        listWrap.innerHTML = '';

        var dayIdx = selectedDayIndex();
        var trains = sortTrains(allTrains.filter(function (tr) {
            if (typeFilter !== 'all' && tr.tag !== typeFilter) return false;
            if (runningOnly && dayIdx >= 0 && !tr.runDays[dayIdx]) return false;
            return true;
        }));

        if (!trains.length) {
            listWrap.innerHTML = '<div class="emptyMsg">😕 No trains match these filters for the selected date. Try clearing filters.</div>';
            return;
        }

        trains.forEach(function (tr) {
            var runsToday = dayIdx < 0 || tr.runDays[dayIdx];
            var card = document.createElement('div');
            card.className = 'busCard trainCard' + (runsToday ? '' : ' noRun');

            var classChips = tr.classes.map(function (c) {
                var availCls = c.avail.status === 'AVL' ? 'avl' : (c.avail.status === 'RAC' ? 'rac' : 'wl');
                var availTxt = c.avail.status === 'AVL'
                    ? 'AVL ' + c.avail.count
                    : (c.avail.status === 'RAC' ? 'RAC ' + c.avail.count : 'WL ' + c.avail.count);
                return '<button type="button" class="clsChip" data-code="' + c.code + '" ' +
                    (runsToday ? '' : 'disabled') + '>' +
                    '<span class="clsCode">' + c.code + '</span>' +
                    '<span class="clsFare">₹ ' + c.fare.toLocaleString('en-IN') + '</span>' +
                    '<span class="clsAvail ' + availCls + '">' + availTxt + '</span>' +
                    '</button>';
            }).join('');

            card.innerHTML =
                '<div class="busLeft">' +
                    '<div class="trainHead"><span class="trainNum">#' + tr.number + '</span>' +
                    '<span class="trainType tag-' + tr.tag + '">' + tr.typeName + '</span></div>' +
                    '<div class="opName">' + tr.name + '</div>' +
                    '<div class="dayRow">📅 ' + tr.runDaysLabel + '</div>' +
                    (runsToday ? '' : '<div class="noRunNote">⚠️ Does not run on the selected date</div>') +
                '</div>' +
                '<div class="busMid">' +
                    '<div class="timeBlock"><div class="time">' + tr.departure + '</div>' +
                    '<div class="point"><b>' + tr.fromCode + '</b> ' + tr.fromStation + '</div></div>' +
                    '<div class="durLine"><span class="dur">' + tr.duration + '</span><span class="line"></span><span class="arrow">➤</span></div>' +
                    '<div class="timeBlock"><div class="time">' + tr.arrival + '</div>' +
                    '<div class="point"><b>' + tr.toCode + '</b> ' + tr.toStation + '</div></div>' +
                '</div>' +
                '<div class="busRight trainRight">' +
                    '<div class="fare">₹ ' + lowestFare(tr).toLocaleString('en-IN') + '</div>' +
                    '<div class="fareNote">onwards</div>' +
                    '<div class="classChips">' + classChips + '</div>' +
                    '<div class="clsHint">Tap a class to book</div>' +
                '</div>';

            Array.prototype.forEach.call(card.querySelectorAll('.clsChip'), function (chip) {
                chip.addEventListener('click', function () {
                    if (chip.disabled) return;
                    var code = chip.dataset.code;
                    var cls = null;
                    for (var i = 0; i < tr.classes.length; i++) {
                        if (tr.classes[i].code === code) cls = tr.classes[i];
                    }
                    bookTrain(tr, cls);
                });
            });
            listWrap.appendChild(card);
        });
    }

    function bookTrain(tr, cls) {
        UT.openBookingDirect({
            mode: 'Train',
            from: routeMeta.from.name,
            to: routeMeta.to.name,
            date: routeMeta.date,
            operator: tr.number + ' ' + tr.name + ' {' + cls.code + '}',
            fare: cls.fare,
            departure: tr.departure + ' {' + tr.fromCode + ' ' + tr.fromStation + '}',
            details: [
                ['Train', '#' + tr.number + ' ' + tr.name],
                ['Type', tr.typeName],
                ['Class', cls.label],
                ['Departure', tr.departure + ' • ' + tr.fromCode + ', ' + tr.fromStation],
                ['Arrival', tr.arrival + ' • ' + tr.toCode + ', ' + tr.toStation],
                ['Duration', tr.duration + ' (' + tr.distanceKm + ' km)'],
                ['Running', tr.runDaysLabel],
                ['Fare', '₹ ' + cls.fare.toLocaleString('en-IN') + ' per passenger']
            ]
        });
    }

    function modifySearch() {
        resultsArea.style.display = 'none';
        resultsArea.innerHTML = '';
        webCard.style.display = 'block';
        if (typeof webCard.scrollIntoView === 'function') {
            webCard.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollTo(0, webCard.offsetTop);
        }
    }

    /* ---------- boot ---------- */
    fillCityList();
    fillPopular();

    /* robust search binding (does not depend on inline onclick) */
    var searchBtn = document.getElementById('trainSearchBtn') || document.querySelector('.Search button');
    if (searchBtn) {
        searchBtn.addEventListener('click', function (e) {
            e.preventDefault();
            search();
        });
    }
    [fromEl, toEl, dateEl].forEach(function (el) {
        if (!el) return;
        el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); search(); }
        });
    });
})();
