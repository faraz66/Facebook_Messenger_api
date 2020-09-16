//Installing Dependencies
express =require('express'),
bodyParser =require("body-parser"),
app =express().use(bodyParser.json())  // creates express http 
require('dotenv').config();
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const request = require('request');
var exphbs  = require('express-handlebars');
const websocket = require("./Websocket");



//Sets server port and logs messages on success
app.listen(process.env.PORT || 1337,() =>
    console.log("Webhook Listening"));
// creating an endpoint for webhook
 app.post('/webhook', (req, res) => {  
  console.log("Data Obtained",req.body);
  // Parse the request body from the POST
  let body = req.body;

  if (body.object === 'page') {

    body.entry.forEach(function(entry) {

      let webhook_event = entry.messaging[0];
      let sender_psid = webhook_event.sender.id;
      // pass the event to the appropriate handler function
      if (webhook_event.message) {               // if user sends a message
        handleMessage(sender_psid, webhook_event.message);        
      } 
    
    });

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
  
});
// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "slashrtc"
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
  
});


//app.js
async function handleMessage(sender_psid, received_message) {    
// Check if the message contains text
  if (received_message.text) 
  {    
    await socket(received_message.text,sender_psid);
  }
    
}
// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
    let response;
    // Get the payload for the postback
    let payload = received_postback.payload;
    // Set the response based on the postback payload
    if (payload === 'yes') {
      response = { "text": "Thanks!" }
    } else if (payload === 'no') {
      response = { "text": "Oops, try sending another image." }
    }
    // Send the message to acknowledge the postback
    //callSendAPI(sender_psid, response);
}


// Sends response messages via the Send API
// function callSendAPI(sender_psid, response) {
// // Construct the message body
//   let request_body = {
//     "recipient": {
//       "id": sender_psid
//     },
//     "message": response,
//    // "quick_replies":"this is a quick_reply"
//   }
//    // Send the HTTP request to the Messenger Platform
//    request({
//     "uri": "https://graph.facebook.com/v2.6/me/messages",
//     "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
//     "method": "POST",
//     "json": request_body
//   }, (err, res, body) => {
//     if (!err) {
//       console.log('message sent!')
//     } else {
//       console.error("Unable to send message:" + err);
//     }
//   }); 
// }

async function socket(tosendmsg,id){
  try{
    var ws = new websocket({URL:"wss://tataaia.slashrtc.com/aiManager"},id);
    const fulfilledValue = await ws.connectSocket();    // ful-lfilledvalue = Done AFTER RUNNING SUCESSFULLY
    console.log("============== in socket function ==========",fulfilledValue);
    ws.sendMessage(tosendmsg);
  }
  catch(rejectedValue){
      console.log(rejectedValue);
  }
}