const broker = "wss://broker.hivemq.com:8884/mqtt";
const topic = "smartfarming/lora/data";

const client = mqtt.connect(broker);

client.on("connect", () => {
    console.log("MQTT Connected");

    client.subscribe(topic, (err) => {
        if (!err) {
            console.log("Subscribe berhasil:", topic);
        }
    });
});

client.on("message", (topic, message) => {
    const data = message.toString();

    console.log("Data diterima:", data);

    document.getElementById("data").innerText = data;
});

client.on("error", (error) => {
    console.log("MQTT Error:", error);
});