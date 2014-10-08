beagleboneblack-mqtt-greenhouse
===============================

The BeagleBone Black Greenhouse
----------------------------------------
This code in javascript enables a BeagleBone Black to communicate in the MQTT protocol with Sierra Wireless' AirVantage M2M Cloud.
User can use it to send data from sensors to the cloud server, and remotely control some local actuator by sending a command from AirVantage's web portal.
You can modify the code to commodate any number of sensors, and apply different heartbeat frequency and action to the actuator.


The scenario
----------------------
A botanic company "Eclo" operates multiple greenhouses across the country. They want to monitor the operating condition and to apply corrective action when needed.
In this example, we show how they read the temperature and luminosity sensor values and send command from AirVantage.


What it does
---------------------
###1. Download the "Bonescript" & "MQTT" Modules
For running the operations on the Beaglebone Black (like b.AnalogRead), and "MQTT" module to perform the read and write operations with the protocol

###2. Connect to AirVantage in MQTT
We have provided the code with information of my BBB and my AirVantage account. Please update the following fields below:

```javascript
var port = 1883; //no change to the port
var server = "edge.airvantage.net"; //enter your AirVantage server URL, it should be either "na.airvantage.net" or "eu.airvantage.net"
var serialnumber = "5001BBBK7520"; //enter your BBB serial no. here. go to url: http://192.168.7.2/Support/BoneScript/getPlatform/, run it, and note down the serial no.
var password = "1234"; //enter the password of your choice
```

###3. Start the MQTT client & listen for a command from the AirVantage server

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
 
###4. Send command message from AirVantage to BBB

Here we want to define 2 parameters and the associated analog input pins with the sensors connected.

```javascript
var temperaturePin = "P9_35";
var luminosityPin  = "P9_38";
```

###5. Read the sensors value from AirVantage

Here we want to read the sensor values on a regular basis:
* The analog input pins will be read, and the values will be "published" every 60 seconds
* Please note that we have declared the data names "greenhouse.temperature" and "greenhouse.luminosity" that you'll use to identify these parameters later on AirVantage
* The try/ catch has been added, such that even there may be error when reading the input values, the code will still move on
* We then use the MQTT "publish" function to send the read sensor values with the time stamp 

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


