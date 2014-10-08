var b = require('bonescript');
var mqtt = require('mqtt');

// Configuration to adapt
var port = 1883;
var server = "na.airvantage.net";
var serialnumber = "5001BBBK7520"; // Serialnumber of my BBB
var password = "1234";

// Connect to AirVantage
var client = mqtt.createClient(port, server, {
        username: serialnumber, 
        password: password
});

console.log("Client started");

client.on('connect', function() { // When connected

  // subscribe to tasks topic and display the message
  client.subscribe(serialnumber + '/tasks/json', function() {
    // when a message arrives, do something with it
    client.on('message', function(topic, message) {
      console.log("Received '" + message + "' on '" + topic + "'");
    });
  });
});

// Assign analog sensor input pins
var temperaturePin = "P9_35";
var luminosityPin  = "P9_38";

// Read IO each second and send the values to AirVantage.
setInterval( function loop() {
    
    var values = {};

    // Read sensor values
    try {
        var temperatureValue = b.analogRead(temperaturePin);
        values["greenhouse.temperature"] = temperatureValue;
    } catch (err) {
        console.log("Error while reading " + temperaturePin + " : " + err);
    }
    
    try {
        var luminosityValue  = b.analogRead(luminosityPin);
        values["greenhouse.luminosity"] = luminosityValue;
    } catch (err) {
        console.log("Error while reading " + luminosityPin + " : " + err);
    }
    
    // Format payload of the message
    var timestamp = new Date().getTime()+'';
    var payload= {};
    payload[timestamp] = values;

    // Publish a message to a topic
    client.publish(serialnumber + '/messages/json', JSON.stringify(payload));
    console.log(payload);
}
, 60*1000);

// END