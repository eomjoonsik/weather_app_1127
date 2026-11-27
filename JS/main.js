
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


// 주요 도시 및 유명 지역 목록
const cityList = [
    ["서울", "대한민국", 37.5665, 126.9780],
    ["인천", "대한민국", 37.4563, 126.7052],
    ["부산", "대한민국", 35.1796, 129.0756],
    ["대구", "대한민국", 35.8714, 128.6014],
    ["대전", "대한민국", 36.3504, 127.3845],
    ["광주", "대한민국", 35.1595, 126.8526],
    ["울산", "대한민국", 35.5384, 129.3114],
    ["세종", "대한민국", 36.4800, 127.2890],
    ["제주", "제주특별자치도", 33.4996, 126.5312],
    ["서귀포", "제주특별자치도", 33.2541, 126.5600],

    ["송도", "인천 연수구", 37.3826, 126.6560],
    ["청라", "인천 서구", 37.5320, 126.6440],
    ["부평", "인천 부평구", 37.5070, 126.7218],
    ["구월동", "인천 남동구", 37.4490, 126.7070],
    ["영종도", "인천 중구", 37.4900, 126.5200],
    ["강화도", "인천 강화군", 37.7460, 126.4880],

    ["강남", "서울 강남구", 37.4979, 127.0276],
    ["홍대", "서울 마포구", 37.5572, 126.9245],
    ["성수", "서울 성동구", 37.5445, 127.0560],
    ["잠실", "서울 송파구", 37.5133, 127.1000],
    ["신도림", "서울 구로구", 37.5088, 126.8912],
    ["여의도", "서울 영등포구", 37.5219, 126.9245],
    ["명동", "서울 중구", 37.5636, 126.9850],
    ["이태원", "서울 용산구", 37.5345, 126.9946],
    ["해운대", "부산 해운대구", 35.1631, 129.1635],
    ["광안리", "부산 수영구", 35.1532, 129.1187],

    ["수원", "경기도", 37.2636, 127.0286],
    ["성남", "경기도", 37.4200, 127.1265],
    ["고양", "경기도", 37.6584, 126.8320],
    ["용인", "경기도", 37.2411, 127.1776],
    ["부천", "경기도", 37.5034, 126.7660],
    ["안양", "경기도", 37.3943, 126.9568],
    ["안산", "경기도", 37.3219, 126.8309],
    ["김포", "경기도", 37.6153, 126.7156],
    ["파주", "경기도", 37.7600, 126.7800],
    ["화성", "경기도", 37.1995, 126.8312],
    ["평택", "경기도", 36.9921, 127.1129],
    ["시흥", "경기도", 37.3800, 126.8029],
    ["남양주", "경기도", 37.6360, 127.2165],
    ["의정부", "경기도", 37.7381, 127.0337],
    ["하남", "경기도", 37.5393, 127.2148],
    ["광주", "경기도", 37.4294, 127.2550],
    ["이천", "경기도", 37.2720, 127.4350],
    ["양주", "경기도", 37.7853, 127.0458],
    ["동두천", "경기도", 37.9034, 127.0605],
    ["과천", "경기도", 37.4292, 126.9876],
    ["군포", "경기도", 37.3616, 126.9352],
    ["의왕", "경기도", 37.3447, 126.9683],

    ["춘천", "강원특별자치도", 37.8813, 127.7298],
    ["강릉", "강원특별자치도", 37.7519, 128.8761],
    ["원주", "강원특별자치도", 37.3422, 127.9202],
    ["속초", "강원특별자치도", 38.2070, 128.5918],
    ["동해", "강원특별자치도", 37.5247, 129.1143],

    ["청주", "충청북도", 36.6424, 127.4890],
    ["충주", "충청북도", 36.9910, 127.9259],
    ["제천", "충청북도", 37.1326, 128.1909],
    ["천안", "충청남도", 36.8151, 127.1139],
    ["아산", "충청남도", 36.7898, 127.0018],
    ["논산", "충청남도", 36.1872, 127.0987],
    ["공주", "충청남도", 36.4465, 127.1190],
    ["서산", "충청남도", 36.7849, 126.4503],

    ["전주", "전북특별자치도", 35.8242, 127.1480],
    ["군산", "전북특별자치도", 35.9677, 126.7369],
    ["익산", "전북특별자치도", 35.9483, 126.9576],
    ["목포", "전라남도", 34.8118, 126.3922],
    ["여수", "전라남도", 34.7604, 127.6622],
    ["순천", "전라남도", 34.9506, 127.4872],
    ["나주", "전라남도", 35.0158, 126.7108],

    ["포항", "경상북도", 36.0190, 129.3435],
    ["경주", "경상북도", 35.8562, 129.2247],
    ["구미", "경상북도", 36.1195, 128.3446],
    ["안동", "경상북도", 36.5684, 128.7294],
    ["창원", "경상남도", 35.2280, 128.6811],
    ["김해", "경상남도", 35.2285, 128.8894],
    ["진주", "경상남도", 35.1799, 128.1076],
    ["거제", "경상남도", 34.8806, 128.6211],
    ["통영", "경상남도", 34.8544, 128.4332],
    ["양산", "경상남도", 35.3350, 129.0370],

    // 해외 주요 도시
    ["뉴욕", "미국", 40.7128, -74.0060],
    ["로스앤젤레스", "미국", 34.0522, -118.2437],
    ["샌프란시스코", "미국", 37.7749, -122.4194],
    ["시카고", "미국", 41.8781, -87.6298],
    ["라스베이거스", "미국", 36.1699, -115.1398],
    ["하와이 호놀룰루", "미국", 21.3069, -157.8583],

    ["도쿄", "일본", 35.6762, 139.6503],
    ["오사카", "일본", 34.6937, 135.5023],
    ["후쿠오카", "일본", 33.5902, 130.4017],
    ["삿포로", "일본", 43.0618, 141.3545],
    ["나고야", "일본", 35.1815, 136.9066],
    ["교토", "일본", 35.0116, 135.7681],
    ["오키나와 나하", "일본", 26.2124, 127.6809],

    ["베이징", "중국", 39.9042, 116.4074],
    ["상하이", "중국", 31.2304, 121.4737],
    ["칭다오", "중국", 36.0671, 120.3826],
    ["홍콩", "홍콩", 22.3193, 114.1694],
    ["타이베이", "대만", 25.0330, 121.5654],

    ["방콕", "태국", 13.7563, 100.5018],
    ["치앙마이", "태국", 18.7883, 98.9853],
    ["다낭", "베트남", 16.0544, 108.2022],
    ["하노이", "베트남", 21.0278, 105.8342],
    ["호찌민", "베트남", 10.8231, 106.6297],
    ["싱가포르", "싱가포르", 1.3521, 103.8198],
    ["쿠알라룸푸르", "말레이시아", 3.1390, 101.6869],
    ["마닐라", "필리핀", 14.5995, 120.9842],
    ["뉴델리", "인도", 28.6139, 77.2090],
    ["두바이", "아랍에미리트", 25.2048, 55.2708],

    ["런던", "영국", 51.5074, -0.1278],
    ["파리", "프랑스", 48.8566, 2.3522],
    ["로마", "이탈리아", 41.9028, 12.4964],
    ["밀라노", "이탈리아", 45.4642, 9.1900],
    ["베를린", "독일", 52.5200, 13.4050],
    ["마드리드", "스페인", 40.4168, -3.7038],
    ["바르셀로나", "스페인", 41.3851, 2.1734],
    ["암스테르담", "네덜란드", 52.3676, 4.9041],
    ["프라하", "체코", 50.0755, 14.4378],
    ["빈", "오스트리아", 48.2082, 16.3738],
    ["시드니", "호주", -33.8688, 151.2093],
    ["멜버른", "호주", -37.8136, 144.9631],
    ["토론토", "캐나다", 43.6532, -79.3832],
    ["밴쿠버", "캐나다", 49.2827, -123.1207]
];

