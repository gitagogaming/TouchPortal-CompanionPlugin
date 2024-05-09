const path = require("path");
const fs = require("fs");
const TPClient = new (require("touchportal-api").Client)();
const pluginId = "Companion";

const { EventEmitter } = require('events');

const axios = require('axios');


// importing for when we can figure out this.emit('click', ...xy, state) stuff
import { convertXYToIndexForPanel, convertPanelIndexToXY } from './util'
//import { CompanionClient } from './device-types/api';


let heldAction = {};
let pluginSettings = {};

let iTunesLibrary = undefined;
let iTunesStates = {
  PlayerState: { id: "companionplaying_state", value: "", type: "default" },
  Volume: { id: "companionvolume", value: "", type: "default" },
  VolumeConnector: { id:"companionvolume_adjust_connector", value: "", type: "connector"},
  CurrentTrackAlbum: { id: "companioncurrent_track_album", value: "", type: "default" },
  CurrentTrackName: { id: "companioncurrent_track_name", value: "", type: "default" },
  CurrentTrackArtist: { id: "companioncurrent_track_artist", value: "", type: "default" },
  CurrentTrackAlbumArtwork: {
    id: "companioncurrent_track_album_artwork",
    value: "", 
    type: "default"
  },
  CurrentTrackPercentagePlayed: {
    id: "companioncurrent_track_percentage_played",
    value: 0,
    type: "default"
  },
  CurrentTrackPlayedTime: {
    id: "companioncurrent_track_play_time",
    value: "0:00",
    type: "default"
  },
  CurrentTrackRemainingTime: {
    id: "companioncurrent_track_remaining_time",
    value: "0:00",
    type: "default"
  },
  Repeat: { id: "companionrepeat", value: "Off", type: "default"},
  Shuffle: { id: "companionshuffle", value: "Off", type: "default" },
  Playlists: { id: "companionplaylists", valueChoices: [], index: {}, type: "choices" },
};


class TouchPortalSurface extends EventEmitter{
	/**
	 * @type {import('winston').Logger}
	 * @access private
	 * @readonly
	 */
	#logger
// attemtping to make a class for TouchPortal & Companion connection so we can be able to emit messages to companion  `this.emit('click', ...xy, state)

}
// When TP connects initially. 
const initializeStates = async () => {

};

// this is a recurring loop that runs 'forever'
let running = false;
const updateStates = (resend = false ) => {
  if (running) {
    return;
  }
  running = true;

  // do stuff.. then set running to false
 running = false;
};

const updateTPClientStates = (states) => {
  TPClient.stateUpdateMany(states);
  
};

const createTPClientState= (state) => {
   // if TPClient.states[state.id] == undefined {
    TPClient.createStateMany(state)
    console.log("created many states", state)
};

const updateTPClientConnectors = (connectors) => {
  TPClient.connectorUpdateMany(connectors);

};

const updateTPClientChoices = (choices) => {
  choices.forEach((choiceList) => {
    TPClient.choiceUpdate(choiceList.id, choiceList.value);
  });
};

let updateInterval = undefined;
TPClient.on("Info", (message) => {
  //  client.keyDown("TouchPortal", "1")
  
    


    // create tp states 1-31 
    let value = 31;
    let stateArray = [];
    for (let i = 0; i <= value; i++) {
      stateArray.push({
        id: `companion.buttonImage.${i}`,
        defaultValue: "",
        desc: `Button # ${i} image`,
        type: "default"
      });
    }
    createTPClientState(stateArray);


  initializeStates();
  updateInterval = setInterval(() => {
    updateStates(false);
  }, 1000);
});

TPClient.on("Settings", (message) => {
  console.log(pluginId, ": DEBUG : SETTINGS ", JSON.stringify(message));
  message.forEach( (setting) => {
    let key = Object.keys(setting)[0];
    pluginSettings[key] = setting[key];
  });
});

TPClient.on("Close", () => {
  clearInterval(updateInterval);
});

TPClient.on("Broadcast", () => {
  console.log(pluginId, ": DEBUG : Broadcast - updateStates called");
  running = false;
  updateStates(true);
})

TPClient.on("Action", async (message,hold) => {
  console.log(pluginId, ": DEBUG : ACTION ", JSON.stringify(message), "hold", hold);
  let forceStateUpdate = false;

  if( hold ) {
      heldAction[message.actionId] = true;
  }
  else if ( !hold ) {
      delete heldAction[message.actionId];
  }

  if (message.actionId === "companion_button_press") {
    console.log("Button Pressed", message.data[0].value);
    let page = message.data[0].value;
    let row = message.data[1].value;
    let column = message.data[2].value;

    // create a post request to press button
    const url = `http://192.168.0.107:8000/api/location/${page}/${row}/${column}/press`;
    console.log(`Making POST request to ${url}`)
    try {
      const response = await axios.post(url);
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error making POST request:', error);
    }
  }
  

  // Forces an update of states if any actions occurs
  updateStates(forceStateUpdate);
});

//TPClient.connect({ pluginId });

export { pluginId, TPClient, updateTPClientStates, createTPClientState }

