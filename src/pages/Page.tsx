import { IonButtons, IonChip, IonCol, IonContent, IonHeader, IonItem, IonItemDivider, IonLabel, IonList, IonMenuButton, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import { IonFab, IonFabButton, IonInput, IonFooter} from '@ionic/react';
import { IonCard, IonCardContent, IonImg, IonCardTitle, IonCardHeader, IonCardSubtitle, IonGrid, IonRange} from '@ionic/react';
import { useParams } from 'react-router';
import { IonButton, useIonToast } from '@ionic/react';
import { IonIcon } from '@ionic/react';
import { wifiOutline, send, cloudDone, cloudOffline, cloudDownloadOutline, paperPlane, pauseCircle, playCircle, ellipse, cloudUploadOutline} from 'ionicons/icons';
import ReactDOM from 'react-dom';
import React, { useState } from 'react';

import './Page.css';
import { socketProvider } from '../providers/socketProvider';
import { RangeValue } from '@ionic/core';

var sock : socketProvider;
let connected = false;

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
  const [speedvalue, setspeedValue] = useState(0);
 
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
    if (text && connected)
      sock.mySocket.send("100,0,0");
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
      sendSocketMessage(setMessage(10, 0,redvalue, greenvalue, bluevalue))
    }
    else if (sl == 1) 
    {
      setgreenValue(val as number) 
      sendSocketMessage(setMessage(10, 0,redvalue, greenvalue, bluevalue))
    }
    else if (sl == 2) 
    {
      setblueValue(val as number) 
      sendSocketMessage(setMessage(10, 0,redvalue, greenvalue, bluevalue))
    }
    else if (sl == 3) 
    {
      setspeedValue(val as number) 
      sendSocketMessage(setMessage(9,speedvalue,redvalue, greenvalue, bluevalue))
      console.log("Speed : "+speedvalue.toString())
    }

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
          <IonCol sizeXs="12">
            <IonButton color="success" shape="round" fill="outline" onClick={() => connectSocket() } >
              <IonIcon slot="start" icon={wifiOutline} />Connect 
            </IonButton>

            <IonButton color="danger" shape="round" fill="outline" onClick={() => diconnect_socket() } >
              <IonIcon slot="start" icon={cloudDownloadOutline} />Disconnect 
            </IonButton>

            <IonButton shape="round" fill="outline" onClick={() => forceOTA() } >
              <IonIcon slot="start" icon={cloudUploadOutline} />OTA 
            </IonButton>
          </IonCol>
        </IonRow>



          <IonRow class="ion-align-items-center">
            
            <IonCol size-xs="6" sizeSm="4" sizeMd="3" sizeLg="3" sizeXl="2">
              <ActionCard title="On" subtitle="Lights" imgurl="" command={setMessage(2,1,redvalue, greenvalue, bluevalue)} />
            </IonCol>
            <IonCol size-xs="6" sizeSm="4" sizeMd="3" sizeLg="3" sizeXl="2">
              <ActionCard title="Off" subtitle="Lights" imgurl="" command={setMessage(3,0,redvalue, greenvalue, bluevalue)} />
            </IonCol>
            <IonCol size-xs="6" sizeSm="4" sizeMd="3" sizeLg="3" sizeXl="2">
              <ActionCard title="On" subtitle="Strobe" imgurl="" command={setMessage(99,1,redvalue, greenvalue, bluevalue)} />
            </IonCol>
            <IonCol size-xs="6" sizeSm="4" sizeMd="3" sizeLg="3" sizeXl="2">

              <ActionCard title="Off" subtitle="Strobe" imgurl="" command={setMessage(99, 0, redvalue, greenvalue, bluevalue)} />
            </IonCol>

          </IonRow>

          {/* <IonChip>
            <IonIcon icon={playCircle} color="primary" />
            <IonLabel>Icon Chip</IonLabel>
            <IonIcon icon={pauseCircle} />
          </IonChip> */}

          <IonList>
            <IonTitle>Settings</IonTitle>

            <IonItemDivider><IonTitle>Color</IonTitle></IonItemDivider>
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

            <IonItemDivider><IonTitle>Speed</IonTitle></IonItemDivider>

            <IonItem>
              <IonRange min={1} max={150} color="medium" pin={true} onIonChange={e => getSliderValue(e.detail.value, 3) }>
              </IonRange>
            </IonItem>
          </IonList>



      </IonContent>
      <IonFooter>
          <IonToolbar>
            <IonRow>
              
              <IonCol sizeXs="10">
                <IonItem>
                  <IonLabel position="floating">Custom Command</IonLabel>
                  <IonInput value={text} onIonChange={e => setText(e.detail.value!)} clearInput></IonInput>
                </IonItem>
              </IonCol>

              <IonCol sizeXs="1">
                <IonButton fill = "outline"  shape="round" onClick={() => sendCustomMessage()}>
                  <IonIcon icon={paperPlane} />
                </IonButton>

              </IonCol>
              
            </IonRow>
          </IonToolbar>
        </IonFooter>
    </IonPage>
  );
};

class ActionCard extends React.Component
{
  // constructor(props)
  // {
  //   super(props)
  // }
  props = { title: "", subtitle: "", imgurl: "", command:""};
  
  sendMessage(){
    if (connected)
    {
      sock.mySocket.send(this.props.command);
    }
  }  
  
  render() {
    return (
        <IonCard onClick = {() => this.sendMessage()}>
          {/* <IonCardContent >
              <IonImg src={this.props.imgurl}  />
          </IonCardContent> */}

          <IonCardHeader >
            <IonCardTitle>{this.props.title} </IonCardTitle>
            <IonCardSubtitle>
              {this.props.subtitle}
            </IonCardSubtitle>
          </IonCardHeader>

        
        </IonCard>
    );
  }
 }

export default Page;
