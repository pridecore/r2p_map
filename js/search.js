// 🔎 Додаємо поле пошуку на карту
const searchBox = L.control({ position: 'topright' });

searchBox.onAdd = function () {
    let div = L.DomUtil.create('div', 'search-box');
    div.innerHTML = `
        <style>
            .search-box {
                background: white;
                padding: 8px;
                border-radius: 8px;
                box-shadow: 0px 2px 8px rgba(0,0,0,0.2);
                font-family: 'Open Sans', sans-serif;
                position: relative;
                z-index: 1000;
            }

            .search-input {
                width: 250px;
                padding: 6px;
                font-size: 14px;
                border: 1px solid #ccc;
                border-radius: 5px;
                outline: none;
            }

            .search-results {
                position: absolute;
                top: 40px;
                left: 0;
                background: white;
                width: 250px;
                max-height: 250px;
                overflow-y: auto;
                border-radius: 5px;
                box-shadow: 0px 4px 8px rgba(0,0,0,0.2);
                list-style: none;
                padding: 0;
                margin: 0;
                display: none;
                z-index: 1000;
            }

            .search-results li {
                padding: 8px;
                font-size: 14px;
                cursor: pointer;
                border-bottom: 1px solid #eee;
                transition: background 0.2s;
            }

            .search-results li:hover {
                background: #f5f5f5;
            }

            .search-results li.no-result {
                text-align: center;
                color: #777;
                padding: 10px;
            }
        </style>

        <input type="text" id="searchInput" class="search-input" placeholder="🔍 Введіть назву..." autocomplete="off">
        <ul id="searchResults" class="search-results"></ul>
    `;
    return div;
};

searchBox.addTo(map);

// 📌 Масив точок для пошуку
let pointsData = [];

// 📌 Оновлення списку точок після завантаження
function updateSearchData(data) {
    pointsData = data.map(point => ({
        id: point.id,
        name: point.name.toLowerCase().trim(),
        lat: parseFloat(point.lat),
        lng: parseFloat(point.lng)
    }));
}

// 📌 Обробник подій для пошуку
document.getElementById("searchInput").addEventListener("input", function (e) {
    let searchText = e.target.value.toLowerCase().trim();
    let resultsContainer = document.getElementById("searchResults");
    resultsContainer.innerHTML = "";

    if (searchText.length < 2) {
        resultsContainer.style.display = "none";
        return;
    }

    // 🔍 Пошук з нечіткими збігами
    let foundPoints = pointsData.filter(p => 
        p.name.includes(searchText) || 
        p.name.replace(/\s+/g, '').includes(searchText.replace(/\s+/g, ''))
    );

    if (foundPoints.length > 0) {
        resultsContainer.style.display = "block";

        foundPoints.forEach(point => {
            let listItem = document.createElement("li");
            listItem.textContent = point.name;

            listItem.addEventListener("click", function () {
                selectSearchResult(point);
            });

            resultsContainer.appendChild(listItem);
        });
    } else {
        resultsContainer.style.display = "block";
        resultsContainer.innerHTML = `<li class="no-result">❌ Нічого не знайдено</li>`;
    }
});

// 📌 Вибір точки пошуку
function selectSearchResult(point) {
    let lat = point.lat;
    let lng = point.lng;

    if (!isNaN(lat) && !isNaN(lng)) {
        // 🏎️ Гарантовано наближаємо карту до вибраної точки
        map.flyTo([lat, lng], 23, { animate: true, duration: 1 });

        // Чекаємо завершення анімації перед відкриттям попапу
        setTimeout(() => {
            if (markers[point.id]) {
                markers[point.id].openPopup();
            }
        }, 1100);
    }

    document.getElementById("searchResults").style.display = "none";
    document.getElementById("searchInput").value = point.name;
}

// 📌 Натискання Enter для вибору першої знайденої точки
document.getElementById("searchInput").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        let firstResult = document.querySelector("#searchResults li");
        if (firstResult && !firstResult.classList.contains("no-result")) {
            let point = pointsData.find(p => p.name === firstResult.textContent);
            if (point) selectSearchResult(point);
        }
    }
});

// 📌 Закриваємо випадаючий список при кліку поза ним
document.addEventListener("click", function (event) {
    let searchBox = document.getElementById("searchInput");
    let resultsContainer = document.getElementById("searchResults");

    if (!searchBox.contains(event.target) && !resultsContainer.contains(event.target)) {
        resultsContainer.style.display = "none";
    }
});