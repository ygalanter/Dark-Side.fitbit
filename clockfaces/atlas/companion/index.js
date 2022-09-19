import { peerSocket } from '../common/fileMessaging'
import { settingsStorage } from "settings";

console.log("Companion Started");

// A user changes settings
settingsStorage.onchange = evt => {

  //sending to device
  let data = {
    key: evt.key,
    newValue: evt.newValue
  };
  sendVal(data);
};

function sendVal(data) {
  peerSocket.send(data);
}