/* ============================================================
   UniTravels – dynamic intercity car / cab search
   All-India cities • per-km fares • one-way / round trip
   ============================================================ */
(function () {
    'use strict';

    var DATA = window.UniTravelsData;
    var UT = window.UniTravels;

    var fromEl = document.getElementById('location');
    var toEl = document.getElementById('destination');
    var dateEl = document.getElementById('date');
    var msgEl = document.getElementById('loginMessage');
    var resultsArea = document.getElementById('cavail');
    var webCard = document.getElementById('web');

    var allCars = [];
    var routeMeta = null;
    var sortBy = 'fare';
    var roundTrip = false;
    var ROUND_FACTOR = 1.9; /* round trip = ~2x with 5% discount */

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

    /* ---------- popular cab routes ---------- */
    var POPULAR = [
        ['Indore', 'Ratlam'], ['Indore', 'Ujjain'], ['Delhi', 'Jaipur'],
        ['Delhi', 'Agra'], ['Mumbai', 'Pune'], ['Mumbai', 'Nashik'],
        ['Bengaluru', 'Mysuru'], ['Bengaluru', 'Goa'], ['Chennai', 'Pondicherry'],
        ['Hyderabad', 'Tirupati'], ['Jaipur', 'Udaipur'], ['Kolkata', 'Durgapur']
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

    /* trip type radios */
    var tripOne = document.getElementById('tripOne');
    var tripRound = document.getElementById('tripRound');
    function bindTripRadios() {
        if (tripOne) tripOne.addEventListener('change', function () { roundTrip = false; renderCards(); });
        if (tripRound) tripRound.addEventListener('change', function () { roundTrip = true; renderCards(); });
    }

    function fareFor(car) {
        return roundTrip ? Math.round(car.fare * ROUND_FACTOR / 10) * 10 : car.fare;
    }

    /* ---------- search ---------- */
    function search() {
        msgEl.textContent = '';
        var from = DATA.findCity(fromEl.value);
        var to = DATA.findCity(toEl.value);

        if (!fromEl.value.trim() || !toEl.value.trim()) { msgEl.textContent = 'Please select both cities'; return; }
        if (!from || !to) { msgEl.textContent = 'Sorry, we could not find that city in our network'; return; }
        if (!dateEl.value) { msgEl.textContent = 'Please select a pickup date'; return; }
        if (from.name.toLowerCase() === to.name.toLowerCase()) { msgEl.textContent = 'Pickup and drop cannot be the same'; return; }

        var res = DATA.getCarsForRoute(from.name, to.name);
        if (!res || !res.cars || !res.cars.length) {
            msgEl.textContent = '😕 No cars available on this route right now.';
            return;
        }

        allCars = res.cars;
        routeMeta = { from: from, to: to, date: dateEl.value, roadKm: res.roadKm };

        webCard.style.display = 'none';
        resultsArea.style.display = 'block';
        render();
        if (typeof resultsArea.scrollIntoView === 'function') {
            resultsArea.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollTo(0, resultsArea.offsetTop);
        }
    }
    window.carSearch = search;

    /* ---------- render ---------- */
    function render() {
        resultsArea.innerHTML = '';

        var bar = document.createElement('div');
        bar.className = 'resultsBar';
        bar.innerHTML =
            '<h3>🚗 ' + routeMeta.from.name + ' → ' + routeMeta.to.name +
            ' &nbsp;•&nbsp; ' + UT.niceDate(routeMeta.date) + '</h3>' +
            '<p>~' + routeMeta.roadKm + ' km by road • ' + allCars.length + ' car options</p>' +
            '<button id="modifySearchBtn">🔁 Modify Search</button>';
        resultsArea.appendChild(bar);
        document.getElementById('modifySearchBtn').addEventListener('click', modifySearch);

        var controls = document.createElement('div');
        controls.className = 'sortBar';
        controls.innerHTML =
            '<label class="sortLabel" for="sortSel">Sort by</label>' +
            '<select id="sortSel">' +
            '<option value="fare">Fare: low to high</option>' +
            '<option value="fareDesc">Fare: high to low</option>' +
            '<option value="seats">Seats: high to low</option>' +
            '<option value="perKm">Rate per km</option>' +
            '</select>' +
            '<span class="filterChips"><span class="tripNote">' +
            (roundTrip ? '↺ Round trip fares (5% off return)' : '→ One-way fares') +
            '</span></span>';
        resultsArea.appendChild(controls);
        document.getElementById('sortSel').value = sortBy;
        document.getElementById('sortSel').addEventListener('change', function () {
            sortBy = this.value;
            renderCards();
        });

        var listWrap = document.createElement('div');
        listWrap.id = 'carList';
        resultsArea.appendChild(listWrap);
        renderCards();
    }

    function sortCars(list) {
        var s = list.slice();
        if (sortBy === 'fare') s.sort(function (a, b) { return fareFor(a) - fareFor(b); });
        if (sortBy === 'fareDesc') s.sort(function (a, b) { return fareFor(b) - fareFor(a); });
        if (sortBy === 'seats') s.sort(function (a, b) { return b.seats - a.seats; });
        if (sortBy === 'perKm') s.sort(function (a, b) { return a.perKm - b.perKm; });
        return s;
    }

    function renderCards() {
        var listWrap = document.getElementById('carList');
        if (!listWrap) return;
        listWrap.innerHTML = '';

        var cars = sortCars(allCars);
        if (!cars.length) {
            listWrap.innerHTML = '<div class="emptyMsg">😕 No cars match these options.</div>';
            return;
        }

        cars.forEach(function (c) {
            var card = document.createElement('div');
            card.className = 'busCard carCard';

            var fuelChips = c.fuel.map(function (f) {
                return '<span class="amenity">' + (f === 'CNG' ? '🟢' : f === 'Diesel' ? '⛽' : '🔶') + ' ' + f + '</span>';
            }).join('');

            var fare = fareFor(c);
            card.innerHTML =
                '<div class="busLeft">' +
                    '<div class="opName">' + c.model + '</div>' +
                    '<div class="busType">' + c.cat + '</div>' +
                    '<div class="metaRow"><span class="seatsChip">👥 ' + c.seats + ' seats</span></div>' +
                    '<div class="amenityRow">' + fuelChips +
                        '<span class="amenity">🧑‍✈️ Driver included</span>' +
                        '<span class="amenity">🧳 Luggage space</span>' +
                    '</div>' +
                '</div>' +
                '<div class="busMid">' +
                    '<div class="timeBlock"><div class="time">🛣️ ' + c.distanceKm + ' km</div><div class="point">by road</div></div>' +
                    '<div class="durLine"><span class="dur">' + c.duration + '</span><span class="line"></span><span class="arrow">➤</span></div>' +
                    '<div class="timeBlock"><div class="time">₹ ' + c.perKm + '/km</div><div class="point">' + (roundTrip ? 'round trip' : 'one way') + '</div></div>' +
                '</div>' +
                '<div class="busRight">' +
                    '<div class="fare">₹ ' + fare.toLocaleString('en-IN') + '</div>' +
                    '<div class="fareNote">' + (roundTrip ? 'round trip total' : 'one-way total') + '</div>' +
                    '<button class="bookBtn">Book</button>' +
                '</div>';

            card.querySelector('.bookBtn').addEventListener('click', function () { bookCar(c, fare); });
            listWrap.appendChild(card);
        });
    }

    function bookCar(c, fare) {
        UT.openBookingDirect({
            mode: 'Car',
            from: routeMeta.from.name,
            to: routeMeta.to.name,
            date: routeMeta.date,
            operator: c.model + ' {' + c.cat + '}',
            fare: fare,
            departure: 'Door-to-door pickup',
            details: [
                ['Car', c.model],
                ['Category', c.cat + ' • ' + c.seats + ' seats'],
                ['Fuel Options', c.fuel.join(' / ')],
                ['Distance', c.distanceKm + ' km by road'],
                ['Est. Duration', c.duration],
                ['Rate', '₹ ' + c.perKm + ' per km'],
                ['Trip Type', roundTrip ? 'Round trip (return included)' : 'One way'],
                ['Fare', '₹ ' + fare.toLocaleString('en-IN') + ' total']
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
    bindTripRadios();

    /* robust search binding (does not depend on inline onclick) */
    var searchBtn = document.getElementById('carSearchBtn') || document.querySelector('.Search button');
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
