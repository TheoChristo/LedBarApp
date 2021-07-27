import { IonButtons, IonChip, IonCol, IonContent, IonFab, IonHeader, IonItem, IonItemDivider, IonLabel, IonList, IonMenuButton, IonPage, IonRow, IonTitle, IonToggle, IonToolbar, useIonAlert, useIonViewDidEnter } from '@ionic/react';
import { IonRange} from '@ionic/react';
import { useParams } from 'react-router';
import { IonButton, useIonToast } from '@ionic/react';
import { IonIcon } from '@ionic/react';
import { wifiOutline, send, cloudDone, cloudOffline, cloudDownloadOutline, paperPlane, pauseCircle, playCircle, ellipse, cloudUploadOutline, power, chevronForwardCircle, bulb, partlySunnyOutline, bulbOutline, filterOutline, atCircleOutline, glassesOutline, analyticsOutline, browsersOutline, browsersSharp, helpOutline} from 'ionicons/icons';
import ReactDOM from 'react-dom';
import React, { useState } from 'react';

import './Page.css';
import { socketProvider } from '../providers/socketProvider';
import { RangeValue } from '@ionic/core';

var sock : socketProvider;
let connected = false;
let lightsOn = false;
let strobeOn = false;
let randomOn = false;

const Page: React.FC = () => {
  useIonViewDidEnter(() => {
    console.log("Did Enter")
    console.log("Connected: "+connected)
    if (!connected)
      connectSocket()
  });
  // toast
  const { name } = useParams<{ name: string; }>();
  const [present] = useIonToast();
  //alert
  const [presentAlert] = useIonAlert();

  const [text, setText] = useState<string>();
  
  // slider
  const [redvalue, setredValue] = useState(0);
  const [greenvalue, setgreenValue] = useState(0);
  const [bluevalue, setblueValue] = useState(0);
  const [fadevalue, setfadeValue] = useState(0);
  const [strobevalue, setstrobeValue] = useState(0);
  const [brightnessvalue, setbrightnessValue] = useState(0);
 
  interface espMessage {
    Op:number;
    Arg1:number;
    Arg2:number;
    Arg3:number;
    Arg4:number;
  };

  function presentNoConnectionAlert(msg:string)
  {
    presentAlert({
    // cssClass: 'my-css',
    header: 'Alert',
    message: msg,
    buttons: [
      // 'Cancel',
      { text: 'Ok', handler: (d) => console.log('ok pressed') },
    ],
    // onDidDismiss: (e) => console.log('did dismiss'),
  })

  connected = true;
  ReactDOM.render(connection_indicator(), document.getElementById('myConnectionIndicator'));
}

  var connection_indicator = () => { 
    if (connected) return <IonIcon color="success" size="large" slot="end" icon={cloudDone} onClick={() => diconnect_socket()}/>
    else return <IonIcon color="danger" size="large" slot="end" icon={cloudOffline} onClick={() => connectSocket()}/>
  }

  var lightsOnButton = (target:boolean) => { 
    return (
        <IonButton  shape="round" expand="full" fill="outline" color = {target? "warning":"medium"} size="large" onClick={() => lightsToggle(!lightsOn) } >
          <IonIcon slot="start" icon={bulb}/> 
        </IonButton>
    );
  }

  var strobeOnButton = (target:boolean) => { 
    return (
        <IonButton  shape="round" expand="full" fill="outline" color = {target? "primary":"medium"} size="large" onClick={() => strobeToggle(!strobeOn) } >
          <IonIcon slot="start" icon={filterOutline} /> 
        </IonButton>
    );
  }
  var randomOnButton = (target:boolean) => { 
    return (
        <IonButton  shape="round" expand="full" fill="outline" color = {target? "danger":"medium"} size="large" onClick={() => randomToggle(!randomOn) } >
          <IonIcon slot="start" icon={helpOutline} /> 
        </IonButton>
    );
  }
  function connectSocket()
  {
    try{

      sock = new socketProvider();

      sock.mySocket.onopen = function (event) {
        present('Socket connection established.', 2000)
        connected = true;
        ReactDOM.render(connection_indicator(), document.getElementById('myConnectionIndicator'));
      };
      sock.mySocket.onclose = function (event) {
        present('Server disconnected.', 2000)
        connected = false;
        ReactDOM.render(connection_indicator(), document.getElementById('myConnectionIndicator'));
      };
      sock.mySocket.onerror = function(event) {
        presentNoConnectionAlert("Server connection error")
        connected = false; 
        ReactDOM.render(connection_indicator(), document.getElementById('myConnectionIndicator'));
      };

      sock.mySocket.onmessage= function(msg) {
        console.log("Recieved message");
        present('Recieved message '+msg, 2000)
      };
    }catch(err)
    {
      presentNoConnectionAlert("Socket Error")
      console.log(err)
    }
  }

  function forceOTA()
  {
    if (connected)
    {
      sendSocketMessage(formatMessage(100,0,0,0,0))
      present('OTA Enabled! ', 2000)
    }
    else if (!connected)
      presentNoConnectionAlert("No connection available!")
  }

  function diconnect_socket(){
    if (connected)
    {
      sock.mySocket.send("!");
      connected=false;  
      ReactDOM.render(connection_indicator(), document.getElementById('myConnectionIndicator'));
      present('Disconnected.', 2000)
    }
    else 
      presentNoConnectionAlert("No connection available!")
    
  }

  function sendSocketMessage(msg:string){
    if (connected)
    {
      console.log("Trying to send socket message")
        sock.mySocket.send(msg);
    }
    else
      presentNoConnectionAlert("No connection available!")
  }

  function formatMessage(Op:number, Arg1:number, Arg2:number, Arg3:number, Arg4:number)
  {
    var myMessage : espMessage= {Op: Op, Arg1:Arg1, Arg2:Arg2, Arg3:Arg3, Arg4:Arg4}
    return JSON.stringify(myMessage)
  }

  function getSliderValue(val : RangeValue, sl:number)
  {
    if (sl == 0) 
    {
      setredValue(val as number) 
      sendSocketMessage(formatMessage(9, 0,redvalue, greenvalue, bluevalue))
    }
    else if (sl == 1) 
    {
      setgreenValue(val as number) 
      sendSocketMessage(formatMessage(9, 0,redvalue, greenvalue, bluevalue))
    }
    else if (sl == 2) 
    {
      setblueValue(val as number) 
      sendSocketMessage(formatMessage(9, 0,redvalue, greenvalue, bluevalue))
    }
    else if (sl == 3) 
    {
      setfadeValue(val as number) 
      sendSocketMessage(formatMessage(10,fadevalue,redvalue, greenvalue, bluevalue))
      console.log("Fade : "+fadevalue.toString())
    }
    else if (sl == 4) 
    {
      setstrobeValue(val as number) 
      sendSocketMessage(formatMessage(11,strobevalue,redvalue, greenvalue, bluevalue))
      console.log("Speed : "+strobevalue.toString())
    }
    else if (sl == 5) 
    {
      setbrightnessValue(val as number) 
      sendSocketMessage(formatMessage(12,brightnessvalue,redvalue, greenvalue, bluevalue))
      console.log("Brightness : "+brightnessvalue.toString())
    }

  }

  function lightsToggle(target:boolean) {
    console.log("LightToggle: "+target)
    sendSocketMessage (formatMessage(target ? 2 : 3,1,redvalue, greenvalue, bluevalue))
    lightsOn=target
    ReactDOM.render(lightsOnButton(target), document.getElementById('lightsOnButton'));
  }
  function strobeToggle(target:boolean) {
    console.log("StrobeToggle: "+target)
    sendSocketMessage(formatMessage(99,target ? 1 : 0,redvalue, greenvalue, bluevalue))
    strobeOn=target
    ReactDOM.render(strobeOnButton(target), document.getElementById('strobeOnButton'));
  }
  function randomToggle(target:boolean) {
    console.log("randomToggle: "+target)
    sendSocketMessage(formatMessage(13,target ? 1 : 0,redvalue, greenvalue, bluevalue))
    randomOn=target
    ReactDOM.render(randomOnButton(target), document.getElementById('randomOnButton'));
    
  }


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonItem id="myConnectionIndicator" slot="start"> {connection_indicator()} </IonItem>
          
          <IonTitle>{name}</IonTitle>

          <IonIcon class="OtaButton" size="large" slot="end"  color="primary" icon={cloudUploadOutline} onClick={() => forceOTA() } /> 
            
          <IonButtons slot="end">
            <IonMenuButton ></IonMenuButton>
          </IonButtons>

        </IonToolbar>
      </IonHeader>

      <IonContent>

      <IonRow class="ion-align-items-center" >

        <IonCol sizeXs="4"><div id="lightsOnButton">{lightsOnButton(lightsOn)}</div></IonCol>
        <IonCol sizeXs="4"><div id="strobeOnButton">{strobeOnButton(strobeOn)}</div></IonCol>
        <IonCol sizeXs="4"><div id="randomOnButton">{randomOnButton(randomOn)}</div></IonCol>

      </IonRow>




        <IonRow>
        <IonItemDivider></IonItemDivider>
        </IonRow>

        <IonList> 
          
          <IonItem>
            <IonIcon slot="start" icon={bulbOutline} color="medium" size="large" /> 
            <IonRange min={0} max={255} color="medium" pin={true} onIonChange={e => getSliderValue(e.detail.value, 5) }>
            </IonRange>
          </IonItem>

          <IonItem>
            <IonIcon slot="start" icon={filterOutline} color="medium" size="large" /> 
            <IonRange min={80} max={255} color="medium" pin={true} onIonChange={e => getSliderValue(e.detail.value, 4) }>
            </IonRange>
          </IonItem>

          <IonItem>
            <IonIcon slot="start" icon={partlySunnyOutline} color="medium" size="large" /> 
            <IonRange min={1} max={120} color="medium" pin={true} onIonChange={e => getSliderValue(e.detail.value, 3) }>
            </IonRange>
          </IonItem>
          </IonList>

          <IonItemDivider></IonItemDivider>

          <IonList>
          <IonItem>
            <IonIcon slot="start" icon={chevronForwardCircle} color="danger" size="large" /> 
            <IonRange min={0} max={255} color="danger" pin={true} onIonChange={e => getSliderValue(e.detail.value, 0) }></IonRange>
          </IonItem>

          <IonItem>
            <IonIcon slot="start" icon={chevronForwardCircle} color="success" size="large" /> 
            <IonRange min={0} max={255} color="success" pin={true} ticks={true} onIonChange={e => getSliderValue(e.detail.value, 1) }></IonRange>
          </IonItem>

          <IonItem>
            <IonIcon slot="start" icon={chevronForwardCircle} color="primary" size="large" /> 
            <IonRange min={0} max={255} color="primary" pin={true} ticks={true} onIonChange={e => getSliderValue(e.detail.value, 2) }></IonRange>
          </IonItem>

        </IonList>

        <IonItemDivider></IonItemDivider>

        <IonRow class="ion-align-items-center">

          <IonCol sizeXs="4" >
            <IonButton color="medium" shape="round" fill="outline" expand="full" onClick={() => sendSocketMessage(formatMessage(21,0,redvalue, greenvalue, bluevalue)) } >
              <IonIcon slot="start" icon={glassesOutline} />Mirror 
            </IonButton>
          </IonCol>

          <IonCol sizeXs="4">
            <IonButton color="medium" shape="round" fill="outline" expand="full" onClick={() => sendSocketMessage(formatMessage(22,0,redvalue, greenvalue, bluevalue)) } >
              <IonIcon slot="start" icon={analyticsOutline} />Series 
            </IonButton>
          </IonCol>

          <IonCol sizeXs="4">
            <IonButton color="medium" shape="round" fill="outline" expand="full" onClick={() => sendSocketMessage(formatMessage(23,0,redvalue, greenvalue, bluevalue)) } >
              <IonIcon slot="start" icon={browsersOutline} /> 1 
            </IonButton>
          </IonCol>
{/* 
          <IonCol sizeXs="2">
            <IonButton color="medium" shape="round" fill="outline" expand="full" onClick={() => sendSocketMessage(formatMessage(13,1,redvalue, greenvalue, bluevalue)) } >
              <IonIcon slot="start" icon={browsersSharp} /> 2 
            </IonButton>
          </IonCol>

          <IonCol sizeXs="2">
            <IonButton color="medium" shape="round" fill="outline" expand="full" onClick={() => sendSocketMessage(formatMessage(13,0,redvalue, greenvalue, bluevalue)) } >
              <IonIcon slot="start" icon={browsersSharp} /> 3 
            </IonButton>
          </IonCol> */}

        </IonRow>

      </IonContent>
    </IonPage>
  );
};

export default Page;
