// =====================================================
// MQTT CONFIG
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
// CONNECT
// =====================================================

client.on(
    "connect",
    function () {

        console.log(
            "MQTT Connected"
        );


        document.getElementById(
            "mqttStatus"
        ).innerText =
            "ONLINE";


        document.getElementById(
            "connectionText"
        ).innerText =
            "Terhubung";


        const dot =
            document.getElementById(
                "statusDot"
            );


        dot.style.background =
            "#39e8ae";


        dot.style.boxShadow =
            "0 0 12px #39e8ae";


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

    }
);


// =====================================================
// OFFLINE
// =====================================================

client.on(
    "offline",
    function () {

        document.getElementById(
            "mqttStatus"
        ).innerText =
            "OFFLINE";


        document.getElementById(
            "connectionText"
        ).innerText =
            "Terputus";

    }
);


// =====================================================
// ERROR
// =====================================================

client.on(
    "error",
    function (error) {

        console.error(
            "MQTT ERROR:",
            error
        );

    }
);


// =====================================================
// RECEIVE DATA
// =====================================================

client.on(
    "message",
    function (
        receivedTopic,
        message
    ) {


        if (
            receivedTopic !== topic
        ) {

            return;

        }


        const data =
            message
                .toString()
                .trim();


        console.log(
            "DATA DITERIMA:",
            data
        );


        // Simpan data terakhir

        lastData =
            data;


        // Waktu data diterima

        lastDataTime =
            new Date();


        // =================================================
        // TAMPILKAN DATA MENTAH
        // =================================================

        document.getElementById(
            "data"
        ).innerText =
            data;


        document.getElementById(
            "lastUpdate"
        ).innerText =
            lastDataTime
                .toLocaleTimeString(
                    "id-ID"
                );


        document.getElementById(
            "dataStatus"
        ).innerText =
            "DATA REAL-TIME";


        // =================================================
        // BACA DATA
        // =================================================

        parseData(data);

    }
);


// =====================================================
// PARSE DATA
// =====================================================

function parseData(data) {


    // ============================
    // SUHU
    // ============================

    const suhu =
        data.match(
            /Suhu\s*=\s*(-?\d+(?:\.\d+)?)\s*C/i
        );


    if (suhu) {

        document.getElementById(
            "temperature"
        ).innerText =
            parseFloat(
                suhu[1]
            ).toFixed(2);

    }


    // ============================
    // TEKANAN
    // ============================

    const tekanan =
        data.match(
            /Tekanan\s*=\s*(-?\d+(?:\.\d+)?)\s*hPa/i
        );


    if (tekanan) {

        document.getElementById(
            "pressure"
        ).innerText =
            parseFloat(
                tekanan[1]
            ).toFixed(2);

    }


    // ============================
    // RH
    // ============================

    const rh =
        data.match(
            /RH\s*=\s*(-?\d+(?:\.\d+)?)\s*%/i
        );


    if (rh) {

        document.getElementById(
            "humidity"
        ).innerText =
            parseFloat(
                rh[1]
            ).toFixed(2);

    }


    console.log(
        "HASIL:",
        {
            suhu:
                suhu
                    ? suhu[1]
                    : null,

            tekanan:
                tekanan
                    ? tekanan[1]
                    : null,

            RH:
                rh
                    ? rh[1]
                    : null
        }
    );

}


// =====================================================
// CEK REAL-TIME
// =====================================================

setInterval(
    function () {


        if (
            !lastDataTime
        ) {

            return;

        }


        const seconds =
            Math.floor(
                (
                    new Date() -
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
