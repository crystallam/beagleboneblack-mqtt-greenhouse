beagleboneblack-mqtt-greenhouse
===============================

The BeagleBone Black Greenhouse
----------------------------------------
This code in javascript enables a BeagleBone Black to communicate in the MQTT protocol with Sierra Wireless' AirVantage M2M Cloud.
User can use it to send data from sensors to the cloud server, and remotely control some local actuator by sending a command from AirVantage's web portal.
You can modify the code to commodate any number of sensors, and apply different heartbeat frequency and action to the actuator.

What it does
---------------------
+++1. Download the "Bonescript" & "MQTT" Modules
For running the operations on the Beaglebone Black (like b.AnalogRead), and "MQTT" module to perform the read and write operations with the protocol

+++2. Connect to AirVantage in MQTT
We have provided the code with information of my BBB and my AirVantage account. Please update the following fields below:

```javascript
var port = 1883; //no change to the port
var server = "edge.airvantage.net"; //enter your AirVantage server URL, it should be either "na.airvantage.net" or "eu.airvantage.net"
var serialnumber = "5001BBBK7520"; //enter your BBB serial no. here. go to url: http://192.168.7.2/Support/BoneScript/getPlatform/, run it, and note down the serial no.
var password = "1234"; //enter the password of your choice
```

+++3. Start the MQTT client & listen for a command from the AirVantage server

Here we "subscribe" to the tasks topic. When it receives a message, print something.

```javascript
client.on('connect', function() { // When connected

  // subscribe to tasks topic and display the message
  client.subscribe(serialnumber + '/tasks/json', function() {
    // when a message arrives, do something with it
    client.on('message', function(topic, message) {
      console.log("Received '" + message + "' on '" + topic + "'");
    });
  });
});
```
 
+++4. Send command message from AirVantage to BBB

Here we say, we want to define 2 parameters, and we will connect the associated sensors to the pin 35 and 38 on the Header P9.

```javascript
var temperaturePin = "P9_35";
var luminosityPin  = "P9_38";
```

+++4. Read the sensors value from AirVantage

We want to read the sensor value in this session:
..* Every 60 seconds (you can update the frequency as you like, see the end of this section)
..* Define the data names "greenhouse.temperature" and "greenhouse.luminosity" that you'll use to identify the data with you AirVantage application model
..* A try loop has been integrated, such that if there is any error when reading the analog inputs, the code will still move on
..* We then use the MQTT "publish" function to send the timestamp and the sensor values to AirVantage

```javascript
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
```


