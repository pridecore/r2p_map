// 🗺️ Ініціалізація карти OpenStreetMap через Leaflet.js
var map = L.map('map', {
    center: [48.4647, 35.0462], // Дніпро
    zoom: 8.5, // Початковий масштаб
    zoomControl: true, // Увімкнено зум-контрол
    preferCanvas: true // Оптимізація продуктивності
});

// 🎨 Додаємо стилізовану мапу (темна тема)
var darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">Carto</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// 🗺 Додаємо альтернативні стилі мапи
var lightLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
});

var satelliteLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenTopoMap contributors'
});

// 📌 Додаємо перемикання стилів мапи
L.control.layers({
    "Темна мапа": darkLayer,
    "Світла мапа": lightLayer,
    "Супутникова мапа": satelliteLayer
}).addTo(map);

// 🎯 Об'єкт для збереження маркерів
var markers = {};

// 📌 Початкові налаштування карти
const initialView = {
    center: [48.4647, 35.0462],
    zoom: 8.5
};

// 📌 Функція для завантаження даних з Google Apps Script
async function loadPoints() {
    try {
        const scriptUrl = "https://script.google.com/macros/s/AKfycbzu4bjR3CFugsIqd7Qg6-36X9Ftqfz-EsES1g57szyVRZ5AaEFkQdkdPC9XrZa5Xda5Uw/exec"; // 🔗 URL Google Apps Script
        const response = await fetch(scriptUrl);
        if (!response.ok) throw new Error("Помилка отримання даних");

        const data = await response.json();
        console.log("✅ Отримані дані:", data);

        // 🚀 Оновлення списку точок для пошуку
        updateSearchData(data);

        data.forEach(point => {
            let lat = parseFloat(point.lat);
            let lng = parseFloat(point.lng);
            let name = point.name || "Невідома локація"; // Назва точки
            let bedsTotal = parseInt(point.bedsTotal, 10) || 0; // Загальна кількість ліжок
            let bedsFree = parseInt(point.bedsFree, 10) || 0; // Вільні ліжка
            let indicator = point.indicator || "⚪"; // Індикатор 🟢 або 🔴

            // 🛑 Перевірка коректності координат
            if (isNaN(lat) || isNaN(lng)) {
                console.warn(`⚠️ Пропущено точку: ${name} (Некоректні координати: ${point.lat}, ${point.lng})`);
                return;
            }

            // 🎨 Вибір іконки маркера
            let iconUrl = indicator === "🟢" ? "/img/home_green.png" : "/img/home_red.png";
            let markerIcon = L.icon({
                iconUrl: iconUrl,
                iconSize: [14, 14], // 📏 Розмір іконки
                iconAnchor: [20, 40], // 📌 Точка кріплення (по центру)
                popupAnchor: [-13, -45] // 🎈 Позиція popup
            });

            let popupContent = `
                <div style="
                    font-family: 'Open Sans', sans-serif;
                    padding: 0;
                    border-radius: 12px;
                    background: #ffffff;
                    box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.3);
                    text-align: center;
                    width: 100%;
                    max-width: 320px; /* Обмежуємо ширину */
                    position: relative;
                    overflow: hidden;
                    border: 3px solid #606162;
                    box-sizing: border-box;
                    font-size: 90%; /* 🔹 Зменшено шрифт на 10% */">

                    <!-- 🔹 Верхня панель -->
                    <div style="
                        background: linear-gradient(135deg, #2f64a6 0%, #e2346f 100%);
                        padding: 12px;
                        color: #fff;
                        font-weight: bold;
                        font-size: 110%; /* 🔹 Відносний розмір */
                        border-radius: 8px 8px 0 0;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        width: 100%;
                        box-sizing: border-box;">
                        📍 ${name}
                    </div>

                    <!-- 📊 Основний контент -->
                    <div style="
                        padding: 12px;
                        color: #606162;
                        font-size: 100%; /* 🔹 Відносний розмір */
                        text-align: left;
                        width: 100%;
                        box-sizing: border-box;">

                        <p style="margin: 8px 0;">
                            🛏 <span style="font-weight: bold;">Всього ліжок:</span> 
                            <b style="color: #2f64a6; font-size: 110%;">${bedsTotal}</b>
                        </p>

                        ${(() => {
                            if (bedsFree >= bedsTotal) {
                                return `<p style="
                                    font-size: 100%;
                                    font-weight: bold;
                                    padding: 8px;
                                    border-radius: 5px;
                                    background: rgba(226, 52, 111, 0.85);
                                    color: #fff;
                                    text-align: center;
                                    width: 100%;
                                    box-sizing: border-box;">
                                    ❌ Не має вільних місць!
                                </p>`;
                            }
                            if (bedsFree > 0) {
                                return `<p style="
                                    font-size: 100%;
                                    font-weight: bold;
                                    padding: 8px;
                                    border-radius: 5px;
                                    background: rgba(47, 100, 166, 0.2);
                                    color: #2f64a6;
                                    text-align: center;
                                    width: 100%;
                                    box-sizing: border-box;">
                                    🟢 Вільних місць: <b>${bedsFree}</b>
                                </p>`;
                            }
                            return `<p style="
                                font-size: 100%;
                                font-weight: bold;
                                padding: 8px;
                                border-radius: 5px;
                                background: rgba(226, 52, 111, 0.2);
                                color: #e2346f;
                                text-align: center;
                                width: 100%;
                                box-sizing: border-box;">
                                🔴 Вільних місць немає!
                            </p>`;
                        })()}
                    </div>

                    <!-- ⚡ Підсвітка під popup -->
                    <div style="
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        width: 100%;
                        height: 4px;
                        background: linear-gradient(to right, #2f64a6, #e2346f);
                        animation: gradient-slide 10s linear infinite;
                        box-sizing: border-box;"></div>
                </div>

                <!-- Анімація -->
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap');

                    @keyframes gradient-slide {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }
                </style>
            `;


            // Якщо маркер вже є - оновлюємо його, інакше створюємо новий
            if (markers[point.id]) {
                markers[point.id].setLatLng([lat, lng]);
                markers[point.id].setIcon(markerIcon);
                markers[point.id].bindPopup(popupContent);
            } else {
                let marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map)
                    .bindPopup(popupContent);

                // 🔍 Додаємо можливість збільшувати карту при натисканні на маркер
                marker.on("click", function () {
                    map.flyTo([lat, lng], 16, {
                        animate: true,
                        duration: 0.75 // Час анімації
                    });
                });

                markers[point.id] = marker;
            }
        });

    } catch (error) {
        console.error("❌ Помилка завантаження точок:", error);
    }
}


