// importing libraries
import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import { battery } from "power";
import { me as device } from "device";
import * as messaging from "messaging";
import * as fs from "fs";
import { me } from "appbit";
import { goals, today } from "user-activity";
import dtlib from "../common/datetimelib"

// getting UI elementys
const timelbl = document.getElementById("timelbl");
const datelbl = document.getElementById("datelbl");
const dowlbl = document.getElementById("dowlbl");
const battery_bar = document.getElementById("battery_bar");
const activityIcon = document.getElementById("activityIcon");


// on app exit collect settings 
me.onunload = () => {
  fs.writeFileSync("user_settings.json", userSettings, "json");
}


// Message is received
messaging.peerSocket.onmessage = evt => {
  
  switch (evt.data.key) {
    case "timecolor": 
          userSettings[evt.data.key] = evt.data.newValue.replace(/["']/g, "");
          timelbl.style.fill = userSettings.timecolor;
          break;
     case "datecolor": 
          userSettings[evt.data.key] = evt.data.newValue.replace(/["']/g, "");
          datelbl.style.fill = userSettings.datecolor;
          break;
     case "dowcolor": 
          userSettings[evt.data.key] = evt.data.newValue.replace(/["']/g, "");
          dowlbl.style.fill = userSettings.dowcolor;
          break;
      case "iconcolor": 
          userSettings[evt.data.key] = evt.data.newValue.replace(/["']/g, "");
          activityIcon.style.fill = userSettings.iconcolor;
          break;
     case "showActivity":
          userSettings.showActivity = JSON.parse(evt.data.newValue).values[0].value;
          showHideActivityIcon(userSettings.showActivity);
          updateActivity(userSettings.showActivity);
          updateBattery(Math.floor(battery.chargeLevel))
          break;
  };
}

// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("App Socket Open");
};

// Message socket closes
messaging.peerSocket.close = () => {
  console.log("App Socket Closed");
};



// trying to get user settings if saved before
let userSettings;
try {
  userSettings = fs.readFileSync("user_settings.json", "json");
} catch (e) {
  userSettings = {timecolor: "#ffffff", datecolor: "#ffffff", dowcolor: "#ffffff", iconcolor: "#ffffff", showActivity:"battery"}
}


//trap
if (!userSettings.dowcolor) {
  userSettings = {timecolor: "#ffffff", datecolor: "#ffffff", dowcolor: "#ffffff", iconcolor: "#ffffff", showActivity:"battery"}
}

// initial color and icon settings
timelbl.style.fill = userSettings.timecolor;
datelbl.style.fill = userSettings.datecolor;
dowlbl.style.fill = userSettings.dowcolor;
activityIcon.style.fill = userSettings.iconcolor;
showHideActivityIcon(userSettings.showActivity);


function updateBattery(charge) {
  switch (userSettings.showActivity){
    case 'battery':
       battery_bar.width = (device.modelName === 'Ionic'? 122: 88)*(100-charge)/100;
       break;
    case 'disabled':
       battery_bar.width = 0;
       break;
  }
  
}

function updateActivity(activity) {
  switch (activity) {
    case 'battery':
      break;
    case 'disabled':
       battery_bar.width = 0;
       break;
    default:
       battery_bar.width = (device.modelName === 'Ionic'? 122: 88) * (goals[activity] - today.adjusted[activity])/goals[activity];
       break;
  }
  

}

function showHideActivityIcon(activity) {
  if (activity == 'disabled') {
    activityIcon.style.display = 'none';
  } else {
    activityIcon.href = `icons/${activity}.png`;
    activityIcon.style.display = 'inline';
  }
}


// reading time format preferemces
dtlib.timeFormat = preferences.clockDisplay == "12h" ? 1: 0;

// Update the clock every minute
clock.granularity = "minutes";


// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  let today = evt.date;
  
  // formatting hours based on user preferences
  let hours = dtlib.format1224hour(today.getHours());
  
  // if this is 24H format - prepending 1-digit hours with 0
  if (dtlib.timeFormat == dtlib.TIMEFORMAT_24H) {
      hours = dtlib.zeroPad(hours);
  }
  
  // getting 0-preprended minutes
  let mins = dtlib.zeroPad(today.getMinutes());
  
  //displaying time 
  timelbl.text = `${hours}:${mins}`;
  
    // getting short month name in English
   let month = dtlib.getMonthNameShort(dtlib.LANGUAGES.ENGLISH, today.getMonth());

   // getting 0-prepended day of the month
   let day = dtlib.zeroPad(today.getDate());

   datelbl.text = `${month} ${day}`
   
   dowlbl.text = dtlib.getDowNameShort(dtlib.LANGUAGES.ENGLISH, today.getDay());
   updateActivity(userSettings.showActivity);
 
}



//battery
updateBattery(Math.floor(battery.chargeLevel))
battery.onchange = () => {updateBattery(Math.floor(battery.chargeLevel))};

//activity
updateActivity(userSettings.showActivity);
