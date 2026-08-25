/* ============================================================
   UniTravels – shared app logic
   Adds real booking functionality, login awareness and small
   quality-of-life upgrades to every page WITHOUT touching CSS.
   ============================================================ */
(function () {
    'use strict';

    var LOGGED_KEY = 'isLoggedIn';
    var USER_KEY = 'currentUser';
    var BOOKINGS_KEY = 'unitravels_bookings';
    var PENDING_KEY = 'pendingBooking';

    /* ---------- helpers ---------- */
    function parseJSON(str) {
        try { return JSON.parse(str); } catch (e) { return null; }
    }

    function getUser() { return parseJSON(sessionStorage.getItem(USER_KEY)); }

    function isLoggedIn() {
        return sessionStorage.getItem(LOGGED_KEY) === 'true' && !!getUser();
    }

    function getBookings() {
        return parseJSON(localStorage.getItem(BOOKINGS_KEY)) || [];
    }

    function saveBookings(list) {
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
    }

    function addBooking(booking) {
        var list = getBookings();
        list.unshift(booking);
        saveBookings(list);
    }

    function makeBookingId() {
        var stamp = Date.now().toString(36).toUpperCase();
        var rand = Math.random().toString(36).slice(2, 5).toUpperCase();
        return 'UT-' + stamp.slice(-5) + rand;
    }

    function niceDate(iso) {
        if (!iso) return '';
        var d = new Date(iso + 'T00:00:00');
        if (isNaN(d.getTime())) return iso;
        return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }

    /* expose for bookings.html and Login.html */
    window.UniTravels = {
        getUser: getUser,
        isLoggedIn: isLoggedIn,
        getBookings: getBookings,
        saveBookings: saveBookings,
        addBooking: addBooking,
        makeBookingId: makeBookingId,
        niceDate: niceDate,
        PENDING_KEY: PENDING_KEY
    };

    /* ---------- header: greeting, auth links, fixed About/Contact ---------- */
    function setupHeader() {
        var logo = document.getElementById('logo');
        if (!logo) return;

        /* fix dead "#" links left over in the original markup */
        Array.prototype.forEach.call(logo.querySelectorAll('a[href="#"]'), function (a) {
            var t = a.textContent.toLowerCase();
            if (t.indexOf('about') !== -1) a.href = 'aboutus.html';
            else if (t.indexOf('contact') !== -1) a.href = 'contactus.html';
        });

        if (isLoggedIn()) {
            var user = getUser();
            var greet = document.createElement('p');
            greet.id = 'userGreeting';
            greet.textContent = 'Welcome, ' + user.name + ' 👋';

            var trips = document.createElement('a');
            trips.href = 'bookings.html';
            trips.textContent = '🧳 My Bookings';

            var out = document.createElement('a');
            out.href = '#';
            out.textContent = 'Logout';
            out.addEventListener('click', function (e) {
                e.preventDefault();
                sessionStorage.removeItem(LOGGED_KEY);
                sessionStorage.removeItem(USER_KEY);
                location.reload();
            });

            logo.appendChild(greet);
            logo.appendChild(trips);
            logo.appendChild(out);
        } else {
            var inA = document.createElement('a');
            inA.href = 'Login.html';
            inA.textContent = 'Login';

            var upA = document.createElement('a');
            upA.href = 'signup.html';
            upA.textContent = 'Sign Up';

            logo.appendChild(inA);
            logo.appendChild(upA);
        }
    }

    /* ---------- date picker: today as default + minimum ---------- */
    function setupDate() {
        var d = document.getElementById('date');
        if (!d) return;
        var t = new Date();
        var iso = t.getFullYear() + '-' +
            String(t.getMonth() + 1).padStart(2, '0') + '-' +
            String(t.getDate()).padStart(2, '0');
        d.min = iso;
        if (!d.value) d.value = iso;
    }

    /* ---------- travel pages (bus / train / car) ---------- */
    function getArea() {
        return document.getElementById('bavail') ||
               document.getElementById('tavail') ||
               document.getElementById('cavail');
    }

    function modeOf(area) {
        if (area.id === 'bavail') return 'Bus';
        if (area.id === 'tavail') return 'Train';
        return 'Car';
    }

    function iconOf(mode) {
        if (mode === 'Bus') return '🚌';
        if (mode === 'Train') return '🚆';
        return '🚗';
    }

    /* add a Book button to every result row */
    function setupBookButtons(area, mode) {
        Array.prototype.forEach.call(area.querySelectorAll('table'), function (table) {
            var head = table.querySelector('thead tr');
            if (head && !head.querySelector('.bookCol')) {
                var th = document.createElement('th');
                th.className = 'bookCol';
                th.textContent = 'Book';
                head.appendChild(th);
            }
            Array.prototype.forEach.call(table.querySelectorAll('tbody tr'), function (tr) {
                if (tr.querySelector('.bookCell')) return;
                var td = document.createElement('td');
                td.className = 'bookCell';
                var btn = document.createElement('button');
                btn.textContent = 'Book';
                btn.addEventListener('click', function () { openBooking(tr, table, mode); });
                td.appendChild(btn);
                tr.appendChild(td);
            });
        });
    }

    /* results toolbar shown after a successful search */
    function setupResultsBar(area, mode) {
        var bar = document.createElement('div');
        bar.className = 'resultsBar';
        bar.style.display = 'none';

        var h = document.createElement('h3');

        var hint = document.createElement('p');
        hint.textContent = 'Tap “Book” on any option to reserve it. 👇';

        var mod = document.createElement('button');
        mod.textContent = '🔁 Modify Search';
        mod.addEventListener('click', function () {
            area.style.display = 'none';
            var web = document.getElementById('web') || document.getElementById('web1');
            if (web) web.style.display = 'block';
        });

        bar.appendChild(h);
        bar.appendChild(hint);
        bar.appendChild(mod);
        area.insertBefore(bar, area.firstChild);
        area._bar = bar;
        area._barTitle = h;
    }

    /* watch the Search button and update the toolbar when results appear */
    function watchSearch(area, mode) {
        var btn = document.querySelector('.Search button');
        if (!btn) return;
        btn.addEventListener('click', function () {
            setTimeout(function () {
                var visible = area.style.display === 'block';
                if (!visible || !area._bar) return;
                var from = document.getElementById('location').value;
                var to = document.getElementById('destination').value;
                var dateEl = document.getElementById('date');
                var title = iconOf(mode) + ' ' + mode + ' options: ' + from + ' → ' + to;
                if (dateEl && dateEl.value) title += '  •  ' + niceDate(dateEl.value);
                area._barTitle.textContent = title;
                area._bar.style.display = 'block';
            }, 0);
        });
    }

    /* ---------- booking card ---------- */
    var pendingSelection = null;
    var bookingDone = false;

    function buildBookingCard() {
        var card = document.createElement('div');
        card.id = 'web1';
        card.style.display = 'none';
        card.innerHTML =
            '<h3 id="bkTitle" style="text-align:center; margin-bottom:12px;">🎫 Confirm Your Booking</h3>' +
            '<table><tbody id="bkSummary"></tbody></table>' +
            '<div id="bkForm">' +
                '<div class="place"><label for="paxName">Passenger:</label>' +
                '<input type="text" id="paxName" placeholder="Full name"></div>' +
                '<div class="place"><label for="paxPhone">Phone:</label>' +
                '<input type="text" id="paxPhone" placeholder="10-digit mobile"></div>' +
                '<div class="place"><label for="paxSeats" id="paxSeatsLabel">Seats:</label>' +
                '<select id="paxSeats">' +
                    '<option value="1">1</option><option value="2">2</option>' +
                    '<option value="3">3</option><option value="4">4</option>' +
                    '<option value="5">5</option><option value="6">6</option>' +
                '</select></div>' +
                '<p id="bkTotal" style="text-align:center; font-size:1.2em; margin:12px 0;"></p>' +
                '<div class="Search"><button id="bkConfirm">Confirm Booking ✅</button></div>' +
                '<p id="bkMsg" style="text-align:center; margin-top:12px; color:red;"></p>' +
            '</div>' +
            '<div class="Search" id="bkSuccessActions" style="display:none; margin-top:8px;">' +
                '<button id="bkGoTrips">🧳 Go to My Bookings</button> ' +
                '<button id="bkAgain">Book Another Trip</button>' +
            '</div>';
        document.body.appendChild(card);

        document.getElementById('bkConfirm').addEventListener('click', confirmBooking);
        document.getElementById('bkGoTrips').addEventListener('click', function () {
            location.href = 'bookings.html';
        });
        document.getElementById('bkAgain').addEventListener('click', function () {
            location.reload();
        });
        var seats = document.getElementById('paxSeats');
        seats.addEventListener('change', updateTotal);
        return card;
    }

    function updateTotal() {
        if (!pendingSelection) return;
        var seats = parseInt(document.getElementById('paxSeats').value, 10) || 1;
        var total = pendingSelection.fare * seats;
        document.getElementById('bkTotal').innerHTML =
            '💰 Total Fare: <b>INR ' + total.toLocaleString('en-IN') + '</b>' +
            ' <span style="font-size:0.8em;">(' + pendingSelection.fare.toLocaleString('en-IN') + ' × ' + seats + ')</span>';
    }

    function openBooking(tr, table, mode) {
        var headers = [];
        Array.prototype.forEach.call(table.querySelectorAll('thead th'), function (th, i, all) {
            if (i < all.length - 1) headers.push(th.textContent.trim()); /* skip injected Book column */
        });
        var cells = [];
        Array.prototype.forEach.call(tr.querySelectorAll('td'), function (td, i, all) {
            if (i < all.length - 1) cells.push(td.textContent.trim()); /* skip injected Book cell */
        });

        /* the fare column is simply titled "Fare" */
        var fareIdx = -1;
        headers.forEach(function (h, i) { if (h === 'Fare') fareIdx = i; });
        var fare = 0;
        if (fareIdx !== -1) {
            var m = cells[fareIdx].match(/[\d,]+/);
            if (m) fare = parseInt(m[0].replace(/,/g, ''), 10) || 0;
        }

        var from = document.getElementById('location').value;
        var to = document.getElementById('destination').value;
        var dateEl = document.getElementById('date');
        var date = dateEl ? dateEl.value : '';

        pendingSelection = {
            id: makeBookingId(),
            mode: mode,
            icon: iconOf(mode),
            from: from,
            to: to,
            date: date,
            headers: headers,
            cells: cells,
            operator: cells[0] || '',
            fare: fare,
            status: 'Confirmed',
            bookedAt: new Date().toISOString()
        };

        var card = document.getElementById('web1');
        if (!card || !document.getElementById('bkSummary')) card = buildBookingCard();

        /* fill the summary table */
        var summary = document.getElementById('bkSummary');
        summary.innerHTML = '';
        headers.forEach(function (h, i) {
            var r = document.createElement('tr');
            r.innerHTML = '<td>' + h + '</td><td>' + cells[i] + '</td>';
            summary.appendChild(r);
        });
        var extra = [
            ['Route', from + ' → ' + to],
            ['Travel Date', niceDate(date)],
            ['Mode', iconOf(mode) + ' ' + mode]
        ];
        extra.forEach(function (row) {
            var r = document.createElement('tr');
            r.innerHTML = '<td>' + row[0] + '</td><td>' + row[1] + '</td>';
            summary.appendChild(r);
        });

        /* reset form state */
        bookingDone = false;
        document.getElementById('bkTitle').textContent = '🎫 Confirm Your Booking';
        document.getElementById('bkForm').style.display = 'block';
        document.getElementById('bkSuccessActions').style.display = 'none';
        document.getElementById('bkMsg').textContent = '';
        document.getElementById('paxSeatsLabel').textContent =
            (mode === 'Car' ? 'No. of Cars:' : 'Seats:');
        var nameInput = document.getElementById('paxName');
        nameInput.value = isLoggedIn() ? getUser().name : '';
        document.getElementById('paxPhone').value = '';
        document.getElementById('paxSeats').value = '1';
        updateTotal();

        /* swap the view */
        var area = getArea();
        if (area) area.style.display = 'none';
        var web = document.getElementById('web');
        if (web) web.style.display = 'none';
        card.style.display = 'block';
        if (typeof card.scrollIntoView === 'function') {
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollTo(0, card.offsetTop);
        }
    }

    function confirmBooking() {
        if (!pendingSelection || bookingDone) return;
        var name = document.getElementById('paxName').value.trim();
        var phone = document.getElementById('paxPhone').value.trim();
        var seats = parseInt(document.getElementById('paxSeats').value, 10) || 1;
        var msg = document.getElementById('bkMsg');

        if (!name) { msg.textContent = 'Please enter the passenger name.'; return; }
        if (!/^\d{10}$/.test(phone)) { msg.textContent = 'Please enter a valid 10-digit mobile number.'; return; }

        msg.style.color = 'green';

        var booking = Object.assign({}, pendingSelection, {
            passenger: name,
            phone: phone,
            seats: seats,
            total: pendingSelection.fare * seats
        });

        if (isLoggedIn()) {
            booking.user = getUser().name;
            addBooking(booking);
            showSuccess(booking);
        } else {
            /* save the cart and bounce through the login page */
            sessionStorage.setItem(PENDING_KEY, JSON.stringify(booking));
            msg.textContent = '🔐 Please login to confirm this booking… redirecting you now.';
            setTimeout(function () { location.href = 'Login.html'; }, 1200);
        }
    }

    function showSuccess(booking) {
        bookingDone = true;
        document.getElementById('bkTitle').textContent = '🎉 Booking Confirmed!';
        document.getElementById('bkForm').style.display = 'none';
        document.getElementById('bkSuccessActions').style.display = 'block';
        var summary = document.getElementById('bkSummary');
        var r = document.createElement('tr');
        r.innerHTML = '<td>Booking ID</td><td><b>' + booking.id + '</b></td>';
        summary.insertBefore(r, summary.firstChild);
        document.getElementById('bkMsg').textContent = '';
    }

    /* ---------- destination guide page: icons + toolbar ---------- */
    function setupIdeaPage() {
        var area = document.getElementById('Iavail');
        if (!area) return;

        var icons = { 'Best Hotels': '🏨', 'Best Places': '🏞️', 'Best Restaurant': '🍽️', 'Best Food': '🍲' };
        Array.prototype.forEach.call(area.querySelectorAll('.section-title'), function (el) {
            Object.keys(icons).forEach(function (k) {
                if (el.textContent.indexOf(k) !== -1 && el.textContent.indexOf(icons[k]) === -1) {
                    el.innerHTML = icons[k] + ' ' + el.innerHTML;
                }
            });
        });

        /* toolbar */
        var bar = document.createElement('div');
        bar.className = 'resultsBar';
        bar.style.display = 'none';
        var h = document.createElement('h3');
        var hint = document.createElement('p');
        hint.textContent = 'Hotels, sights, restaurants & must-try food for your destination. 😋';
        var mod = document.createElement('button');
        mod.textContent = '🔁 Modify Search';
        mod.addEventListener('click', function () {
            area.style.display = 'none';
            var web = document.getElementById('web1');
            if (web) web.style.display = 'block';
        });
        bar.appendChild(h);
        bar.appendChild(hint);
        bar.appendChild(mod);
        area.insertBefore(bar, area.firstChild);

        var btn = document.querySelector('.Search button');
        if (btn) {
            btn.addEventListener('click', function () {
                setTimeout(function () {
                    if (area.style.display !== 'block') return;
                    var to = document.getElementById('destination').value;
                    h.textContent = '📍 Your guide to ' + to;
                    bar.style.display = 'block';
                }, 0);
            });
        }
    }

    /* ---------- boot ---------- */
    setupHeader();
    setupDate();

    var area = getArea();
    if (area) {
        var mode = modeOf(area);
        setupBookButtons(area, mode);
        setupResultsBar(area, mode);
        watchSearch(area, mode);
    } else if (document.getElementById('Iavail')) {
        setupIdeaPage();
    }
})();
