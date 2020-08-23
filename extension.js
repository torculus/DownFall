/* DownFall – Gnome Shell Extension
 * Copyright (C) 2020 Benjamin S Osenbach
 *
 * Inspired by Let It Snow (https://github.com/offlineric/gsnow).
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

const St = imports.gi.St;
const GObject = imports.gi.GObject;
const Main = imports.ui.main;
const Clutter = imports.gi.Clutter;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

let settings = Me.imports.prefs.getSettings();

let MAX_CHARS = 30;
let FALLTEXT;
let COLOR;
let FONT;
let FALLCHARS;// = ["🐘️","🇹🇬️"];
let FC_STYLE;
let MONITORS;
let DIRECTION;
let AVG_TIME;
let AVG_ROT;
let AVG_DRIFT;
let TIME_MDIFF = 2;

let disable;

var FallCharacter = GObject.registerClass({
  GTypeName: 'FallCharacter',
  Properties: {},
  Signals: {},
  },
  class FallCharacter extends St.Label {
    _init(description, fcm) {
      super._init(description);
      this.fcm = fcm; //reference back to the FallCharsManager (FCM)
    }
    
    fall() {
      let monitor;
      
      if (MONITORS == 1) { //falling on primary monitor only
        monitor = Main.layoutManager.primaryMonitor;
      } else {
        monitor = Main.layoutManager.monitors;
      }
      
      let startX;
      let startY;
      let endX;
      let endY;
      
      //set start and end points for falling
      if (DIRECTION == 0) { //Down
        startX = monitor.x + Math.floor(Math.random() * (monitor.width - this.width));
        startY = monitor.y - this.height;
        endX = startX + Math.floor((Math.random() * AVG_DRIFT * 2) - AVG_DRIFT);
        endY = monitor.y + monitor.height - this.height;
      } else if (DIRECTION == 1) { //Up
        startX = monitor.x + Math.floor(Math.random() * (monitor.width - this.width));
        startY = monitor.y + monitor.height - this.height;
        endX = startX + Math.floor((Math.random() * AVG_DRIFT * 2) - AVG_DRIFT);
        endY = monitor.y - this.height;
      } else if (DIRECTION == 2) { //Left
        startX = monitor.x + monitor.width - this.width;
        startY = monitor.y + Math.floor(Math.random() * (monitor.height - this.height));
        endX = monitor.x - this.width;
        endY = startY + Math.floor((Math.random() * AVG_DRIFT * 2) - AVG_DRIFT);
      } else { //Right
        startX = monitor.x - this.width;
        startY = monitor.y + Math.floor(Math.random() * (monitor.height - this.height));
        endX = monitor.x + monitor.width - this.width;
        endY = startY + Math.floor((Math.random() * AVG_DRIFT * 2) - AVG_DRIFT);
      }
      
      let time = (AVG_TIME + (Math.random() * TIME_MDIFF * 2) - TIME_MDIFF) * 1000;
      let rotation = Math.floor((Math.random() * AVG_ROT * 2) - AVG_ROT);
      
      this.set_position(startX, startY);
      
      Main.uiGroup.add_actor(this);
      
      this.save_easing_state();
      this.set_easing_mode(Clutter.AnimationMode.EASE_OUT_QUAD);
      this.set_easing_duration(time);
      this.set_position(endX, endY);
      this.set_rotation_angle(Clutter.RotateAxis.Z_AXIS, rotation);
      this.restore_easing_state();
      
      this.connect('transitions-completed', this.fcm.checkFall.bind(this.fcm));
    }
  });

var FCM = GObject.registerClass({
  GTypeName: 'FCM',
  Properties: {},
  Signals: {},
  },
  class FCM extends GObject.Object {
    _init() {
    	settings.connect('changed', this.settingsChanged.bind(this));
      	this.settingsChanged();
    }
    
    dropChars() {
      let countChars = 0;
      let maxChars = MAX_CHARS * Main.layoutManager.monitors.length;
      
      //only create 'maxChars' number of FallChars
      while (countChars < maxChars) {
      	let whichChar = FALLCHARS[Math.floor((Math.random() * FALLCHARS.length))];
      	let newFc = new FallCharacter({style: FC_STYLE, text: whichChar}, this);
      	newFc.fall();
      	countChars++;
      }
      
    }
    
    settingsChanged() {
    	FALLTEXT = settings.get_string("falltext");
    	FALLCHARS = [FALLTEXT];
    	COLOR = settings.get_string('textcolor');
    	FONT = settings.get_string('textfont');
    	
    	FC_STYLE = `font-family: "Impact", "Cantarell Bold";
    		font-size: 29px;
    		text-shadow: 1px 1px rgba(0, 0, 0, 0.4);
    		color: ${COLOR};
    		opacity: 255`;
    	
    	MONITORS = settings.get_int('fallmon');
    	DIRECTION = settings.get_int('falldirec'); //0=Down, 1=Up, 2=Left, 3=Right
    	AVG_TIME = settings.get_int('falltime');
    	AVG_ROT = settings.get_int('fallrot');
    	AVG_DRIFT = settings.get_int('falldrift');
    	}
	  
    checkFall(fc) {
	//remove the FallChar from the screen
	Main.uiGroup.remove_actor(fc);
	
	if (disable == 1) {
	    //destroy the FallChar when it finishes falling
	    fc.destroy();
	} else {
	    //reset the FallChar
	    fc.fall();
	  }
    }
	  
  });

var Extension = GObject.registerClass({
  GTypeName: 'Extension',
  Properties: {},
  Signals: {},
  },
  class Extension extends GObject.Object {
    _init() {
      var fcm = new FCM();
      this.fcm = fcm;
    }

    enable() {
      disable = 0;
      this.fcm.dropChars();
    }

    disable() {
      disable = 1;
    }
  });

function init() {
    return new Extension();
}
