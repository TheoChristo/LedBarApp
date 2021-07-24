
export class socketProvider
{
    mySocket: WebSocket;

    constructor(){
        console.log("Creating Socket...")
        this.mySocket = new WebSocket("ws://localhost:8765");
        // this.mySocket = new WebSocket("ws://192.168.2.7:5050", 'protocolOne');

        this.mySocket.onopen = function (event) {
            console.log("Socket connection established.")
        };

        this.mySocket.onerror = function(event) {
            console.log("Connection Error");
        };

        this.mySocket.onmessage = function(event) {
            console.log(`[message] Data received from server: ${event.data}`);
        };
          
        this.mySocket.onclose = function(event) {
            if (event.wasClean) {
                console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            } else {
                console.log('[close] Connection died');
            }

            switch(event.code)
            {
                case 1000: console.log("Connection properly closed"); break;
                case 1001: console.log("Going Away"); break;
                case 1002: console.log("Protocol Error"); break;
                case 1003: console.log("Unsupported Data"); break;
                case 1005: console.log("No Status Received"); break;
                case 1006: console.log("Abnormal Closure"); break;
                case 1007: console.log("Invalid frame payload data"); break;
                case 1008: console.log("Policy Violation"); break;
                case 1009: console.log("Message too big"); break;
                case 1010: console.log("Missing Extension"); break;
                case 1011: console.log("Internal Error"); break;
                case 1012: console.log("Service Restart"); break;
                case 1013: console.log("Try Again Later"); break;
                case 1014: console.log("Bad Gateway"); break;
                case 1015: console.log("TLS Handshake"); break;
            }
        };
        

    }   

    // mySocket = new WebSocket("ws://192.168.2.7:5050", 'protocolOne');
    


};