// 🚀 Запускаємо завантаження точок
loadPoints();

// 🔄 Оновлення даних кожні 30 секунд
setInterval(loadPoints, 30000);

// 🔄 Повернення до початкового масштабу при натисканні поза маркерами
map.on("click", function (e) {
    // Якщо натиснули не на маркер
    if (!e.originalEvent.target.closest(".leaflet-marker-icon")) {
        map.flyTo(initialView.center, initialView.zoom, {
            animate: true,
            duration: 1 // Час анімації
        });
    }
});

// 📌 Функція для отримання параметрів URL
function getQueryParam(param) {
    let urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// 📌 Отримуємо координати з URL
let paramLat = parseFloat(getQueryParam("lat"));
let paramLng = parseFloat(getQueryParam("lng"));

// 📌 Якщо є координати, переносимо карту і відкриваємо попап
if (!isNaN(paramLat) && !isNaN(paramLng)) {
    setTimeout(() => {
        map.flyTo([paramLat, paramLng], 15, { animate: true, duration: 1 });

        // 🔍 Знаходимо відповідний маячок і відкриваємо його popup
        Object.values(markers).forEach(marker => {
            let markerPos = marker.getLatLng();
            if (markerPos.lat.toFixed(5) === paramLat.toFixed(5) && markerPos.lng.toFixed(5) === paramLng.toFixed(5)) {
                marker.openPopup();
            }
        });

    }, 1000);
}