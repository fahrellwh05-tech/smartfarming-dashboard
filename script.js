// =====================================================
// SMART FARMING - MQTT REAL TIME DASHBOARD
// =====================================================

// MQTT WebSocket HiveMQ
const broker = "wss://broker.hivemq.com:8884/mqtt";

// Topic harus sama dengan ESP32
const topic = "smartfarming/lora/data";


// =====================================================
// STATUS AWAL
// =====================================================

let lastDataTime = null;
let lastData = "";


// =====================================================
// MQTT CONNECT
// =====================================================

const client = mqtt.connect(broker, {

    clientId:
        "SmartFarmingWeb_" +
        Math.random().toString(16).substring(2),

    clean: true,

    reconnectPeriod: 3000,

    connectTimeout: 10000
});


// =====================================================
// CONNECTED
// =====================================================

client.on("connect", function () {

    console.log("MQTT Connected");

    setMQTTStatus(true);

    client.subscribe(topic, function (error) {

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


// =====================================================
// RECONNECT
// =====================================================

client.on("reconnect", function () {

    console.log("MQTT reconnecting...");

    setMQTTStatus(false);

});


// =====================================================
// OFFLINE
// =====================================================

client.on("offline", function () {

    console.log("MQTT offline");

    setMQTTStatus(false);

});


// =====================================================
// CLOSE
// =====================================================

client.on("close", function () {

    console.log("MQTT connection closed");

    setMQTTStatus(false);

});


// =====================================================
// ERROR
// =====================================================

client.on("error", function (error) {

    console.error(
        "MQTT ERROR:",
        error
    );

});


// =====================================================
// MQTT STATUS
// =====================================================

function setMQTTStatus(online) {

    const mqttStatus =
        document.getElementById("mqttStatus");

    const connectionText =
        document.getElementById("connectionText");

    const statusDot =
        document.getElementById("statusDot");


    if (online) {

        if (mqttStatus) {
            mqttStatus.innerText = "ONLINE";
        }

        if (connectionText) {
            connectionText.innerText = "Terhubung";
        }

        if (statusDot) {

            statusDot.style.background =
                "#46e19c";

            statusDot.style.boxShadow =
                "0 0 12px #46e19c";
        }

    } else {

        if (mqttStatus) {
            mqttStatus.innerText = "OFFLINE";
        }

        if (connectionText) {
            connectionText.innerText = "Terputus";
        }

        if (statusDot) {

            statusDot.style.background =
                "#ff5c5c";

            statusDot.style.boxShadow =
                "0 0 12px #ff5c5c";
        }

    }

}


// =====================================================
// RECEIVE MQTT DATA
// =====================================================

client.on(
    "message",
    function (receivedTopic, message) {

        // Pastikan topic benar
        if (receivedTopic !== topic) {
            return;
        }


        const data =
            message.toString().trim();


        console.log(
            "DATA DITERIMA:",
            data
        );


        // =================================================
        // CEGAH DATA YANG SAMA DIBACA SEBAGAI DATA BARU
        // =================================================

        if (data === lastData) {

            console.log(
                "Data sama, tidak dianggap update baru."
            );

            return;
        }


        lastData = data;


        // =================================================
        // WAKTU DATA MASUK
        // =================================================

        lastDataTime = new Date();


        const timeString =
            lastDataTime.toLocaleTimeString(
                "id-ID"
            );


        // =================================================
        // TAMPILKAN DATA TERAKHIR
        // =================================================

        const dataElement =
            document.getElementById("data");

        if (dataElement) {

            dataElement.innerText =
                data;
        }


        // =================================================
        // TAMPILKAN WAKTU UPDATE
        // =================================================

        const lastUpdate =
            document.getElementById(
                "lastUpdate"
            );

        if (lastUpdate) {

            lastUpdate.innerText =
                timeString;
        }


        // =================================================
        // PARSING DATA SENSOR
        // =================================================

        parseSensorData(data);


        // =================================================
        // UPDATE INDIKATOR LIVE
        // =================================================

        updateLiveIndicator();

    }
);


// =====================================================
// PARSE DATA SENSOR
// =====================================================
//
// Contoh data:
//
// Suhu=31.58C, Tekanan=1010.94hPa, RH=62.47%
//
// atau:
//
// Soil=75, Suhu=31.5C, RH=62.4%, Pump=ON
//
// =====================================================

function parseSensorData(data) {


    // =================================================
    // SOIL / KELEMBAPAN TANAH
    // =================================================

    let soil = null;


    let soilMatch = data.match(
        /(?:soil\s*moisture|soil|kelembapan\s*tanah)\s*[:=]\s*(-?\d+(?:\.\d+)?)\s*%?/i
    );


    if (soilMatch) {

        soil =
            parseFloat(
                soilMatch[1]
            );

    }


    // =================================================
    // SUHU
    // =================================================

    let temperature = null;


    let tempMatch = data.match(
        /(?:suhu|temperature|temp)\s*[:=]\s*(-?\d+(?:\.\d+)?)\s*(?:°?\s*C)?/i
    );


    if (tempMatch) {

        temperature =
            parseFloat(
                tempMatch[1]
            );

    }


    // =================================================
    // KELEMBAPAN UDARA
    // =================================================

    let humidity = null;


    let humidityMatch = data.match(
        /(?:RH|humidity|air\s*humidity|kelembapan\s*udara)\s*[:=]\s*(-?\d+(?:\.\d+)?)\s*%?/i
    );


    if (humidityMatch) {

        humidity =
            parseFloat(
                humidityMatch[1]
            );

    }


    // =================================================
    // TEKANAN
    // =================================================

    let pressure = null;


    let pressureMatch = data.match(
        /(?:tekanan|pressure)\s*[:=]\s*(-?\d+(?:\.\d+)?)\s*(?:hPa)?/i
    );


    if (pressureMatch) {

        pressure =
            parseFloat(
                pressureMatch[1]
            );

    }


    // =================================================
    // POMPA
    // =================================================

    let pump = null;


    if (
        /(?:pump|pompa)\s*[:=]\s*(?:ON|1|NYALA|AKTIF)/i.test(data)
    ) {

        pump = true;

    }


    if (
        /(?:pump|pompa)\s*[:=]\s*(?:OFF|0|MATI|NONAKTIF)/i.test(data)
    ) {

        pump = false;

    }


    // =================================================
    // UPDATE SOIL
    // =================================================

    if (soil !== null) {

        updateSoil(soil);

    }


    // =================================================
    // UPDATE SUHU
    // =================================================

    if (temperature !== null) {

        const element =
            document.getElementById(
                "temperature"
            );


        if (element) {

            element.innerText =
                temperature.toFixed(2);

        }

    }


    // =================================================
    // UPDATE HUMIDITY
    // =================================================

    if (humidity !== null) {

        const element =
            document.getElementById(
                "humidity"
            );


        if (element) {

            element.innerText =
                humidity.toFixed(2);

        }

    }


    // =================================================
    // UPDATE TEKANAN
    // =================================================

    const pressureElement =
        document.getElementById(
            "pressure"
        );


    if (
        pressureElement &&
        pressure !== null
    ) {

        pressureElement.innerText =
            pressure.toFixed(2);

    }


    // =================================================
    // UPDATE POMPA
    // =================================================

    if (pump !== null) {

        updatePump(pump);

    }


    // =================================================
    // DEBUG
    // =================================================

    console.log(
        "HASIL PARSING:",
        {
            soil: soil,
            temperature: temperature,
            humidity: humidity,
            pressure: pressure,
            pump: pump
        }
    );

}


// =====================================================
// UPDATE SOIL
// =====================================================

function updateSoil(value) {


    value =
        Math.max(
            0,
            Math.min(
                100,
                value
            )
        );


    const soil =
        document.getElementById(
            "soil"
        );


    if (soil) {

        soil.innerText =
            value.toFixed(0);

    }


    const soilBar =
        document.getElementById(
            "soilBar"
        );


    if (soilBar) {

        soilBar.style.width =
            value + "%";

    }


    const status =
        document.getElementById(
            "soilStatus"
        );


    if (!status) {
        return;
    }


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


// =====================================================
// UPDATE POMPA
// =====================================================

function updatePump(isOn) {


    const pump =
        document.getElementById(
            "pumpStatus"
        );


    const description =
        document.getElementById(
            "pumpDescription"
        );


    if (!pump) {
        return;
    }


    if (isOn) {

        pump.innerText =
            "ON";


        pump.classList.remove(
            "off"
        );


        pump.classList.add(
            "on"
        );


        if (description) {

            description.innerText =
                "Pompa sedang menyiram";

        }

    }

    else {

        pump.innerText =
            "OFF";


        pump.classList.remove(
            "on"
        );


        pump.classList.add(
            "off"
        );


        if (description) {

            description.innerText =
                "Pompa tidak aktif";

        }

    }

}


// =====================================================
// LIVE INDICATOR
// =====================================================

function updateLiveIndicator() {


    const liveElement =
        document.querySelector(
            ".live"
        );


    if (!liveElement) {
        return;
    }


    liveElement.innerText =
        "● LIVE";


    liveElement.style.opacity =
        "1";

}


// =====================================================
// CEK DATA TERAKHIR SETIAP 1 DETIK
// =====================================================

setInterval(function () {


    if (!lastDataTime) {
        return;
    }


    const now =
        new Date();


    const difference =
        Math.floor(
            (
                now -
                lastDataTime
            ) / 1000
        );


    const liveElement =
        document.querySelector(
            ".live"
        );


    if (!liveElement) {
        return;
    }


    // =================================================
    // DATA MASIH BARU
    // =================================================

    if (difference <= 5) {

        liveElement.innerText =
            "● LIVE";

        liveElement.style.opacity =
            "1";

    }


    // =================================================
    // DATA TERLAMBAT
    // =================================================

    else if (difference <= 15) {

        liveElement.innerText =
            "● DELAY";

        liveElement.style.opacity =
            "0.7";

    }


    // =================================================
    // DATA SUDAH LAMA
    // =================================================

    else {

        liveElement.innerText =
            "● NO DATA";

        liveElement.style.opacity =
            "0.5";

    }


}, 1000);
