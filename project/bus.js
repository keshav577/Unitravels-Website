/* ============================================================
   UniTravels – dynamic bus search (RedBus-style)
   All-India cities • real-style operators • sort & filter
   ============================================================ */
(function () {
    'use strict';

    var DATA = window.UniTravelsData;
    var UT = window.UniTravels;

    var fromEl = document.getElementById('location');
    var toEl = document.getElementById('destination');
    var dateEl = document.getElementById('date');
    var msgEl = document.getElementById('loginMessage');
    var resultsArea = document.getElementById('bavail');
    var webCard = document.getElementById('web');

    var allBuses = [];
    var routeMeta = null;
    var sortBy = 'departure';

    /* ---------- fill the city datalist ---------- */
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

    /* ---------- popular routes chips ---------- */
    var POPULAR = [
        ['Delhi', 'Jaipur'], ['Mumbai', 'Pune'], ['Delhi', 'Manali'],
        ['Bengaluru', 'Goa'], ['Mumbai', 'Goa'], ['Delhi', 'Indore'],
        ['Indore', 'Ratlam'], ['Chennai', 'Bengaluru'], ['Hyderabad', 'Bengaluru'],
        ['Delhi', 'Mumbai'], ['Kolkata', 'Siliguri'], ['Lucknow', 'Delhi']
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

    /* ---------- swap ---------- */
    var swapBtn = document.getElementById('swapBtn');
    if (swapBtn) {
        swapBtn.addEventListener('click', function () {
            var t = fromEl.value;
            fromEl.value = toEl.value;
            toEl.value = t;
        });
    }

    /* ---------- search ---------- */
    function search() {
        msgEl.textContent = '';
        var from = DATA.findCity(fromEl.value);
        var to = DATA.findCity(toEl.value);

        if (!fromEl.value.trim() || !toEl.value.trim()) {
            msgEl.textContent = 'Please select both cities';
            return;
        }
        if (!from || !to) {
            msgEl.textContent = 'Sorry, we could not find that city in our network';
            return;
        }
        if (!dateEl.value) {
            msgEl.textContent = 'Please select a travel date';
            return;
        }
        if (from.name.toLowerCase() === to.name.toLowerCase()) {
            msgEl.textContent = 'Origin and destination cannot be the same';
            return;
        }

        allBuses = DATA.getBusesForRoute(from.name, to.name) || [];
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
    window.busSearch = search;

    /* ---------- filtering + sorting ---------- */
    function activeFilters() {
        var acOn = document.getElementById('fltAC').checked;
        var nacOn = document.getElementById('fltNAC').checked;
        var slOn = document.getElementById('fltSleeper').checked;
        var seOn = document.getElementById('fltSeater').checked;
        return { acOn: acOn, nacOn: nacOn, slOn: slOn, seOn: seOn };
    }

    function passesFilters(b, f) {
        var acOk = (!f.acOn && !f.nacOn) || (f.acOn && b.ac) || (f.nacOn && !b.ac);
        var clsOk = (!f.slOn && !f.seOn) || (f.slOn && b.cls === 'sleeper') || (f.seOn && b.cls === 'seater');
        return acOk && clsOk;
    }

    function sortBuses(list) {
        var sorted = list.slice();
        if (sortBy === 'departure') sorted.sort(function (a, b) { return a.departureMin - b.departureMin; });
        if (sortBy === 'price') sorted.sort(function (a, b) { return a.fare - b.fare; });
        if (sortBy === 'priceDesc') sorted.sort(function (a, b) { return b.fare - a.fare; });
        if (sortBy === 'rating') sorted.sort(function (a, b) { return b.rating - a.rating; });
        if (sortBy === 'duration') sorted.sort(function (a, b) { return a.durationMin - b.durationMin; });
        return sorted;
    }

    /* ---------- render ---------- */
    function render() {
        resultsArea.innerHTML = '';

        /* toolbar */
        var bar = document.createElement('div');
        bar.className = 'resultsBar';
        bar.innerHTML =
            '<h3>🚌 ' + routeMeta.from.name + ' → ' + routeMeta.to.name +
            ' &nbsp;•&nbsp; ' + UT.niceDate(routeMeta.date) + '</h3>' +
            '<p>' + allBuses.length + ' buses found • approx ' +
            (allBuses[0] && allBuses[0].distanceKm ? allBuses[0].distanceKm + ' km' : '') + '</p>' +
            '<button id="modifySearchBtn">🔁 Modify Search</button>';
        resultsArea.appendChild(bar);
        document.getElementById('modifySearchBtn').addEventListener('click', modifySearch);

        /* sort + filter bar */
        var controls = document.createElement('div');
        controls.className = 'sortBar';
        controls.innerHTML =
            '<label class="sortLabel" for="sortSel">Sort by</label>' +
            '<select id="sortSel">' +
            '<option value="departure">Departure time</option>' +
            '<option value="price">Price: low to high</option>' +
            '<option value="priceDesc">Price: high to low</option>' +
            '<option value="rating">Rating</option>' +
            '<option value="duration">Duration</option>' +
            '</select>' +
            '<span class="filterChips">' +
            '<label class="chipToggle"><input type="checkbox" id="fltAC"> AC</label>' +
            '<label class="chipToggle"><input type="checkbox" id="fltNAC"> Non-AC</label>' +
            '<label class="chipToggle"><input type="checkbox" id="fltSleeper"> Sleeper</label>' +
            '<label class="chipToggle"><input type="checkbox" id="fltSeater"> Seater</label>' +
            '</span>';
        resultsArea.appendChild(controls);

        document.getElementById('sortSel').value = sortBy;
        document.getElementById('sortSel').addEventListener('change', function () {
            sortBy = this.value;
            renderCards();
        });
        ['fltAC', 'fltNAC', 'fltSleeper', 'fltSeater'].forEach(function (id) {
            document.getElementById(id).addEventListener('change', renderCards);
        });

        var listWrap = document.createElement('div');
        listWrap.id = 'busList';
        resultsArea.appendChild(listWrap);

        renderCards();
    }

    function renderCards() {
        var listWrap = document.getElementById('busList');
        if (!listWrap) return;
        listWrap.innerHTML = '';

        var f = activeFilters();
        var buses = sortBuses(allBuses.filter(function (b) { return passesFilters(b, f); }));

        if (!buses.length) {
            listWrap.innerHTML = '<div class="emptyMsg">😕 No buses match these filters. Try clearing a filter.</div>';
            return;
        }

        buses.forEach(function (b) {
            var card = document.createElement('div');
            card.className = 'busCard';
            if (b.custom) card.classList.add('customBus');

            var ratingClass = b.rating >= 4.2 ? 'good' : (b.rating >= 3.8 ? 'ok' : 'low');
            var seatsChip = b.seatsLeft <= 8
                ? '<span class="seatsChip hot">Only ' + b.seatsLeft + ' seats left!</span>'
                : '<span class="seatsChip">' + b.seatsLeft + ' seats left</span>';

            var amenities = b.amenities.map(function (a) {
                return '<span class="amenity">' + a + '</span>';
            }).join('');

            card.innerHTML =
                '<div class="busLeft">' +
                    '<div class="opName">' + b.name + (b.custom ? ' <span class="newTag">NEW</span>' : '') + '</div>' +
                    '<div class="busType">' + b.type + ' (' + b.layout + ')</div>' +
                    '<div class="metaRow"><span class="ratingChip ' + ratingClass + '">★ ' + b.rating.toFixed(1) + '</span>' +
                    (b.reviews ? '<span class="reviews">' + b.reviews.toLocaleString('en-IN') + ' reviews</span>' : '') +
                    seatsChip + '</div>' +
                    '<div class="amenityRow">' + amenities + '</div>' +
                '</div>' +
                '<div class="busMid">' +
                    '<div class="timeBlock"><div class="time">' + b.departure + '</div><div class="point">' + b.boarding + '</div></div>' +
                    '<div class="durLine"><span class="dur">' + b.duration + '</span><span class="line"></span><span class="arrow">➤</span></div>' +
                    '<div class="timeBlock"><div class="time">' + b.arrival + '</div><div class="point">' + b.drop + '</div></div>' +
                '</div>' +
                '<div class="busRight">' +
                    '<div class="fare">₹ ' + b.fare.toLocaleString('en-IN') + '</div>' +
                    '<div class="fareNote">per seat</div>' +
                    '<button class="bookBtn">Book</button>' +
                '</div>';

            card.querySelector('.bookBtn').addEventListener('click', function () {
                bookBus(b);
            });
            listWrap.appendChild(card);
        });
    }

    function bookBus(b) {
        UT.openBookingDirect({
            mode: 'Bus',
            from: routeMeta.from.name,
            to: routeMeta.to.name,
            date: routeMeta.date,
            operator: b.name + ' {' + b.type + '}',
            fare: b.fare,
            departure: b.departure + ' {' + b.boarding + '}',
            details: [
                ['Operator', b.name],
                ['Bus Type', b.type + ' (' + b.layout + ')'],
                ['Departure', b.departure + ' • ' + b.boarding],
                ['Arrival', b.arrival + ' • ' + b.drop],
                ['Duration', b.duration],
                ['Rating', '★ ' + b.rating.toFixed(1)],
                ['Seats Left', b.seatsLeft],
                ['Fare', '₹ ' + b.fare.toLocaleString('en-IN') + ' per seat']
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
    var searchBtn = document.getElementById('busSearchBtn') || document.querySelector('.Search button');
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
