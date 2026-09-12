// ==========================================
// MQTT CONFIGURATION
// ==========================================

const broker = "wss://broker.hivemq.com:8884/mqtt";

const topic = "smartfarming/lora/data";


// ==========================================
// CONNECT MQTT
// ==========================================

const client = mqtt.connect(broker, {

    clientId:
        "SmartFarmingWeb_" +
        Math.random()
            .toString(16)
            .substring(2),

    clean: true,

    reconnectPeriod: 3000
});


// ==========================================
// MQTT CONNECTED
// ==========================================

client.on("connect", () => {

    console.log("MQTT CONNECTED");

    document.getElementById("mqttStatus")
        .innerText = "ONLINE";

    document.getElementById("connectionText")
        .innerText = "Terhubung";

    document.getElementById("statusDot")
        .style.background = "#46e19c";

    document.getElementById("statusDot")
        .style.boxShadow = "0 0 12px #46e19c";


    client.subscribe(topic, (error) => {

        if (error) {

            console.error(
                "Subscribe gagal:",
                error
            );

        } else {

            console.log(
                "Subscribe berhasil:",
                topic
            );

        }

    });

});


// ==========================================
// MQTT DISCONNECTED
// ==========================================

client.on("offline", () => {

    document.getElementById("mqttStatus")
        .innerText = "OFFLINE";

    document.getElementById("connectionText")
        .innerText = "Terputus";

    document.getElementById("statusDot")
        .style.background = "#ff5c5c";

    document.getElementById("statusDot")
        .style.boxShadow = "0 0 12px #ff5c5c";

});


// ==========================================
// MQTT ERROR
// ==========================================

client.on("error", (error) => {

    console.error(
        "MQTT ERROR:",
        error
    );

});


// ==========================================
// RECEIVE DATA
// ==========================================

client.on("message", (receivedTopic, message) => {

    const data = message.toString().trim();

    console.log(
        "DATA DITERIMA:",
        data
    );


    // Tampilkan data asli

    document.getElementById("data")
        .innerText = data;


    // Waktu

    const now = new Date();

    document.getElementById("lastUpdate")
        .innerText =
        now.toLocaleTimeString("id-ID");


    // Coba membaca nilai sensor

    parseSensorData(data);

});


// ==========================================
// PARSE SENSOR DATA
// ==========================================

function parseSensorData(data) {

    let soil = null;

    let temperature = null;

    let humidity = null;

    let pump = null;


    // ======================================
    // SOIL MOISTURE
    // Contoh:
    // Soil: 75
    // Soil Moisture: 75%
    // Kelembapan: 75
    // ======================================

    let soilMatch = data.match(
        /(?:soil|soil moisture|kelembapan tanah)\s*[:=]\s*(\d+(?:\.\d+)?)/i
    );

    if (soilMatch) {

        soil = parseFloat(
            soilMatch[1]
        );

    }


    // ======================================
    // TEMPERATURE
    // Contoh:
    // Temperature: 28.5
    // Suhu: 28.5
    // ======================================

    let tempMatch = data.match(
        /(?:temperature|temp|suhu)\s*[:=]\s*(-?\d+(?:\.\d+)?)/i
    );

    if (tempMatch) {

        temperature =
            parseFloat(
                tempMatch[1]
            );

    }


    // ======================================
    // HUMIDITY
    // Contoh:
    // Humidity: 70
    // Kelembapan Udara: 70
    // ======================================

    let humidityMatch = data.match(
        /(?:humidity|air humidity|kelembapan udara)\s*[:=]\s*(\d+(?:\.\d+)?)/i
    );

    if (humidityMatch) {

        humidity =
            parseFloat(
                humidityMatch[1]
            );

    }


    // ======================================
    // PUMP
    // ======================================

    if (
        /pump\s*[:=]\s*(on|1|nyala|aktif)/i.test(data)
        ||
        /pompa\s*[:=]\s*(on|1|nyala|aktif)/i.test(data)
    ) {

        pump = true;

    }


    if (
        /pump\s*[:=]\s*(off|0|mati|nonaktif)/i.test(data)
        ||
        /pompa\s*[:=]\s*(off|0|mati|nonaktif)/i.test(data)
    ) {

        pump = false;

    }


    // ======================================
    // UPDATE DISPLAY
    // ======================================

    if (soil !== null) {

        updateSoil(soil);

    }


    if (temperature !== null) {

        document.getElementById("temperature")
            .innerText =
            temperature.toFixed(1);

    }


    if (humidity !== null) {

        document.getElementById("humidity")
            .innerText =
            humidity.toFixed(1);

    }


    if (pump !== null) {

        updatePump(pump);

    }

}


// ==========================================
// UPDATE SOIL
// ==========================================

function updateSoil(value) {

    value = Math.max(
        0,
        Math.min(100, value)
    );


    document.getElementById("soil")
        .innerText =
        value.toFixed(0);


    document.getElementById("soilBar")
        .style.width =
        value + "%";


    let status =
        document.getElementById(
            "soilStatus"
        );


    if (value < 30) {

        status.innerText =
            "Tanah sangat kering";

    }

    else if (value < 60) {

        status.innerText =
            "Tanah cukup kering";

    }

    else if (value < 80) {

        status.innerText =
            "Kelembapan normal";

    }

    else {

        status.innerText =
            "Tanah sangat lembap";

    }

}


// ==========================================
// UPDATE PUMP
// ==========================================

function updatePump(isOn) {

    const pump =
        document.getElementById(
            "pumpStatus"
        );

    const description =
        document.getElementById(
            "pumpDescription"
        );


    if (isOn) {

        pump.innerText = "ON";

        pump.classList.remove("off");

        pump.classList.add("on");

        description.innerText =
            "Pompa sedang menyiram";

    }

    else {

        pump.innerText = "OFF";

        pump.classList.remove("on");

        pump.classList.add("off");

        description.innerText =
            "Pompa tidak aktif";

    }

}
