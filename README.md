beagleboneblack-mqtt-greenhouse
===============================

The BeagleBone Black Greenhouse
----------------------------------------
This code in javascript enables a BeagleBone Black to use the MQTT protocol to communicate with Sierra Wireless' AirVantage M2M Cloud.
You can use it to send data from sensors to the cloud server, remotely control an actuator by sending from the web portal.


The scenario
----------------------
A botanic company "Eclo" operates multiple greenhouses across the country. They want to monitor the operating condition and to apply corrective action when needed.
In this example, we show how they read the temperature and luminosity sensor values and send command from AirVantage.


Before you start
-------------------------
Before you start, you should have :
* An AirVantage account (if not, apply for a free trial account here: https://signup.airvantage.net/public/avep/)
* Register your BeagleBone Black using its serial number as the identifier, and activate it (check out the "Developer Guide" on doc.airvantage.net for instructions)
* Now, connect your BeagleBone Black to your PC with the USB cable, and connect the Ethernet cable as well
* Launch the Cloud9 IDE on your PC, save the code, and run it


What the code does
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

###3. Write command from AirVantage to BBB

Here we use MQTT "subscribe" to listen to the command from AirVantage. When the BBB receives a message from the server, it will do whatever you want it to.

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
 
###4. Read the sensors value from AirVantage

First, define the 2 variables and the associated analog input pins with the sensors connected.

```javascript
var temperaturePin = "P9_35";
var luminosityPin  = "P9_38";
```

Then, read the sensor values and send them to AirVantage on a regular basis:
* The above actions will be performed once every 60 seconds
* The data names "greenhouse.temperature" and "greenhouse.luminosity" will be what you'll use to identify these parameters on AirVantage
* The try/ catch loops have been added to keep the code going, even there are error when reading the analog input pins
* Finally it uses the MQTT "publish" function to send the read sensor values with the time stamp 

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

What's next
----------------------
Now that you have sent the greenhouse data to AirVantage, log into your AirVantage account and see them
* Go to Monitor/ System
* Click on your BeagleBone Black from the system list
* On the detailed system page, you can use either the "Timeline" or "Data history" to review your data (check out the User Guide for help)
* If you see the data, congratulations! You have succeeded the exercise!

You can now replicate the same setup in multiple locations, and use AirVantage to manage them all