// importing libraries
import clock from "clock";
import document from "document";
import { preferences as user_settings} from "user-settings";
import { battery } from "power";
import { me as device } from "device";
import { goals, today } from "user-activity";
import dtlib from "../common/datetimelib";
import {preferences} from "fitbit-preferences";
import asap from "fitbit-asap/app";

// getting UI elementys
const timelbl = document.getElementById("timelbl");
const datelbl = document.getElementById("datelbl");
const dowlbl = document.getElementById("dowlbl");
const battery_bar = document.getElementById("battery_bar");
const activityIcon = document.getElementById("activityIcon");


// Message is received
asap.onmessage = data => {
  
  switch (data.key) {
    case "timecolor": 
          preferences.p[data.key] = data.newValue.replace(/["']/g, "");
          timelbl.style.fill = preferences.p.timecolor;
          break;
     case "datecolor": 
          preferences.p[data.key] = data.newValue.replace(/["']/g, "");
          datelbl.style.fill = preferences.p.datecolor;
          break;
     case "dowcolor": 
          preferences.p[data.key] = data.newValue.replace(/["']/g, "");
          dowlbl.style.fill = preferences.p.dowcolor;
          break;
      case "iconcolor": 
          preferences.p[data.key] = data.newValue.replace(/["']/g, "");
          activityIcon.style.fill = preferences.p.iconcolor;
          break;
     case "showActivity":
          let activity = JSON.parse(data.newValue).values[0].value;

          if (activity === "elevationGain" && today.local.elevationGain === undefined) {
            break;
          }
     
          preferences.p.showActivity = activity;
          showHideActivityIcon(preferences.p.showActivity);
          updateActivity(preferences.p.showActivity);
          updateBattery(Math.floor(battery.chargeLevel))
          break;
  };
}


// trying to get user settings if saved before
if (!preferences.p) {
  preferences.p =  {timecolor: "#ffffff", datecolor: "#ffffff", dowcolor: "#ffffff", iconcolor: "#ffffff", showActivity:"battery"}
}

// initial color and icon settings
timelbl.style.fill = preferences.p.timecolor;
datelbl.style.fill = preferences.p.datecolor;
dowlbl.style.fill = preferences.p.dowcolor;
activityIcon.style.fill = preferences.p.iconcolor;
showHideActivityIcon(preferences.p.showActivity);


function updateBattery(charge) {
  switch (preferences.p.showActivity){
    case 'battery':
       battery_bar.width = (device.screen.width === 348? 122: 88)*(100-charge)/100;
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
       battery_bar.width = (device.screen.width === 348? 122: 88) * (goals[activity] - today.adjusted[activity])/goals[activity];
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
dtlib.timeFormat = user_settings.clockDisplay == "12h" ? 1: 0;

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
   updateActivity(preferences.p.showActivity);
 
}



//battery
updateBattery(Math.floor(battery.chargeLevel))
battery.onchange = () => {updateBattery(Math.floor(battery.chargeLevel))};

//activity
updateActivity(preferences.p.showActivity);
