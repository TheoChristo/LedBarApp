import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonToggle,
} from '@ionic/react';

import { useLocation } from 'react-router-dom';
import { archiveOutline, archiveSharp, bookmarkOutline, heartOutline, heartSharp, home, homeOutline, mailOutline, mailSharp, moon, moonOutline, paperPlaneOutline, paperPlaneSharp, settings, settingsOutline, sunny, sunnyOutline, trashOutline, trashSharp, warningOutline, warningSharp } from 'ionicons/icons';
import './Menu.css';
import ReactDOM from 'react-dom';

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: 'Home',
    url: '/page/Home',
    iosIcon: homeOutline,
    mdIcon: homeOutline
  },
  {
    title: 'Settings',
    url: '/page/Settings',
    iosIcon: settingsOutline,
    mdIcon: settingsOutline
  }
];
let dark=true;
const Menu: React.FC = () => {
  const location = useLocation();
  var dark_indicator = () => { 
    // slot="start" fill="clear" expand="full" size = "large"
    if (dark) return <IonIcon size="large"  slot="start" icon={sunny} color="medium"  />
    else return <IonIcon size="large"  slot="start" icon={moonOutline} color="medium"  />
  }
  function toggleTheme()
  {
    // event.detail.checked
    dark = !dark
    if (dark)
      document.body.setAttribute('color-theme', 'dark')
    else
      document.body.setAttribute('color-theme', 'light')  
    
      ReactDOM.render(dark_indicator(), document.getElementById('myItem'));
    
  }

  return (
    <IonMenu contentId="main" side = "end"type="push" class="mymenu">
      <IonContent>
        <IonList id="inbox-list">
          {/* <IonListHeader>Menu</IonListHeader> */}
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem className={location.pathname === appPage.url ? 'selected' : ''} routerLink={appPage.url} routerDirection="none" lines="none" detail={false}>
                  <IonIcon size="large" slot="start" ios={appPage.iosIcon} md={appPage.mdIcon} />
                  
                </IonItem>
              </IonMenuToggle>
            );
          })}
          <IonItem id="myItem" slot="start" button={true} onClick={()=>toggleTheme()}> {dark_indicator()}</IonItem>

        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
