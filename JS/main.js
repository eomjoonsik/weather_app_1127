
const hero = document.getElementById("hero");
const animationBox = document.getElementById("weatherAnimation");
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const searchResults = document.getElementById("searchResults");
const refreshBtn = document.getElementById("refreshBtn");

let selectedLocation = null;
let requestId = 0;
let searchId = 0;

// HTML 데이터 표시

function show(id, value) {
    document.getElementById(id).textContent = value;
}

// 소수점 정리

function round(value, digits = 0) {
    return value == null
        ? null
        : Number(value.toFixed(digits));
}

// 숫자와 단위 분리

function showValue(id, value, unit = "") {

    const element = document.getElementById(id);

    element.textContent = value == null ? "--" : value;

    if (value != null && unit) {

        const span = document.createElement("span");

        span.textContent = unit;

        element.appendChild(span);
    }
}

function temperature(value) {
    return value == null ? "--°" : Math.round(value) + "°";
}

// 날씨 상태 분류

function getState(code, isDay = 1) {

    if (code == null)
        return ["날씨 정보 없음", "·", "cloudy"];

    if (code === 0)
        return [
            "맑음",
            isDay ? "☀️" : "🌙",
            isDay ? "sunny" : "night"
        ];

    if (code <= 2)
        return [
            "구름 조금",
            isDay ? "🌤️" : "☁️",
            isDay ? "partly" : "night"
        ];

    if (code === 3)
        return ["흐림", "☁️", "cloudy"];

    if (code <= 48)
        return ["안개", "🌫️", "foggy"];

    if (code <= 67)
        return ["비", "🌧️", "rainy"];

    if (code <= 77)
        return ["눈", "❄️", "snowy"];

    if (code <= 82)
        return ["소나기", "🌧️", "rainy"];

    if (code <= 86)
        return ["눈", "❄️", "snowy"];

    return ["뇌우", "⛈️", "stormy"];
}

// 날씨 애니메이션

function setAnimation(type) {

    hero.className = "hero " + type;
    animationBox.innerHTML = "";

    // 태양

    if (type === "sunny" || type === "partly") {

        let rays = "";

        for (let i = 0; i < 12; i++) {

            rays += `
                <line x1="90" y1="8"
                    x2="90" y2="28"
                    stroke="#E9B448"
                    stroke-width="6"
                    stroke-linecap="round"
                    transform="rotate(${i * 30} 90 90)"/>
            `;
        }

        animationBox.innerHTML = `
            <svg class="sun" viewBox="0 0 180 180">
                <circle cx="90" cy="90"
                    r="47" fill="#E9B448"/>
                ${rays}
            </svg>
        `;
    }

    // 구름

    if ([
        "partly", "cloudy", "rainy",
        "snowy", "stormy"
    ].includes(type)) {

        animationBox.insertAdjacentHTML("beforeend", `
            <div class="cloud"></div>
            <div class="cloud second"></div>
        `);
    }

    // 비

    if (type === "rainy" || type === "stormy") {

        for (let i = 0; i < 35; i++) {

            const drop = document.createElement("div");

            drop.className = "rain-drop";

            drop.style.left =
                Math.random() * 100 + "%";

            drop.style.animationDuration =
                1 + Math.random() * 1.5 + "s";

            drop.style.animationDelay =
                -Math.random() * 3 + "s";

            animationBox.appendChild(drop);
        }
    }

    // 눈

    if (type === "snowy") {

        for (let i = 0; i < 35; i++) {

            const flake = document.createElement("div");

            const size = 3 + Math.random() * 6;

            flake.className = "snow-flake";

            flake.style.width = size + "px";
            flake.style.height = size + "px";

            flake.style.left =
                Math.random() * 100 + "%";

            flake.style.animationDuration =
                4 + Math.random() * 5 + "s";

            flake.style.animationDelay =
                -Math.random() * 8 + "s";

            animationBox.appendChild(flake);
        }
    }

    // 밤

    if (type === "night") {

        animationBox.innerHTML =
            '<div class="moon"></div>';

        for (let i = 0; i < 20; i++) {

            const star = document.createElement("div");

            star.className = "star";

            star.style.left =
                Math.random() * 100 + "%";

            star.style.top =
                Math.random() * 100 + "%";

            star.style.animationDelay =
                -Math.random() * 3 + "s";

            animationBox.appendChild(star);
        }
    }

    // 안개

    if (type === "foggy") {

        for (let i = 0; i < 5; i++) {

            const fog = document.createElement("div");

            fog.className = "fog";

            fog.style.top =
                180 + i * 30 + "px";

            fog.style.animationDelay = -i + "s";

            animationBox.appendChild(fog);
        }
    }
}