// 초성 검색 기능

const consonants = [
    "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ",
    "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
    "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ",
    "ㅋ", "ㅌ", "ㅍ", "ㅎ"
];

function getInitial(text) {

    return [...text].map(char => {

        const code = char.charCodeAt(0) - 44032;

        if (code >= 0 && code <= 11171) {

            return consonants[Math.floor(code / 588)];
        }

        return char;

    }).join("");
}

// 검색어 일치 여부

function matchesCity(name, keyword) {

    name = name.replace(/\s/g, "").toLowerCase();
    keyword = keyword.replace(/\s/g, "").toLowerCase();

    if (name.includes(keyword)) return true;

    const chars = [...keyword];

    return [...name].some((_, start) => {

        return chars.every((char, i) => {

            const target = name[start + i];

            if (!target) return false;

            if (consonants.includes(char)) {
                return getInitial(target) === char;
            }

            return target === char;
        });
    });
}

// 검색 타이머

let searchTimer;
let currentSuggestions = [];

// 검색 결과 선택

function selectPlace(place) {

    clearTimeout(searchTimer);

    searchId++;

    searchResults.hidden = true;

    cityInput.value = place[0];

    currentSuggestions = [];

    getWeather(
        place[2],
        place[3],
        place[0] + ", " + place[1]
    );
}

// 검색 결과 화면에 표시

