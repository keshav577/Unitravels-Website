/* ============================================================
   UniTravels – central data layer
   • ~120 Indian cities (with coordinates)
   • Real-style operators (RedBus inspired)
   • Deterministic, realistic bus generation for ANY route
   • Merges admin-added buses & cities from localStorage
   ============================================================ */
(function () {
    'use strict';

    /* ---------------- Indian cities (name, state, lat, lon) ---------------- */
    var CITIES = [
        { name: 'Agra', state: 'Uttar Pradesh', lat: 27.18, lon: 78.02 },
        { name: 'Ahmedabad', state: 'Gujarat', lat: 23.02, lon: 72.57 },
        { name: 'Aizawl', state: 'Mizoram', lat: 23.73, lon: 92.72 },
        { name: 'Ajmer', state: 'Rajasthan', lat: 26.45, lon: 74.64 },
        { name: 'Aligarh', state: 'Uttar Pradesh', lat: 27.89, lon: 78.08 },
        { name: 'Alwar', state: 'Rajasthan', lat: 27.56, lon: 76.63 },
        { name: 'Ambala', state: 'Haryana', lat: 30.38, lon: 76.77 },
        { name: 'Amravati', state: 'Maharashtra', lat: 20.93, lon: 77.75 },
        { name: 'Amritsar', state: 'Punjab', lat: 31.63, lon: 74.87 },
        { name: 'Asansol', state: 'West Bengal', lat: 23.68, lon: 86.98 },
        { name: 'Aurangabad', state: 'Maharashtra', lat: 19.88, lon: 75.34 },
        { name: 'Ayodhya', state: 'Uttar Pradesh', lat: 26.80, lon: 82.20 },
        { name: 'Bareilly', state: 'Uttar Pradesh', lat: 28.36, lon: 79.42 },
        { name: 'Bathinda', state: 'Punjab', lat: 30.21, lon: 74.95 },
        { name: 'Belagavi', state: 'Karnataka', lat: 15.85, lon: 74.51 },
        { name: 'Bengaluru', state: 'Karnataka', lat: 12.97, lon: 77.59 },
        { name: 'Bharatpur', state: 'Rajasthan', lat: 27.21, lon: 77.49 },
        { name: 'Bhavnagar', state: 'Gujarat', lat: 21.76, lon: 72.15 },
        { name: 'Bhilai', state: 'Chhattisgarh', lat: 21.21, lon: 81.43 },
        { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.26, lon: 77.41 },
        { name: 'Bhubaneswar', state: 'Odisha', lat: 20.30, lon: 85.82 },
        { name: 'Bhuj', state: 'Gujarat', lat: 23.25, lon: 69.66 },
        { name: 'Bikaner', state: 'Rajasthan', lat: 28.02, lon: 73.31 },
        { name: 'Bilaspur', state: 'Chhattisgarh', lat: 22.08, lon: 82.15 },
        { name: 'Bodh Gaya', state: 'Bihar', lat: 24.69, lon: 84.99 },
        { name: 'Chandigarh', state: 'Chandigarh', lat: 30.73, lon: 76.78 },
        { name: 'Chennai', state: 'Tamil Nadu', lat: 13.08, lon: 80.27 },
        { name: 'Chittorgarh', state: 'Rajasthan', lat: 24.88, lon: 74.63 },
        { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.02, lon: 76.96 },
        { name: 'Cuttack', state: 'Odisha', lat: 20.46, lon: 85.88 },
        { name: 'Darbhanga', state: 'Bihar', lat: 26.15, lon: 85.89 },
        { name: 'Darjeeling', state: 'West Bengal', lat: 27.04, lon: 88.26 },
        { name: 'Davangere', state: 'Karnataka', lat: 14.46, lon: 75.92 },
        { name: 'Dehradun', state: 'Uttarakhand', lat: 30.32, lon: 78.03 },
        { name: 'Delhi', state: 'Delhi NCR', lat: 28.61, lon: 77.21 },
        { name: 'Dhanbad', state: 'Jharkhand', lat: 23.79, lon: 86.43 },
        { name: 'Dharamshala', state: 'Himachal Pradesh', lat: 32.22, lon: 76.32 },
        { name: 'Dibrugarh', state: 'Assam', lat: 27.47, lon: 94.91 },
        { name: 'Durgapur', state: 'West Bengal', lat: 23.52, lon: 87.31 },
        { name: 'Gandhinagar', state: 'Gujarat', lat: 23.22, lon: 72.65 },
        { name: 'Gaya', state: 'Bihar', lat: 24.79, lon: 85.00 },
        { name: 'Goa', state: 'Goa', lat: 15.49, lon: 73.83 },
        { name: 'Gorakhpur', state: 'Uttar Pradesh', lat: 26.76, lon: 83.37 },
        { name: 'Gulbarga', state: 'Karnataka', lat: 17.33, lon: 76.84 },
        { name: 'Guntur', state: 'Andhra Pradesh', lat: 16.31, lon: 80.44 },
        { name: 'Guwahati', state: 'Assam', lat: 26.14, lon: 91.74 },
        { name: 'Gwalior', state: 'Madhya Pradesh', lat: 26.22, lon: 78.18 },
        { name: 'Haridwar', state: 'Uttarakhand', lat: 29.95, lon: 78.16 },
        { name: 'Hosur', state: 'Tamil Nadu', lat: 12.72, lon: 77.83 },
        { name: 'Hubballi', state: 'Karnataka', lat: 15.36, lon: 75.12 },
        { name: 'Hyderabad', state: 'Telangana', lat: 17.38, lon: 78.48 },
        { name: 'Imphal', state: 'Manipur', lat: 24.82, lon: 93.94 },
        { name: 'Indore', state: 'Madhya Pradesh', lat: 22.72, lon: 75.86 },
        { name: 'Jabalpur', state: 'Madhya Pradesh', lat: 23.18, lon: 79.95 },
        { name: 'Jaipur', state: 'Rajasthan', lat: 26.91, lon: 75.79 },
        { name: 'Jaisalmer', state: 'Rajasthan', lat: 26.91, lon: 70.91 },
        { name: 'Jalandhar', state: 'Punjab', lat: 31.33, lon: 75.58 },
        { name: 'Jalgaon', state: 'Maharashtra', lat: 21.00, lon: 75.56 },
        { name: 'Jammu', state: 'Jammu & Kashmir', lat: 32.73, lon: 74.87 },
        { name: 'Jamshedpur', state: 'Jharkhand', lat: 22.80, lon: 86.20 },
        { name: 'Jhansi', state: 'Uttar Pradesh', lat: 25.45, lon: 78.57 },
        { name: 'Jodhpur', state: 'Rajasthan', lat: 26.24, lon: 73.02 },
        { name: 'Jorhat', state: 'Assam', lat: 26.76, lon: 94.21 },
        { name: 'Kalaburagi', state: 'Karnataka', lat: 17.33, lon: 76.84 },
        { name: 'Kanpur', state: 'Uttar Pradesh', lat: 26.45, lon: 80.33 },
        { name: 'Kanyakumari', state: 'Tamil Nadu', lat: 8.09, lon: 77.54 },
        { name: 'Karnal', state: 'Haryana', lat: 29.69, lon: 76.99 },
        { name: 'Katra', state: 'Jammu & Kashmir', lat: 32.99, lon: 74.95 },
        { name: 'Khajuraho', state: 'Madhya Pradesh', lat: 24.84, lon: 79.92 },
        { name: 'Kochi', state: 'Kerala', lat: 9.93, lon: 76.27 },
        { name: 'Kohima', state: 'Nagaland', lat: 25.67, lon: 94.11 },
        { name: 'Kolhapur', state: 'Maharashtra', lat: 16.70, lon: 74.24 },
        { name: 'Kolkata', state: 'West Bengal', lat: 22.57, lon: 88.36 },
        { name: 'Kota', state: 'Rajasthan', lat: 25.18, lon: 75.87 },
        { name: 'Kozhikode', state: 'Kerala', lat: 11.26, lon: 75.78 },
        { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.85, lon: 80.95 },
        { name: 'Ludhiana', state: 'Punjab', lat: 30.90, lon: 75.85 },
        { name: 'Madurai', state: 'Tamil Nadu', lat: 9.93, lon: 78.12 },
        { name: 'Manali', state: 'Himachal Pradesh', lat: 32.24, lon: 77.19 },
        { name: 'Mangaluru', state: 'Karnataka', lat: 12.87, lon: 74.86 },
        { name: 'Mathura', state: 'Uttar Pradesh', lat: 27.49, lon: 77.67 },
        { name: 'Meerut', state: 'Uttar Pradesh', lat: 28.99, lon: 77.71 },
        { name: 'Mehsana', state: 'Gujarat', lat: 23.59, lon: 72.37 },
        { name: 'Moradabad', state: 'Uttar Pradesh', lat: 28.84, lon: 78.77 },
        { name: 'Mount Abu', state: 'Rajasthan', lat: 24.60, lon: 72.71 },
        { name: 'Mumbai', state: 'Maharashtra', lat: 19.08, lon: 72.88 },
        { name: 'Muzaffarpur', state: 'Bihar', lat: 26.12, lon: 85.39 },
        { name: 'Mysuru', state: 'Karnataka', lat: 12.30, lon: 76.65 },
        { name: 'Nagpur', state: 'Maharashtra', lat: 21.15, lon: 79.09 },
        { name: 'Nainital', state: 'Uttarakhand', lat: 29.39, lon: 79.45 },
        { name: 'Nanded', state: 'Maharashtra', lat: 19.14, lon: 77.31 },
        { name: 'Nashik', state: 'Maharashtra', lat: 19.99, lon: 73.79 },
        { name: 'Patna', state: 'Bihar', lat: 25.61, lon: 85.14 },
        { name: 'Patiala', state: 'Punjab', lat: 30.34, lon: 76.39 },
        { name: 'Pondicherry', state: 'Puducherry', lat: 11.94, lon: 79.80 },
        { name: 'Prayagraj', state: 'Uttar Pradesh', lat: 25.44, lon: 81.85 },
        { name: 'Pune', state: 'Maharashtra', lat: 18.52, lon: 73.86 },
        { name: 'Puri', state: 'Odisha', lat: 19.81, lon: 85.84 },
        { name: 'Pushkar', state: 'Rajasthan', lat: 26.49, lon: 74.55 },
        { name: 'Raipur', state: 'Chhattisgarh', lat: 21.25, lon: 81.63 },
        { name: 'Rajahmundry', state: 'Andhra Pradesh', lat: 17.00, lon: 81.78 },
        { name: 'Rajkot', state: 'Gujarat', lat: 22.30, lon: 70.80 },
        { name: 'Ranchi', state: 'Jharkhand', lat: 23.34, lon: 85.31 },
        { name: 'Ratlam', state: 'Madhya Pradesh', lat: 23.33, lon: 75.04 },
        { name: 'Rewa', state: 'Madhya Pradesh', lat: 24.53, lon: 81.30 },
        { name: 'Rishikesh', state: 'Uttarakhand', lat: 30.09, lon: 78.27 },
        { name: 'Sagar', state: 'Madhya Pradesh', lat: 23.83, lon: 78.74 },
        { name: 'Salem', state: 'Tamil Nadu', lat: 11.66, lon: 78.16 },
        { name: 'Satna', state: 'Madhya Pradesh', lat: 24.58, lon: 80.83 },
        { name: 'Sawai Madhopur', state: 'Rajasthan', lat: 26.02, lon: 76.35 },
        { name: 'Shillong', state: 'Meghalaya', lat: 25.58, lon: 91.89 },
        { name: 'Shimla', state: 'Himachal Pradesh', lat: 31.10, lon: 77.17 },
        { name: 'Shivamogga', state: 'Karnataka', lat: 13.93, lon: 75.57 },
        { name: 'Siliguri', state: 'West Bengal', lat: 26.73, lon: 88.39 },
        { name: 'Solapur', state: 'Maharashtra', lat: 17.66, lon: 75.91 },
        { name: 'Srinagar', state: 'Jammu & Kashmir', lat: 34.08, lon: 74.80 },
        { name: 'Surat', state: 'Gujarat', lat: 21.17, lon: 72.83 },
        { name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.52, lon: 76.94 },
        { name: 'Thrissur', state: 'Kerala', lat: 10.52, lon: 76.21 },
        { name: 'Tiruchirappalli', state: 'Tamil Nadu', lat: 10.79, lon: 78.70 },
        { name: 'Tirupati', state: 'Andhra Pradesh', lat: 13.63, lon: 79.42 },
        { name: 'Udaipur', state: 'Rajasthan', lat: 24.58, lon: 73.71 },
        { name: 'Ujjain', state: 'Madhya Pradesh', lat: 23.18, lon: 75.77 },
        { name: 'Vadodara', state: 'Gujarat', lat: 22.31, lon: 73.19 },
        { name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.32, lon: 82.99 },
        { name: 'Vellore', state: 'Tamil Nadu', lat: 12.92, lon: 79.13 },
        { name: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.51, lon: 80.63 },
        { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.69, lon: 83.22 },
        { name: 'Warangal', state: 'Telangana', lat: 17.97, lon: 79.60 }
    ];

    /* ---------------- real-style operators ---------------- */
    var OPERATORS = [
        { name: 'IntrCity SmartBus', base: 4.5 },
        { name: 'Zingbus Plus', base: 4.4 },
        { name: 'VRL Travels', base: 4.2 },
        { name: 'Orange Tours & Travels', base: 4.1 },
        { name: 'SRS Travels', base: 4.0 },
        { name: 'Hans Travels', base: 4.3 },
        { name: 'Chartered Bus', base: 4.4 },
        { name: 'Gajraj Travels', base: 4.2 },
        { name: 'Humsafar Travels', base: 4.1 },
        { name: 'Raj Kalpana Travels', base: 4.1 },
        { name: 'Bluecity Bus', base: 4.0 },
        { name: 'Safar Express', base: 4.0 },
        { name: 'M R Travels', base: 4.0 },
        { name: 'Shrinath Travel Agency', base: 4.0 },
        { name: 'Neeta Tours & Travels', base: 3.9 },
        { name: 'Ashok Travels', base: 3.9 },
        { name: 'Raj Travels', base: 4.0 },
        { name: 'Chouhan Travels', base: 3.9 },
        { name: 'Atmaram Travels', base: 3.9 },
        { name: 'PRL Travels', base: 3.9 },
        { name: 'Yamuna Travels', base: 3.9 },
        { name: 'Mahaveer Travels', base: 3.9 },
        { name: 'Mahalaxmi Travels', base: 3.8 },
        { name: 'Gagan Travels', base: 3.8 },
        { name: 'Paulo Travels', base: 3.8 },
        { name: 'Kaveri Travels', base: 3.8 },
        { name: 'Gujarat Travels', base: 3.8 },
        { name: 'Jakhar Travels', base: 3.8 },
        { name: 'Krishna Travels', base: 3.7 },
        { name: 'Jain Travels', base: 3.7 },
        { name: 'Shree Sharma Travels', base: 3.7 },
        { name: 'RK Travels', base: 3.6 }
    ];

    /* ---------------- bus types with realistic economics ---------------- */
    var BUS_TYPES = [
        { name: 'Non AC Seater', perKm: 1.00, speed: 48, cls: 'seater', ac: false, layout: '2+2' },
        { name: 'Non AC Sleeper', perKm: 1.35, speed: 46, cls: 'sleeper', ac: false, layout: '2+1' },
        { name: 'AC Seater', perKm: 1.55, speed: 50, cls: 'seater', ac: true, layout: '2+2' },
        { name: 'AC Sleeper', perKm: 1.95, speed: 48, cls: 'sleeper', ac: true, layout: '2+1' },
        { name: 'Volvo AC Seater', perKm: 1.85, speed: 56, cls: 'seater', ac: true, layout: '2+2' },
        { name: 'Volvo AC Sleeper', perKm: 2.35, speed: 52, cls: 'sleeper', ac: true, layout: '2+1' },
        { name: 'Luxury AC Sleeper', perKm: 2.90, speed: 50, cls: 'sleeper', ac: true, layout: '1+2' }
    ];

    /* ---------------- well-known boarding points ---------------- */
    var BOARDING = {
        'Delhi': ['ISBT Kashmiri Gate', 'Tis Hazari', 'Mori Gate', 'Akshardham Metro Pillar', 'Mahipalpur'],
        'Mumbai': ['Borivali East', 'Andheri East', 'Sion', 'Dadar East', 'Borivali West'],
        'Pune': ['Swargate', 'Wakad', 'Hinjewadi Phase 1', 'Chandni Chowk'],
        'Bengaluru': ['Majestic', 'Silk Board', 'Hebbal', 'Anand Rao Circle', 'Electronic City'],
        'Hyderabad': ['Miyapur', 'Kukatpally', 'Secunderabad', 'LB Nagar', 'Ameerpet'],
        'Chennai': ['Koyambedu CMBT', 'Tambaram', 'Guindy', 'Perungudi'],
        'Kolkata': ['Esplanade', 'Howrah Station', 'Salt Lake Sector V', 'Babughat'],
        'Jaipur': ['Sindhi Camp', 'Narayan Singh Circle', 'Polo Victory'],
        'Ahmedabad': ['Gita Mandir', 'Iscon Mall', 'Satellite'],
        'Surat': ['Adajan', 'Udhna Bus Stand', 'Varachha Road'],
        'Goa': ['Panjim Bus Stand', 'Mapusa', 'Margao (Kadamba)', 'Porvorim'],
        'Indore': ['Teen Imli Square', 'Navlakha Bus Stand', 'Gangwal Bus Stand', 'Pipliyahan Square'],
        'Ratlam': ['Ratlam Bus Stand', 'Fuhara Chowk', 'Bypass Circle'],
        'Ujjain': ['Dewas Gate', 'Nana Kheda Bus Stand'],
        'Bhopal': ['Hadalpura Bus Stand', 'Nadra Bus Stand', 'ISBT Bhopal'],
        'Lucknow': ['Alambagh Bus Stand', 'Charbagh', 'Kaiserbagh'],
        'Kanpur': ['ISBT Kanpur', 'Jajmau'],
        'Varanasi': ['Cantt Bus Stand', 'Lahurabir'],
        'Patna': ['Gandhi Maidan', 'ISBT Bairiya'],
        'Kochi': ['Kaloor', 'Vyttila Hub'],
        'Thiruvananthapuram': ['Thampanoor Central Bus Stand'],
        'Coimbatore': ['Gandhipuram', 'Singanallur'],
        'Madurai': ['Mattuthavani IBT'],
        'Visakhapatnam': ['Maddilapalem', 'RTC Complex'],
        'Vijayawada': ['Pandit Nehru Bus Station'],
        'Guwahati': ['ISBT Betkuchi', 'Paltan Bazaar'],
        'Shimla': ['ISBT Shimla'],
        'Manali': ['Manali Bus Stand', 'Naggar Road'],
        'Amritsar': ['ISBT Amritsar (Hall Gate)'],
        'Chandigarh': ['ISBT Sector 43', 'Sector 17'],
        'Dehradun': ['ISBT Dehradun'],
        'Haridwar': ['Haridwar Bus Stand'],
        'Nagpur': ['Ganeshpeth', 'Butibori'],
        'Raipur': ['ISBT Bhatagaon'],
        'Ranchi': ['ISBT Kathal More'],
        'Ludhiana': ['ISBT Ludhiana', 'Sherpur Chowk'],
        'Jalandhar': ['Model Town Chowk', 'Bus Stand Nakodar Road'],
        'Agra': ['ISBT Agra', 'Sanjay Place'],
        'Jammu': ['ISBT Jammu'],
        'Srinagar': ['TRC Bus Stand'],
        'Mysuru': ['Mysuru Bus Stand', 'Hinkal'],
        'Nashik': ['Panchavati', 'Mumbai Naka'],
        'Vadodara': ['Central Bus Stand', 'Alkapuri'],
        'Rajkot': ['Greenland Chowkdi', 'ISBT Rajkot']
    };
    var GENERIC_POINTS = ['Central Bus Stand', 'City Bus Stand', 'Bypass Circle', 'Railway Station Road', 'Old Bus Stand', 'ISBT'];

    /* ---------------- storage keys ---------------- */
    var ADMIN_BUS_KEY = 'unitravels_admin_buses';
    var ADMIN_CITY_KEY = 'unitravels_admin_cities';

    /* ---------------- deterministic RNG ---------------- */
    function hashStr(str) {
        var h = 1779033703 ^ str.length;
        for (var i = 0; i < str.length; i++) {
            h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
            h = (h << 13) | (h >>> 19);
        }
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
    function mulberry32(seed) {
        var a = seed >>> 0;
        return function () {
            a |= 0; a = (a + 0x6D2B79F5) | 0;
            var t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    /* ---------------- geo ---------------- */
    function haversineKm(a, b) {
        var R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLon = (b.lon - a.lon) * Math.PI / 180;
        var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return 2 * R * Math.asin(Math.sqrt(s));
    }

    /* ---------------- helpers ---------------- */
    function getAdminCities() {
        try { return JSON.parse(localStorage.getItem(ADMIN_CITY_KEY)) || []; } catch (e) { return []; }
    }
    function saveAdminCities(list) { localStorage.setItem(ADMIN_CITY_KEY, JSON.stringify(list)); }
    function getAdminBuses() {
        try { return JSON.parse(localStorage.getItem(ADMIN_BUS_KEY)) || []; } catch (e) { return []; }
    }
    function saveAdminBuses(list) { localStorage.setItem(ADMIN_BUS_KEY, JSON.stringify(list)); }

    function getCities() {
        var all = CITIES.concat(getAdminCities());
        return all.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
    }

    function findCity(query) {
        if (!query) return null;
        var q = query.trim().toLowerCase();
        var all = getCities();
        for (var i = 0; i < all.length; i++) {
            if (all[i].name.toLowerCase() === q) return all[i];
        }
        for (var j = 0; j < all.length; j++) {
            if (all[j].name.toLowerCase().indexOf(q) === 0) return all[j];
        }
        return null;
    }

    function fmtDur(min) {
        var h = Math.floor(min / 60), m = min % 60;
        return (h < 10 ? '0' + h : h) + 'h ' + (m < 10 ? '0' + m : m) + 'm';
    }
    function fmtArrival(depMin, durMin) {
        var total = depMin + durMin;
        var days = Math.floor(total / 1440);
        var t = total % 1440;
        var h = Math.floor(t / 60), m = t % 60;
        return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + (days > 0 ? ' +' + days : '');
    }
    function fmtDeparture(depMin) {
        var h = Math.floor(depMin / 60), m = depMin % 60;
        return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m);
    }

    function amenitiesFor(type) {
        var a = ['Live Tracking', 'Emergency Exit'];
        if (type.cls === 'sleeper') a = a.concat(['Blanket', 'Charging Point', 'Reading Light', 'Water Bottle']);
        else a = a.concat(['Charging Point', 'Water Bottle']);
        if (type.name.indexOf('Volvo') !== -1 || type.name.indexOf('Luxury') !== -1) a.push('Free WiFi');
        return a.slice(0, 5);
    }

    function pickType(dist, rnd) {
        var pool;
        if (dist < 250) pool = [0, 0, 2, 4, 2, 1];               /* mostly seater */
        else if (dist < 700) pool = [0, 1, 2, 3, 4, 3, 5];       /* mixed */
        else pool = [1, 3, 3, 5, 5, 6, 2];                       /* mostly sleeper */
        return BUS_TYPES[pool[Math.floor(rnd() * pool.length)]];
    }

    function pickDeparture(dist, rnd) {
        var hours;
        if (dist > 600) hours = [21, 22, 23, 19, 20, 18, 17, 6, 7, 8, 13, 14, 15, 16];
        else hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
        var h = hours[Math.floor(rnd() * hours.length)];
        var m = [0, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55][Math.floor(rnd() * 11)];
        return h * 60 + m;
    }

    function pickPoint(cityName, rnd) {
        var pool = BOARDING[cityName] || GENERIC_POINTS;
        return pool[Math.floor(rnd() * pool.length)];
    }

    /* ---------------- route generation (RedBus-style) ---------------- */
    function generateBuses(fromCity, toCity) {
        var rnd = mulberry32(hashStr(fromCity.name + '|' + toCity.name));
        var dist = haversineKm(fromCity, toCity);
        var roadDist = dist * 1.18; /* roads aren't straight lines */
        var n = Math.max(4, Math.min(14, Math.round(2 + roadDist / 170 + rnd() * 3)));
        var buses = [];
        var usedDep = {};

        for (var i = 0; i < n; i++) {
            var type = pickType(roadDist, rnd);
            var op = OPERATORS[Math.floor(rnd() * OPERATORS.length)];
            var dep = pickDeparture(roadDist, rnd);
            while (usedDep[dep]) dep = (dep + 25) % 1440;
            usedDep[dep] = true;

            var durMin = Math.max(40, Math.round((roadDist / type.speed) * 60 * (0.92 + rnd() * 0.16)));
            var fare = Math.max(120, Math.round((type.perKm * roadDist * (0.88 + rnd() * 0.24)) / 10) * 10);
            var rating = Math.max(3.4, Math.min(4.9, op.base + (rnd() - 0.5) * 0.5));
            var seats = 2 + Math.floor(rnd() * 37);
            var reviews = 60 + Math.floor(rnd() * 4200);

            buses.push({
                name: op.name,
                type: type.name,
                layout: type.layout,
                ac: type.ac,
                cls: type.cls,
                departureMin: dep,
                departure: fmtDeparture(dep),
                durationMin: durMin,
                duration: fmtDur(durMin),
                arrival: fmtArrival(dep, durMin),
                fare: fare,
                rating: Math.round(rating * 10) / 10,
                reviews: reviews,
                seatsLeft: seats,
                boarding: pickPoint(fromCity.name, rnd),
                drop: pickPoint(toCity.name, rnd),
                amenities: amenitiesFor(type),
                distanceKm: Math.round(roadDist)
            });
        }
        buses.sort(function (a, b) { return a.departureMin - b.departureMin; });
        return buses;
    }

    function normalizeAdminBus(b) {
        var dep = b.departure.split(':');
        var depMin = parseInt(dep[0], 10) * 60 + parseInt(dep[1], 10);
        var typeObj = null;
        for (var i = 0; i < BUS_TYPES.length; i++) if (BUS_TYPES[i].name === b.type) typeObj = BUS_TYPES[i];
        if (!typeObj) typeObj = BUS_TYPES[3];
        return {
            name: b.operator,
            type: b.type,
            layout: typeObj.layout,
            ac: typeObj.ac,
            cls: typeObj.cls,
            departureMin: depMin,
            departure: b.departure,
            durationMin: b.durationMin,
            duration: fmtDur(b.durationMin),
            arrival: fmtArrival(depMin, b.durationMin),
            fare: b.fare,
            rating: b.rating,
            reviews: 0,
            seatsLeft: b.seats,
            boarding: b.boarding || 'Central Bus Stand',
            drop: b.drop || 'Central Bus Stand',
            amenities: amenitiesFor(typeObj),
            distanceKm: 0,
            custom: true
        };
    }

    function getBusesForRoute(fromQuery, toQuery) {
        var from = findCity(fromQuery), to = findCity(toQuery);
        if (!from || !to) return null;
        var list = [];
        getAdminBuses().forEach(function (b) {
            if (b.from.toLowerCase() === from.name.toLowerCase() &&
                b.to.toLowerCase() === to.name.toLowerCase()) {
                list.push(normalizeAdminBus(b));
            }
        });
        return list.concat(generateBuses(from, to));
    }

    /* ---------------- export ---------------- */
    window.UniTravelsData = {
        getCities: getCities,
        findCity: findCity,
        getBusesForRoute: getBusesForRoute,
        getAdminBuses: getAdminBuses,
        saveAdminBuses: saveAdminBuses,
        getAdminCities: getAdminCities,
        saveAdminCities: saveAdminCities,
        OPERATORS: OPERATORS,
        BUS_TYPES: BUS_TYPES,
        BOARDING: BOARDING,
        ADMIN_BUS_KEY: ADMIN_BUS_KEY,
        ADMIN_CITY_KEY: ADMIN_CITY_KEY,
        haversineKm: haversineKm,
        fmtDur: fmtDur
    };
})();