// 오늘의 외출 팁

function setTip(weather, rainChance) {

    const temp = weather.apparent_temperature;
    const wind = weather.wind_speed_10m;
    const uv = weather.uv_index;
    const code = weather.weather_code;

    let title = "가볍게 외출해 볼까요?";

    let description =
        "현재 날씨에 맞게 외출을 준비하세요.";

    const items = [];

    // 기온별 옷차림

    if (temp != null) {

        if (temp <= 0) {

            title = "오늘은 단단히 챙겨 입어요!";

            description =
                "체감 온도가 0도 이하로 떨어졌어요.";

            items.push(
                "🧥 두꺼운 패딩",
                "🧣 목도리",
                "🧤 장갑"
            );

        } else if (temp <= 5) {

            title = "따뜻한 외투가 필요해요.";

            description =
                "바깥 공기가 꽤 차가워요.";

            items.push(
                "🧥 패딩 또는 코트",
                "🧣 목도리"
            );

        } else if (temp <= 11) {

            title = "외투는 꼭 챙겨요!";

            description =
                "쌀쌀한 날씨에 따뜻하게 입어 주세요.";

            items.push("🧥 코트 또는 재킷");

        } else if (temp <= 17) {

            title = "가벼운 겉옷을 챙겨요.";

            description =
                "시간대에 따라 쌀쌀할 수 있어요.";

            items.push(
                "🧶 니트",
                "🧥 가벼운 재킷"
            );

        } else if (temp <= 22) {

            title = "산책하기 좋은 기온이에요.";

            description =
                "가벼운 옷차림으로 외출해 보세요.";

            items.push(
                "👕 긴팔",
                "🧶 가디건"
            );

        } else if (temp <= 27) {

            title = "가볍게 입고 나가요!";

            description =
                "활동하기에 따뜻한 날씨예요.";

            items.push("👕 반팔");

        } else {

            title = "시원하게 입고 나가요.";

            description =
                "더위에 지치지 않도록 수분을 보충하세요.";

            items.push(
                "👕 반팔",
                "💧 물"
            );
        }
    }

    // 우산

    if (rainChance >= 50 || weather.precipitation > 0) {

        items.push("☂️ 우산");

        description += " 강수에 대비해 주세요.";
    }

    // 자외선

    if (uv >= 3) {
        items.push("🧴 자외선 차단제");
    }

    if (uv >= 6) {
        items.push("🧢 모자");
    }

    // 강한 바람

    if (wind >= 8) {

        items.push("🧥 바람막이");

        description += " 바람도 강하게 불어요.";
    }

    // 눈

    if (
        (code >= 71 && code <= 77) ||
        code === 85 ||
        code === 86 ||
        weather.snow_depth > 0
    ) {

        items.push("👟 미끄럼 방지 신발");

        description += " 미끄러운 길을 조심하세요.";
    }

    // 뇌우

    if (code >= 95) {

        title = "실내 활동을 추천해요.";

        description =
            "천둥과 번개가 예상돼요. 야외 활동을 피해주세요.";
    }

    show("tipTitle", title);
    show("tipText", description);

    const box = document.getElementById("tipItems");

    box.innerHTML = "";

    items.forEach(text => {

        const item = document.createElement("span");

        item.className = "tip-item";
        item.textContent = text;

        box.appendChild(item);
    });
}

// UV 지수 해석

function getUV(value) {

    if (value == null) return "정보 없음";
    if (value < 3) return "낮음";
    if (value < 6) return "보통";
    if (value < 8) return "높음";
    if (value < 11) return "매우 높음";

    return "위험";
}

// 시간별 기온 그래프

