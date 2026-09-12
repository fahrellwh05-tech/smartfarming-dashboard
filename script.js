// =====================================================
// SMART FARMING - MQTT REAL TIME
// =====================================================

const broker =
    "wss://broker.hivemq.com:8884/mqtt";

const topic =
    "smartfarming/lora/data";


let lastData = "";
let lastDataTime = null;


// =====================================================
// MQTT CONNECT
// =====================================================

const client = mqtt.connect(
    broker,
    {

        clientId:
            "SmartFarmingWeb_" +
            Math.random()
                .toString(16)
                .substring(2),

        clean: true,

        reconnectPeriod: 3000,

        connectTimeout: 10000

    }
);


// =====================================================
// CONNECTED
// =====================================================

client.on("connect", function () {

    console.log(
        "MQTT Connected"
    );


    setMQTTStatus(true);


    client.subscribe(
        topic,
        function (error) {

            if (error) {

                console.error(
                    "Subscribe gagal:",
                    error
                );

            }

            else {

                console.log(
                    "Subscribe berhasil:",
                    topic
                );

            }

        }
    );

});


// =====================================================
// RECONNECT
// =====================================================

client.on("reconnect", function () {

    console.log(
        "MQTT reconnecting..."
    );

    setMQTTStatus(false);

});


// =====================================================
// OFFLINE
// =====================================================

client.on("offline", function () {

    console.log(
        "MQTT offline"
    );

    setMQTTStatus(false);

});


// =====================================================
// CLOSE
// =====================================================

