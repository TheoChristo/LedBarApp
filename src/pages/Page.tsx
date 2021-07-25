import { IonButtons, IonChip, IonCol, IonContent, IonHeader, IonItem, IonItemDivider, IonLabel, IonList, IonMenuButton, IonPage, IonRow, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import { IonFab, IonFabButton, IonInput, IonFooter} from '@ionic/react';
import { IonCard, IonCardContent, IonImg, IonCardTitle, IonCardHeader, IonCardSubtitle, IonGrid, IonRange} from '@ionic/react';
import { useParams } from 'react-router';
import { IonButton, useIonToast } from '@ionic/react';
import { IonIcon } from '@ionic/react';
import { wifiOutline, send, cloudDone, cloudOffline, cloudDownloadOutline, paperPlane, pauseCircle, playCircle, ellipse, cloudUploadOutline, power} from 'ionicons/icons';
import ReactDOM from 'react-dom';
import React, { useState } from 'react';

import './Page.css';
import { socketProvider } from '../providers/socketProvider';
import { RangeValue } from '@ionic/core';

var sock : socketProvider;
let connected = false;
let lightStatus = false;
let strobeStatus = false;

const Page: React.FC = () => {
  
  // toast
  const { name } = useParams<{ name: string; }>();
  const [present] = useIonToast();

  const [text, setText] = useState<string>();
  const [number, setNumber] = useState<number>();
  
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

  function setMessage(Op:number, Arg1:number, Arg2:number, Arg3:number, Arg4:number)
  {
    var myMessage : espMessage= {Op: Op, Arg1:Arg1, Arg2:Arg2, Arg3:Arg3, Arg4:Arg4}
    return JSON.stringify(myMessage)
  }


  var connection_indicator = () => { 
    if (connected) return <IonIcon color="success" size="large" slot="end" icon={cloudDone} />
    else return <IonIcon color="danger" size="large" slot="end" icon={cloudOffline} />
  }

  var lightStatus_indicator = () => { 
    if (lightStatus) 
    {
      return (
        <IonButton color="danger" shape="round" fill="outline" onClick={() => lightsToggle(true) } >
          <IonIcon slot="start" icon={power} /> 
        </IonButton>
      );
    }
    else
    {
      return (
        <IonButton color="success" shape="round" fill="outline" onClick={() => lightsToggle(false) } >
          <IonIcon slot="start" icon={power} /> 
        </IonButton>
      );
    } 
  }


  function connectSocket()
  {
    sock = new socketProvider();

    sock.mySocket.onopen = function (event) {
      console.log("Socket connection established.")
      present('Socket connection established.', 2000)

      connected = true;
      ReactDOM.render(connection_indicator(), document.getElementById('myConnectionIndicator'));
    };
    sock.mySocket.onerror = function(event) {
      console.log("Socket Error");
      present('Socket Error.', 2000)
      connected = false; 
      ReactDOM.render(connection_indicator(), document.getElementById('myConnectionIndicator'));
    };

    sock.mySocket.onmessage= function(msg) {
      console.log("Recieved message");
      present('Recieved message '+msg, 2000)
    };
  }
  
  function sendCustomMessage(){
    if (text && connected)
      sock.mySocket.send(String(text));
    else if (!connected)
      present('No connection available!', 2000)
  }  

  function sendSocketMessage(msg:string){
    if (connected)
    {
      sock.mySocket.send(msg);
    }
  }

  function forceOTA()
  {
    if (connected)
    {
      sendSocketMessage(setMessage(100,0,0,0,0))
      present('OTA Enabled! ', 2000)
    }
    else if (!connected)
      present('No connection available!', 2000)
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
      present('No connection available!', 2000)
    
  }

  function getSliderValue(val : RangeValue, sl:number)
  {
    if (sl == 0) 
    {
      setredValue(val as number) 
      sendSocketMessage(setMessage(9, 0,redvalue, greenvalue, bluevalue))
    }
    else if (sl == 1) 
    {
      setgreenValue(val as number) 
      sendSocketMessage(setMessage(9, 0,redvalue, greenvalue, bluevalue))
    }
    else if (sl == 2) 
    {
      setblueValue(val as number) 
      sendSocketMessage(setMessage(9, 0,redvalue, greenvalue, bluevalue))
    }
    else if (sl == 3) 
    {
      setfadeValue(val as number) 
      sendSocketMessage(setMessage(10,fadevalue,redvalue, greenvalue, bluevalue))
      console.log("Fade : "+fadevalue.toString())
    }
    else if (sl == 4) 
    {
      setstrobeValue(val as number) 
      sendSocketMessage(setMessage(11,strobevalue,redvalue, greenvalue, bluevalue))
      console.log("Speed : "+strobevalue.toString())
    }
    else if (sl == 5) 
    {
      setbrightnessValue(val as number) 
      sendSocketMessage(setMessage(12,brightnessvalue,redvalue, greenvalue, bluevalue))
      console.log("Brightness : "+brightnessvalue.toString())
    }

  }

  function lightsToggle(target:boolean) {
    console.log("LightToggle: "+target)
    sendSocketMessage (setMessage(target ? 2 : 3,1,redvalue, greenvalue, bluevalue))
  }
  function strobeToggle(target:boolean) {
    console.log("StrobeToggle: "+target)
    sendSocketMessage(setMessage(99,target ? 1 : 0,redvalue, greenvalue, bluevalue))
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{name}</IonTitle>             
          <div id="myConnectionIndicator" slot="end"> {connection_indicator()} </div>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRow class="ion-align-items-center">

          <IonCol sizeXs="4">
            <IonButton color="success" shape="round" fill="outline" expand="full" onClick={() => connectSocket() } >
              <IonIcon slot="start" icon={wifiOutline} />Connect 
            </IonButton>
          </IonCol>

          <IonCol sizeXs="4">
            <IonButton color="danger" shape="round" fill="outline" expand="full" onClick={() => diconnect_socket() } >
              <IonIcon slot="start" icon={cloudDownloadOutline} />Disconnect 
            </IonButton>

          </IonCol>
            <IonCol sizeXs="4">
            <IonButton shape="round" fill="outline" expand="full" onClick={() => forceOTA() } >
              <IonIcon slot="start" icon={cloudUploadOutline} />OTA 
            </IonButton>
            </IonCol>
        </IonRow>

        <IonRow>
        <IonItemDivider></IonItemDivider>
        </IonRow>

        <IonList> 
          <IonItem><IonTitle>Light</IonTitle><IonToggle color="success"  slot="end" onIonChange={(e)=>lightsToggle(e.detail.checked)}/> </IonItem>

          <IonItem><IonTitle>Strobe</IonTitle><IonToggle color="tertiary" slot="end" onIonChange={(e)=>strobeToggle(e.detail.checked)}/> </IonItem>
          
          <IonItemDivider></IonItemDivider>
          <IonTitle>Brightness</IonTitle>
          <IonItem>
            <IonRange min={0} max={255} color="medium" pin={true} onIonChange={e => getSliderValue(e.detail.value, 5) }>
            </IonRange>
          </IonItem>

          <IonItemDivider></IonItemDivider>
          <IonTitle>Color</IonTitle>
          <IonItem>
            <IonRange min={0} max={255} color="danger" pin={true} onIonChange={e => getSliderValue(e.detail.value, 0) }>
            </IonRange>
          </IonItem>

          <IonItem>
            <IonRange min={0} max={255} color="success" pin={true} onIonChange={e => getSliderValue(e.detail.value, 1) }>
            </IonRange>
          </IonItem>

          <IonItem>
            <IonRange min={0} max={255} color="primary" pin={true} onIonChange={e => getSliderValue(e.detail.value, 2) }>
            </IonRange>
          </IonItem>

          <IonItemDivider></IonItemDivider>
          <IonTitle>Fade</IonTitle>

          <IonItem>
            <IonRange min={1} max={80} color="medium" pin={true} onIonChange={e => getSliderValue(e.detail.value, 3) }>
            </IonRange>
          </IonItem>

          <IonItemDivider></IonItemDivider>
          <IonTitle>Strobe</IonTitle>
          <IonItem>
            <IonRange min={1} max={100} color="medium" pin={true} onIonChange={e => getSliderValue(e.detail.value, 4) }>
            </IonRange>
          </IonItem>

        </IonList>

      </IonContent>
    </IonPage>
  );
};

export default Page;