function drawGraph(temperatures) {

    const box = document.getElementById("graph");

    box.innerHTML = "";

    if (
        !temperatures.length ||
        temperatures.some(value => value == null)
    ) {
        return;
    }

    const width = 360;
    const height = 75;

    const min = Math.min(...temperatures);
    const max = Math.max(...temperatures);

    const range = max - min || 1;

    const points = temperatures.map((temp, i) => {

        const x =
            (i + 0.5) * width / temperatures.length;

        const y =
            55 - (temp - min) / range * 40;

        return [x, y];
    });

    const line = points.map((p, i) =>
        `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`
    ).join(" ");

    const area = line +
        ` L${points[points.length - 1][0]},75` +
        ` L${points[0][0]},75 Z`;

    const circles = points.map(p => `
        <circle cx="${p[0]}" cy="${p[1]}"
            r="3.5" fill="#6B8DAE"/>
    `).join("");

    box.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}"
            preserveAspectRatio="none"
            role="img"
            aria-label="시간별 기온 변화 그래프">

            <path d="${area}" fill="#E9F0F7"/>

            <path d="${line}"
                fill="none"
                stroke="#6B8DAE"
                stroke-width="2"/>

            ${circles}

        </svg>
    `;
}

// 이전 날씨 정보 초기화

function clearWeather() {

    show("temp", "--°");
    show("maxTemp", "--°");
    show("minTemp", "--°");
    show("feelsLike", "");
    show("date", "");
    show("updated", "");
    show("rainChance", "");

    [
        "humidity", "rain", "wind", "uv",
        "pressure", "snow", "visibility", "wave"
    ].forEach(id => showValue(id, null));

    [
        "humidityText", "rainText", "windText",
        "uvText", "snowText",
        "visibilityText", "waveText"
    ].forEach(id => show(id, ""));

    show("tipTitle", "날씨를 확인하고 있어요.");
    show("tipText", "");

    document.getElementById("tipItems").innerHTML = "";
    document.getElementById("hourly").innerHTML = "";
    document.getElementById("graph").innerHTML = "";

    setAnimation("cloudy");
}

// 현재 위치 가져오기

function getLocation() {

    const id = ++requestId;

    searchId++;

    searchResults.hidden = true;
    cityInput.value = "";
    selectedLocation = null;

    refreshBtn.disabled = true;

    clearWeather();

    show("city", "현재 위치 확인 중");
    show("weatherText", "날씨 불러오는 중");

    if (!navigator.geolocation) {

        show("weatherText", "지역 검색을 이용해 주세요.");

        refreshBtn.disabled = false;

        return;
    }

    navigator.geolocation.getCurrentPosition(

        function(position) {

            if (id !== requestId) return;

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            console.log("현재 위치:", lat, lng);

            getWeather(lat, lng, "현재 위치");
        },

        function(error) {

            if (id !== requestId) return;

            console.error("위치 오류:", error.message);

            show("city", "위치 확인 실패");

            show(
                "weatherText",
                "지역을 직접 검색해 주세요."
            );

            show("tipTitle", "지역을 검색해 주세요.");

            refreshBtn.disabled = false;
        },

        {
            maximumAge: 0,
            timeout: 15000
        }
    );
}

// 지역명 검색 별칭

const aliases = {

    "서울": "Seoul",
    "서울특별시": "Seoul",

    "인천": "Incheon",
    "인천광역시": "Incheon",

    "부산": "Busan",
    "부산광역시": "Busan",

    "대구": "Daegu",
    "대구광역시": "Daegu",

    "대전": "Daejeon",
    "대전광역시": "Daejeon",

    "광주": "Gwangju",
    "광주광역시": "Gwangju",

    "울산": "Ulsan",
    "울산광역시": "Ulsan",

    "세종": "Sejong",
    "제주": "Jeju",
    "제주시": "Jeju",

    "수원": "Suwon",
    "성남": "Seongnam",
    "고양": "Goyang",
    "용인": "Yongin",
    "부천": "Bucheon",
    "안양": "Anyang",
    "안산": "Ansan",
    "김포": "Gimpo",
    "파주": "Paju",
    "화성": "Hwaseong",
    "평택": "Pyeongtaek",
    "시흥": "Siheung",
    "청주": "Cheongju",
    "천안": "Cheonan",
    "전주": "Jeonju",
    "목포": "Mokpo",
    "여수": "Yeosu",
    "순천": "Suncheon",
    "포항": "Pohang",
    "경주": "Gyeongju",
    "창원": "Changwon",
    "김해": "Gimhae",
    "춘천": "Chuncheon",
    "강릉": "Gangneung",
    "원주": "Wonju",
    "속초": "Sokcho",

    "도쿄": "Tokyo",
    "오사카": "Osaka",
    "후쿠오카": "Fukuoka",
    "삿포로": "Sapporo",
    "교토": "Kyoto",
    "뉴욕": "New York",
    "런던": "London",
    "파리": "Paris",
    "로스앤젤레스": "Los Angeles",
    "방콕": "Bangkok",
    "타이베이": "Taipei",
    "싱가포르": "Singapore",
    "홍콩": "Hong Kong",
    "베이징": "Beijing",
    "상하이": "Shanghai",
    "시드니": "Sydney",
    "로마": "Rome",
    "베를린": "Berlin"
};

// 국내 주요 광역시 검색 조건

const metroAreas = {

    "서울": "서울",
    "서울특별시": "서울",

    "인천": "인천",
    "인천광역시": "인천",

    "부산": "부산",
    "부산광역시": "부산",

    "대구": "대구",
    "대구광역시": "대구",

    "대전": "대전",
    "대전광역시": "대전",

    "광주광역시": "광주",

    "울산": "울산",
    "울산광역시": "울산"
};

// 검색 지역 선택

function selectPlace(place) {

    searchId++;

    searchResults.hidden = true;

    cityInput.value = place.name;

    const label = [
        place.name,
        place.admin1,
        place.country
    ].filter(Boolean);

    const cityName = [...new Set(label)].join(", ");

    getWeather(
        place.latitude,
        place.longitude,
        cityName
    );
}

// 지역 검색 기능

searchForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const keyword = cityInput.value.trim();

    if (!keyword) return;

    const id = ++searchId;

    searchResults.hidden = false;

    searchResults.innerHTML =
        '<p class="search-message">지역 검색 중...</p>';

    const name = aliases[keyword] || keyword;

    const metro = metroAreas[keyword];

    const countryFilter = metro
        ? "&countryCode=KR"
        : "";

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=50&language=ko&format=json${countryFilter}`;

    try {

        const response = await fetch(url);
        const data = await response.json();

        if (id !== searchId) return;

        if (!response.ok) {
            throw new Error("지역 검색 실패");
        }

        let results = data.results || [];

        // 광역시 검색 시 같은 이름의 작은 마을 제외

        if (metro) {

            const matched = results.filter(place => {

                const admin = place.admin1 || "";

                return (
                    place.country_code === "KR" &&
                    admin.includes(metro)
                );
            });

            if (matched.length > 0) {
                results = matched;
            }
        }

        // 주요 도시 및 행정구역 우선

        const majorCities = results.filter(place => {

            const code = place.feature_code || "";

            return [
                "PPLC",
                "PPLA",
                "PPLA2",
                "PPLA3",
                "ADM1",
                "ADM2"
            ].includes(code) ||
                (place.population || 0) >= 10000;
        });

        if (majorCities.length > 0) {
            results = majorCities;
        }

        // 주요 도시 우선 정렬

        results.sort((a, b) => {

            const aExact =
                a.name === keyword ? 1 : 0;

            const bExact =
                b.name === keyword ? 1 : 0;

            if (aExact !== bExact) {
                return bExact - aExact;
            }

            return (b.population || 0) -
                (a.population || 0);
        });

        // 중복 지역 제거

        const seen = new Set();

        results = results.filter(place => {

            const key = [
                place.name,
                place.admin1,
                place.country
            ].join("|");

            if (seen.has(key)) return false;

            seen.add(key);

            return true;
        });

        // 광역시가 명확하면 바로 선택

        if (metro) {

            const exactMetro = results.find(place => {

                const code = place.feature_code || "";

                const admin = place.admin1 || "";

                return (
                    place.country_code === "KR" &&
                    admin.includes(metro) &&
                    (
                        code === "PPLC" ||
                        code === "PPLA" ||
                        code === "ADM1"
                    )
                );
            });

            if (exactMetro) {

                selectPlace(exactMetro);

                return;
            }
        }

        // 최대 5개 표시

        results = results.slice(0, 5);

        searchResults.innerHTML = "";

        if (results.length === 0) {

            searchResults.innerHTML =
                '<p class="search-message">검색 결과가 없어요. 다른 이름으로 검색해 보세요.</p>';

            return;
        }

        // 결과가 하나면 바로 조회

        if (results.length === 1) {

            selectPlace(results[0]);

            return;
        }

        // 여러 결과가 있을 경우 직접 선택

        results.forEach(place => {

            const button = document.createElement("button");

            const title = document.createElement("strong");

            const detail = document.createElement("small");

            button.type = "button";

            title.textContent = place.name;

            detail.textContent = [
                place.admin1 === place.name
                    ? null : place.admin1,
                place.country
            ].filter(Boolean).join(", ");

            button.appendChild(title);
            button.appendChild(detail);

            button.addEventListener("click", function() {

                selectPlace(place);
            });

            searchResults.appendChild(button);
        });

    } catch (error) {

        if (id !== searchId) return;

        console.error(error);

        searchResults.innerHTML =
            '<p class="search-message">검색에 실패했어요. 다시 시도해 주세요.</p>';
    }
});