client.on("close", function () {

    console.log(
        "MQTT connection closed"
    );

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
        document.getElementById(
            "mqttStatus"
        );

    const connectionText =
        document.getElementById(
            "connectionText"
        );

    const statusDot =
        document.getElementById(
            "statusDot"
        );


    if (online) {

        mqttStatus.innerText =
            "ONLINE";

        connectionText.innerText =
            "Terhubung";

        statusDot.style.background =
            "#46e19c";

        statusDot.style.boxShadow =
            "0 0 12px #46e19c";

    }

    else {

        mqttStatus.innerText =
            "OFFLINE";

        connectionText.innerText =
            "Terputus";

        statusDot.style.background =
            "#ff5c5c";

        statusDot.style.boxShadow =
            "0 0 12px #ff5c5c";

    }

}


// =====================================================
// TERIMA DATA MQTT
// =====================================================

client.on(
    "message",
    function (
        receivedTopic,
        message
    ) {


        // Pastikan topic sesuai

        if (
            receivedTopic !== topic
        ) {

            return;

        }


        // Ambil data

        const data =
            message
                .toString()
                .trim();


        console.log(
            "DATA DITERIMA:",
            data
        );


        // =================================================
        // JIKA DATA SAMA
        // =================================================

        if (
            data === lastData
        ) {

            console.log(
                "Data sama - tidak ada perubahan."
            );

            return;

        }


        // Simpan data terbaru

        lastData =
            data;


        // Waktu data benar-benar diterima

        lastDataTime =
            new Date();


        // =================================================
        // TAMPILKAN DATA
        // =================================================

        const dataElement =
            document.getElementById(
                "data"
            );


        if (dataElement) {

            dataElement.innerText =
                data;

        }


        // =================================================
        // WAKTU
        // =================================================

        const lastUpdate =
            document.getElementById(
                "lastUpdate"
            );


        if (lastUpdate) {

            lastUpdate.innerText =
                lastDataTime
                    .toLocaleTimeString(
                        "id-ID"
                    );

        }


        // =================================================
        // STATUS DATA
        // =================================================

        const dataStatus =
            document.getElementById(
                "dataStatus"
            );


        if (dataStatus) {

            dataStatus.innerText =
                "DATA BARU DITERIMA";

        }


        // =================================================
        // PARSING SENSOR
        // =================================================

        parseSensorData(
            data
        );


        // =================================================
        // LIVE
        // =================================================

        updateLiveIndicator();

    }
);


// =====================================================
// PARSING SENSOR
// =====================================================

function parseSensorData(
    data
) {


    let soil = null;

    let temperature = null;

    let humidity = null;

    let pressure = null;

    let pump = null;



    // =================================================
    // SOIL
    // =================================================

    const soilMatch =
        data.match(
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

    const tempMatch =
        data.match(
            /(?:suhu|temperature|temp)\s*[:=]\s*(-?\d+(?:\.\d+)?)\s*(?:°?\s*C)?/i
        );


    if (tempMatch) {

        temperature =
            parseFloat(
                tempMatch[1]
            );

    }



    // =================================================
    // RH
    // =================================================

    const humidityMatch =
        data.match(
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

    const pressureMatch =
        data.match(
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

    if (
        /(?:pump|pompa)\s*[:=]\s*(?:ON|1|NYALA|AKTIF)/i
            .test(data)
    ) {

        pump = true;

    }


    if (
        /(?:pump|pompa)\s*[:=]\s*(?:OFF|0|MATI|NONAKTIF)/i
            .test(data)
    ) {

        pump = false;

    }



    // =================================================
    // UPDATE DISPLAY
    // =================================================

    if (
        soil !== null
    ) {

        updateSoil(
            soil
        );

    }


    if (
        temperature !== null
    ) {

        document
            .getElementById(
                "temperature"
            )
            .innerText =
            temperature.toFixed(2);

    }


    if (
        humidity !== null
    ) {

        document
            .getElementById(
                "humidity"
            )
            .innerText =
            humidity.toFixed(2);

    }


    if (
        pressure !== null
    ) {

        document
            .getElementById(
                "pressure"
            )
            .innerText =
            pressure.toFixed(2);

    }


    if (
        pump !== null
    ) {

        updatePump(
            pump
        );

    }


    console.log(
        "HASIL PARSING:",
        {
            soil,
            temperature,
            humidity,
            pressure,
            pump
        }
    );

}


// =====================================================
// SOIL
// =====================================================

function updateSoil(
    value
) {

    value =
        Math.max(
            0,
            Math.min(
                100,
                value
            )
        );


    document
        .getElementById(
            "soil"
        )
        .innerText =
        value.toFixed(0);


    document
        .getElementById(
            "soilBar"
        )
        .style.width =
        value + "%";


    const status =
        document.getElementById(
            "soilStatus"
        );


    if (
        value < 30
    ) {

        status.innerText =
            "Tanah sangat kering";

    }

    else if (
        value < 60
    ) {

        status.innerText =
            "Tanah cukup kering";

    }

    else if (
        value < 80
    ) {

        status.innerText =
            "Kelembapan normal";

    }

    else {

        status.innerText =
            "Tanah sangat lembap";

    }

}


// =====================================================
// POMPA
// =====================================================

function updatePump(
    isOn
) {

    const pump =
        document.getElementById(
            "pumpStatus"
        );


    const description =
        document.getElementById(
            "pumpDescription"
        );


    if (isOn) {

        pump.innerText =
            "ON";

        pump.classList.remove(
            "off"
        );

        pump.classList.add(
            "on"
        );

        description.innerText =
            "Pompa sedang menyiram";

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

        description.innerText =
            "Pompa tidak aktif";

    }

}


// =====================================================
// LIVE INDICATOR
// =====================================================

function updateLiveIndicator() {

    const liveText =
        document.getElementById(
            "liveText"
        );


    if (liveText) {

        liveText.innerText =
            "LIVE";

    }

}


// =====================================================
// CEK UMUR DATA
// =====================================================

setInterval(
    function () {


        if (
            !lastDataTime
        ) {

            return;

        }


        const now =
            new Date();


        const seconds =
            Math.floor(
                (
                    now -
                    lastDataTime
                ) / 1000
            );


        const liveText =
            document.getElementById(
                "liveText"
            );


        const dataStatus =
            document.getElementById(
                "dataStatus"
            );


        if (
            seconds <= 5
        ) {

            liveText.innerText =
                "LIVE";

            dataStatus.innerText =
                "DATA REAL-TIME";

        }

        else if (
            seconds <= 15
        ) {

            liveText.innerText =
                "DELAY";

            dataStatus.innerText =
                "MENUNGGU DATA BARU";

        }

        else {

            liveText.innerText =
                "NO DATA";

            dataStatus.innerText =
                "DATA TIDAK DIPERBARUI";

        }


    },
    1000
);
