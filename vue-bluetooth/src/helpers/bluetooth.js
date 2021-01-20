export default {
  count: 0,
  service: null,
  server: null,
  characteristic: null,
  async initialize(configuration, handler) {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          {
            name: "BT05",
          },
        ],
        optionalServices: [0xffe0],
      });

      this.server = await device.gatt.connect();
    } catch (error) {
      console.error("Error in initial setup");
      console.error(error.message);
    }
    try {
      this.service = await this.server.getPrimaryService(
        configuration.serviceId || 0xffe0
      );
      this.characteristic = await this.service.getCharacteristic(
        configuration.characteristicId || 0xffe1
      );
      await this.characteristic.startNotifications();
      await this.characteristic.addEventListener(
        "characteristicvaluechanged",
        handler
      );
      console.log("Notifications have been started: ", this.characteristic);
      await sleep(500);
      this.send("Hi from web"); // Arduino is expecting this message as part of the initial handshake.
      return this.characteristic;
    } catch (error) {
      console.error("Error in characteristic setup and handshake");
      console.error(error.message);
    }
  },
  send(message) {
    let enc = new TextEncoder(); // By default this encodes to utf-8
    // Why the <opening and closing> characters?
    // Went with this guy's example 3 for the reasons he mentions: https://forum.arduino.cc/index.php?topic=396450.0
    this.characteristic.writeValue(enc.encode(`<${message}>`));
  },
};
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