// 검색어 변경 시 이전 검색 결과 닫기

cityInput.addEventListener("input", function() {

    searchId++;

    searchResults.hidden = true;
});

// 검색창 바깥 클릭 시 닫기

document.addEventListener("click", function(event) {

    if (!event.target.closest(".search-wrap")) {

        searchId++;

        searchResults.hidden = true;
    }
});

// ESC 키로 검색창 닫기

document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {

        searchId++;

        searchResults.hidden = true;
    }
});

// 날씨 API 요청

async function getWeather(lat, lng, cityName) {

    const id = ++requestId;

    selectedLocation = {
        lat: lat,
        lng: lng,
        name: cityName
    };

    refreshBtn.disabled = true;

    clearWeather();

    show("city", cityName);
    show("weatherText", "날씨 불러오는 중");

    const currentParams = [
        "temperature_2m",
        "apparent_temperature",
        "relative_humidity_2m",
        "precipitation",
        "surface_pressure",
        "snow_depth",
        "visibility",
        "uv_index",
        "weather_code",
        "wind_speed_10m",
        "is_day"
    ].join(",");

    const hourlyParams = [
        "temperature_2m",
        "weather_code",
        "precipitation_probability",
        "is_day"
    ].join(",");

    const weatherUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=${currentParams}&hourly=${hourlyParams}&daily=temperature_2m_max,temperature_2m_min&wind_speed_unit=ms&timezone=auto&forecast_days=2`;

    const marineUrl =
        `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&current=wave_height&timezone=auto`;

    try {

        const response = await fetch(weatherUrl);
        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.reason || "날씨 요청 실패"
            );
        }

        if (id !== requestId) return;

        const weather = data.current;
        const daily = data.daily;
        const hourly = data.hourly;

        // 날씨별 배경과 애니메이션

        const state = getState(
            weather.weather_code,
            weather.is_day
        );

        setAnimation(state[2]);

        // 현재 날씨

        show(
            "temp",
            temperature(weather.temperature_2m)
        );

        show("weatherText", state[0]);

        show(
            "feelsLike",
            "체감 " + temperature(
                weather.apparent_temperature
            )
        );

        show(
            "maxTemp",
            temperature(daily.temperature_2m_max[0])
        );

        show(
            "minTemp",
            temperature(daily.temperature_2m_min[0])
        );

        // 날짜

        const date = new Date(
            daily.time[0] + "T12:00:00"
        );

        show("date", date.toLocaleDateString("ko-KR", {
            month: "long",
            day: "numeric",
            weekday: "long"
        }));

        // 상세 날씨

        const humidity = weather.relative_humidity_2m;
        const rain = weather.precipitation;
        const wind = weather.wind_speed_10m;
        const uv = weather.uv_index;

        const snow = weather.snow_depth == null
            ? null
            : round(weather.snow_depth * 100, 1);

        const visibility = weather.visibility == null
            ? null
            : round(weather.visibility / 1000, 1);

        showValue("humidity", humidity, "%");

        showValue("rain", rain, "mm");

        showValue("wind", round(wind, 1), "m/s");

        showValue("uv", round(uv, 1));

        showValue(
            "pressure",
            round(weather.surface_pressure),
            "hPa"
        );

        showValue("snow", snow, "cm");

        showValue("visibility", visibility, "km");

        showValue("wave", null);

        show("waveText", "해양 데이터 확인 중");

        // 습도 해석

        show(
            "humidityText",
            humidity == null ? "정보 없음" :
            humidity < 40 ? "건조한 편" :
            humidity <= 70 ? "보통" : "습한 편"
        );

        // 강수량 해석

        show(
            "rainText",
            rain == null ? "정보 없음" :
            rain === 0 ? "현재 강수 없음" : "강수 있음"
        );

        // 풍속 해석

        show(
            "windText",
            wind == null ? "정보 없음" :
            wind < 4 ? "약한 바람" :
            wind < 8 ? "바람이 부는 편" : "강한 바람"
        );

        // UV 해석

        show("uvText", getUV(uv));

        // 적설량 해석

        show(
            "snowText",
            snow == null ? "정보 없음" :
            snow === 0 ? "쌓인 눈 없음" : "눈이 쌓여 있어요"
        );

        // 가시거리 해석

        show(
            "visibilityText",
            visibility == null ? "정보 없음" :
            visibility >= 10 ? "시야 양호" :
            visibility >= 2 ? "보통" : "시야 주의"
        );

        // 시간별 날씨

        const currentHour =
            weather.time.slice(0, 13) + ":00";

        const index =
            hourly.time.indexOf(currentHour);

        const hourlyBox =
            document.getElementById("hourly");

        hourlyBox.innerHTML = "";

        const temperatures = [];
        const chances = [];

        if (index >= 0) {

            for (let i = index; i < index + 6; i++) {

                if (!hourly.time[i]) break;

                const hour =
                    hourly.time[i].slice(11, 13);

                const temp = i === index
                    ? weather.temperature_2m
                    : hourly.temperature_2m[i];

                const icon = i === index
                    ? state[1]
                    : getState(
                        hourly.weather_code[i],
                        hourly.is_day[i]
                    )[1];

                const chance =
                    hourly.precipitation_probability[i];

                temperatures.push(temp);

                if (chance != null) {
                    chances.push(chance);
                }

                const item =
                    document.createElement("div");

                item.className = "hour";

                item.innerHTML = `
                    <p>
                        ${i === index
                            ? "지금"
                            : Number(hour) + "시"}
                    </p>

                    <div class="hour-icon">
                        ${icon}
                    </div>

                    <strong>
                        ${temperature(temp)}
                    </strong>
                `;

                hourlyBox.appendChild(item);
            }
        }

        // 기온 그래프

        drawGraph(temperatures);

        // 강수확률

        const rainChance = chances.length
            ? Math.max(...chances)
            : null;

        show(
            "rainChance",
            rainChance == null
                ? "강수확률 --"
                : "최대 강수확률 " + rainChance + "%"
        );

        // 오늘의 외출 팁

        setTip(weather, rainChance);

        // 날씨 기준 시간

        show(
            "updated",
            "현지 날씨 기준 " +
            weather.time.replace("T", " ")
        );

        // 파도 높이

        let waveHeight = null;

        try {

            const marineResponse =
                await fetch(marineUrl);

            const marineData =
                await marineResponse.json();

            if (id !== requestId) return;

            if (marineResponse.ok) {

                waveHeight =
                    marineData.current?.wave_height ?? null;
            }

        } catch (error) {

            console.warn("해양 데이터 요청 실패");
        }

        if (id !== requestId) return;

        showValue(
            "wave",
            round(waveHeight, 1),
            "m"
        );

        show(
            "waveText",
            waveHeight == null
                ? "해양 데이터 없음"
                : "인근 해역 기준"
        );

        // 콘솔 출력

        console.log("API 요청 성공!");
        console.log("조회 지역:", cityName);
        console.log("위도:", lat, "경도:", lng);

        console.table({

            "기온(°C)": weather.temperature_2m,

            "체감 온도(°C)":
                weather.apparent_temperature,

            "습도(%)": humidity,

            "강수량(mm)": rain,

            "기압(hPa)": weather.surface_pressure,

            "적설 깊이(cm)": snow,

            "가시거리(km)": visibility,

            "UV 지수": uv,

            "파도 높이(m)": waveHeight,

            "풍속(m/s)": wind,

            "최대 강수확률(%)": rainChance
        });

    } catch (error) {

        if (id !== requestId) return;

        console.error("API 요청 실패:", error);

        clearWeather();

        show(
            "weatherText",
            "날씨를 불러오지 못했어요."
        );

        show(
            "tipTitle",
            "날씨 정보를 확인할 수 없어요."
        );

        show(
            "tipText",
            "잠시 후 다시 시도해 주세요."
        );

    } finally {

        if (id === requestId) {

            refreshBtn.disabled = false;
        }
    }
}

// 현재 위치 버튼

document.getElementById("locationBtn")
    .addEventListener("click", getLocation);

// 날씨 업데이트 버튼

refreshBtn.addEventListener("click", function() {

    if (selectedLocation) {

        getWeather(
            selectedLocation.lat,
            selectedLocation.lng,
            selectedLocation.name
        );

    } else {

        getLocation();
    }
});

// 처음 접속하면 현재 위치 조회

getLocation();
