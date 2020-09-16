var WebSocketClient = require('websocket').client;
const fetch = require('node-fetch');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

class WebSocket {
    constructor(tData,id) 
    {
        this.mData = tData;
        this.client = null;
        this.mSocket = null;
        this.messageUuid = "";
        this.forceStop = false;
        this.isConnected = false; 
        this.fbid=id;
        console.log("===================id got is >",this.fbid);
    }

    getBaseJson(messagedata)
    {
        return {
           // mBrandName: "aGGmeD",
            mCustomerInfo: {
            Name: "",
            PhoneNumber: "12349022226",
            fromBrowserInfo: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36",
            fromIP: "",
            fromLocation: "Mumbai",
            fromURL: "https://www.facebook.com"
            },
            mIntegrationID: "ZwdXW7nfWisgGQCS6",
            mProjectID: "GHKYbL8wSKXtof4nv",
            mProjectName: "HRA",
            mType: "CHAT",
            messageData: messagedata
        } 
    }

    getSendJson(messagedata)
    {
        let _this = this;
        //console.log("=================in get send json================>",_this.messageUuid);
        if(this.messageUuid){
            return {
                mBrandName: "aGGmeD",
                mCustomerInfo: {
                Name: "",
                PhoneNumber: "12349022226",
                fromBrowserInfo: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36",
                fromIP: "",
                fromLocation: "Mumbai",
                fromURL: "https://www.facebook.com"
                },
                mIntegrationID: "ZwdXW7nfWisgGQCS6",
                mProjectID: "GHKYbL8wSKXtof4nv",
                mProjectName: "HRA",
                mType: "CHAT",
                messageData: messagedata,
                messageUuid: _this.messageUuid
            } 
        }
    }

    connectSocket()
    {
        var _this = this;
        return new Promise(function (resolve,reject) {
            if(_this.client)
            {
                _this.client = null;
            }
            _this.client = new WebSocketClient();
            if(_this.mData && _this.mData.URL)
            {
                //connecting to web socket
                _this.client.connect(_this.mData.URL);
                //on connecting 
                _this.client.on('connect', function(connection) 
                {
                    console.log('WebSocket Client Connected');
                    _this.mSocket = connection;
                    _this.isConnected = true;
                    _this.sendInitMessageSocket(); // intialzia
                    
                    connection.on('error', function(error) {
                        _this.onERROR(error);
                        reject(new Error("Failed"));                 
                    });
    
                    connection.on('message', function(messageReceived) {
                        if(messageReceived && messageReceived.utf8Data && messageReceived.utf8Data!== "PING"){
                        let a = JSON.parse(messageReceived.utf8Data);
                        console.log("======================> a object============>",_this.fbid);
                        
                            _this.sendTextMessage(_this.fbid,a);  // send to text message
                        
                        if(a.messageUuid){
                            _this.messageUuid = a.messageUuid;
                            resolve("Done");
                           //console.log(_this.messageUuid);    
                        }
                        _this.onMessage(a);
                    }
                    });
               
                });
            }
            else
            {
                console.log(`You didnt set URL to connect`);
                reject(new Error("Failed"));
            }
        });
    }

    onMessage(tData)
    {
        console.log("=============================>",tData,"<===============================");
    }
    //this is output of tdata
    // =============================> {
    //     messageUuid: '9def0688bfafa9eee26e662b22b89714',
    //     mType: 'UUIDFROMSERVER',
    //     titlecolor: '#6465e2',
    //     subtitlecolor: '#fff',
    //     titlefontcolor: '#fff',
    //     senderbgcolor: '#6569DF',
    //     receiverbgcolor: '#dedede',
    //     senderfont: '#fff',
    //     receiverfont: '#000000',
    //     mAllMessage: [
    //       {
    //         _id: 'nYetGsChCj58NpYaM',
    //         internal: false,
    //         conversationId: 'PjqegDkeQG4QWq3mm',
    //         customerId: 'mfh8cM9t97FtrESDY',
    //         content: 'Hello',
    //         createdAt: '2020-09-05T07:57:18.653Z',
    //         __v: 0,
    //         mentionedUserIds: []
    //       },
    //       {
    //         _id: '2WhQX8sT6Exw3Zsyy',
    //         internal: false,
    //         conversationId: 'PjqegDkeQG4QWq3mm',
    //         userId: 'cv3f8EC2ediYdfQiA',
    //         content: '{"text":"कृपया नीचे किसी एक विकल्प का चयन करें","isSenderBox":false,"quick_replies":[{"payload":"business","title":"ताज़ा खबर","content_type":
    //   "text"},{"payload":"sports","title":"खेल समाचार","content_type":"text"},{"payload":"entertainment","title":"मनोरंजन समाचार","content_type":"text"},{"payload":
    //   "health","title":"स्वास्थ्य समाचार","content_type":"text"}],"sectionName":""}',
    //         createdAt: '2020-09-05T07:57:18.681Z',
    //         __v: 0,
    //         mentionedUserIds: []
    //       }
    //     ],
    //     section: 0,
    //     banner: '',
    //     bannerTitle: ''
    //   } <===============================
// IF FOR ANY REASON OUR CODE FAILS OR CONNECTION FAILS IT WILL TRY TO RECONNECT TO THE SOCKET
    onERROR(err)
    {
        this.isConnected = false;
        console.log(`ERROR`);
        console.error;
        var _this = this;
        if(this.forceStop === false)
        {
            setTimeout(() => {
                _this.connectSocket();
            }, 1 * 1000);
        }
    }

    closeConnection()
    { 
        this.forceStop = true;
        if(this.client && this.mSocket)
        {
            this.mSocket.close();
            this.client = null;
            console.log('Closed');
        }
    }
    // sending message as client sends intial message to us
    sendInitMessageSocket()
    {
        let myjson = this.getBaseJson("INITMESSAGE");
        //console.log(myjson);
        if(this.mSocket)
        {
            this.mSocket.send(JSON.stringify(myjson));
        }
    }

    sendMessage(tData)
    {
        //this.fbid = id;
        let myjson = this.getSendJson(tData);   //function call to get detials of message and project and saving it to variable myjson
        console.log("=====================Send Message =================>",myjson);
        //do your changes...
        if(this.mSocket)
        {
            this.mSocket.send(JSON.stringify(myjson));   // converts json data into string
        }
    }

    // Creates the endpoint for our webhook 
    sendTextMessage(userId, tdata){         //user id represnts id and tdata represents utf8 encoded message 
        console.log("========================send text message ======>", userId, tdata); 
        let FACEBOOK_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
        let quick_repl = [];
        let text = tdata.text;
       // console.log(quick_repl);
        if(tdata.quick_replies && tdata.text)
        {
            tdata.quick_replies.forEach((e)=>{
                e.content_type = "text";
                quick_repl.push(e);
          
        //    console.log("=============>quick rply array content<=========",quick_repl);
            return fetch(
                `https://graph.facebook.com/v2.6/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`,
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  method: 'POST',
                  body: JSON.stringify({
                    messaging_type: 'RESPONSE',
                    recipient: {
                      id: userId,
                    },
                    message: {
                      text,
                      quick_replies:quick_repl
                    },
                  }),
                }
              );
            });
        }
        else{
            return fetch(
                `https://graph.facebook.com/v2.6/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`,
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  method: 'POST',
                  body: JSON.stringify({
                    messaging_type: 'RESPONSE',
                    recipient:
                    {
                      id: userId,
                    },
                    message: 
                    {
                      text
                    },
                  }),
                }
              );
         }
   
    }

}
module.exports = WebSocket;