function renderSuggestions(results) {

    currentSuggestions = results.slice(0, 5);

    searchResults.innerHTML = "";
    searchResults.hidden = false;

    if (!currentSuggestions.length) {

        searchResults.innerHTML =
            '<p class="search-message">검색 결과가 없어요.</p>';

        return;
    }

    currentSuggestions.forEach(place => {

        const button = document.createElement("button");
        const title = document.createElement("strong");
        const detail = document.createElement("small");

        button.type = "button";

        title.textContent = place[0];
        detail.textContent = place[1];

        button.appendChild(title);
        button.appendChild(detail);

        button.addEventListener("click", function() {
            selectPlace(place);
        });

        searchResults.appendChild(button);
    });
}

// 실시간 추천 검색

function updateSuggestions() {

    clearTimeout(searchTimer);

    const id = ++searchId;

    const keyword = cityInput.value.trim();

    // 검색창이 비어 있으면 주요 도시 추천

    if (!keyword) {

        renderSuggestions(cityList.slice(0, 5));

        return;
    }

    // 등록된 주요 도시에서 먼저 검색

    const results = cityList.filter(place =>
        matchesCity(place[0], keyword)
    );

    // 정확히 일치하는 도시 우선 표시

    results.sort((a, b) => {

        const score = name => {

            if (name === keyword) return 3;
            if (name.startsWith(keyword)) return 2;
            if (getInitial(name).startsWith(keyword)) return 1;

            return 0;
        };

        return score(b[0]) - score(a[0]);
    });

    if (results.length > 0) {

        renderSuggestions(results);

        return;
    }

    // 초성만 입력했을 때는 API 요청하지 않음

    if (
        /^[ㄱ-ㅎ]+$/.test(keyword) ||
        keyword.length < 2
    ) {

        renderSuggestions([]);

        return;
    }

    // 등록되지 않은 지역은 API로 추가 검색

    currentSuggestions = [];

    searchResults.hidden = false;

    searchResults.innerHTML =
        '<p class="search-message">지역 검색 중...</p>';

    searchTimer = setTimeout(async function() {

        try {

            const url =
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(keyword)}&count=30&language=ko&format=json`;

            const response = await fetch(url);
            const data = await response.json();

            if (id !== searchId) return;

            if (!response.ok) {
                throw new Error("검색 실패");
            }

            // 작은 마을은 제외하고 주요 도시만 표시

            const places = (data.results || [])
                .filter(place => {

                    const code = place.feature_code || "";

                    return [
                        "PPLC",
                        "PPLA",
                        "PPLA2",
                        "PPLA3",
                        "ADM1",
                        "ADM2"
                    ].includes(code) ||
                        (
                            code === "PPL" &&
                            (place.population || 0) >= 10000
                        );
                })
                .sort((a, b) =>
                    (b.population || 0) -
                    (a.population || 0)
                );

            const seen = new Set();

            const filtered = places.filter(place => {

                const key = place.id ??
                    `${place.latitude},${place.longitude}`;

                if (seen.has(key)) return false;

                seen.add(key);

                return true;
            });

            const suggestions = filtered.map(place => [

                place.name,

                [...new Set([
                    place.admin2,
                    place.admin1,
                    place.country
                ].filter(value =>
                    value && value !== place.name
                ))].join(", "),

                place.latitude,
                place.longitude
            ]);

            renderSuggestions(suggestions);

        } catch (error) {

            if (id !== searchId) return;

            console.error(error);

            searchResults.innerHTML =
                '<p class="search-message">검색에 실패했어요.</p>';
        }

    }, 350);
}

// 입력하는 순간 자동완성

cityInput.addEventListener("input", updateSuggestions);

// 한글 입력 완료 시 추천 갱신

cityInput.addEventListener(
    "compositionend",
    updateSuggestions
);

// 검색창 클릭 시 추천 지역 표시

cityInput.addEventListener("focus", updateSuggestions);

// 엔터 또는 검색 버튼 클릭 시 첫 번째 결과 조회

searchForm.addEventListener("submit", function(event) {

    event.preventDefault();

    if (!cityInput.value.trim()) return;

    if (currentSuggestions.length > 0) {

        selectPlace(currentSuggestions[0]);

    } else {

        updateSuggestions();
    }
});

// 검색창 바깥 클릭 시 닫기

document.addEventListener("click", function(event) {

    if (!event.target.closest(".search-wrap")) {

        clearTimeout(searchTimer);

        searchId++;

        searchResults.hidden = true;
        currentSuggestions = [];
    }
});

// ESC 키로 검색 결과 닫기

document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {

        clearTimeout(searchTimer);

        searchId++;

        searchResults.hidden = true;
        currentSuggestions = [];
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
