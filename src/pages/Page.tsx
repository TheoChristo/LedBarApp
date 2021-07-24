import { IonButtons, IonCol, IonContent, IonHeader, IonItem, IonLabel, IonMenuButton, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import { IonFab, IonFabButton, IonInput, IonFooter} from '@ionic/react';
import { useParams } from 'react-router';
import { IonButton, useIonToast } from '@ionic/react';
import { IonIcon } from '@ionic/react';
import { wifiOutline, send, cloudDone, cloudOffline, cloudDownloadOutline, paperPlane} from 'ionicons/icons';
import ReactDOM from 'react-dom';
import React, { useState } from 'react';

import './Page.css';
import { socketProvider } from '../providers/socketProvider';

var sock : socketProvider;
let connected = false;

const Page: React.FC = () => {
  
  const { name } = useParams<{ name: string; }>();
  const [present] = useIonToast();

  const [text, setText] = useState<string>();
  const [number, setNumber] = useState<number>();
  
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
  
  function sendMessage(){
    if (text && connected)
      sock.mySocket.send(String(text));
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
          </IonCol>
        </IonRow>



      </IonContent>
      <IonFooter>
          <IonToolbar>
            <IonRow>
              
              <IonCol sizeXs="11">
                <IonItem>
                  <IonLabel position="floating">Custom Command</IonLabel>
                  <IonInput value={text} onIonChange={e => setText(e.detail.value!)} clearInput></IonInput>
                </IonItem>
              </IonCol>

              <IonCol sizeXs="1">
                <IonButton fill = "outline"  shape="round" onClick={() => sendMessage()}>
                  <IonIcon icon={paperPlane} />
                </IonButton>

              </IonCol>
              
            </IonRow>
          </IonToolbar>
        </IonFooter>
    </IonPage>
  );
};

export default Page;
