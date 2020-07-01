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

const MAX_CHARS = 10;
const FALLCHARS = ["🍁️","🍂️","🐘️","🇹🇬️", "❄", "❅", "❆"];
const FC_STYLE = "font-size: 29px; text-shadow: 1px 1px rgba(0, 0, 0, 0.4); color: #ffffff; opacity: 255";
const END_X_MDIFF = 50;
const TIME = 5;
const TIME_MDIFF = 2;
const ROTATION_MDIFF = 180;

let button;
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
      let monitor = Main.layoutManager.primaryMonitor;
      let startX = monitor.x + Math.floor(Math.random() * (monitor.width - this.width));
      let startY = monitor.y - this.height;
      
      let endX = startX + Math.floor((Math.random() * END_X_MDIFF * 2) - END_X_MDIFF);
      let endY = monitor.y + monitor.height - this.height;
      
      let time = (TIME + (Math.random() * TIME_MDIFF * 2) - TIME_MDIFF) * 1000;
      let rotation = Math.floor((Math.random() * ROTATION_MDIFF * 2) - ROTATION_MDIFF);
      
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
		  this.sliderValue = 0.3;
    }
    
    dropChars() {
      let countChars = 0;
      let maxChars = Math.floor(this.sliderValue * MAX_CHARS) * Main.layoutManager.monitors.length;
      
      //only create 'maxChars' number of FallChars
		  while (countChars < maxChars) {
			  let whichChar = FALLCHARS[Math.floor((Math.random() * FALLCHARS.length))];
			  let newFc = new FallCharacter({style: FC_STYLE, text: whichChar}, this);
			  
			  newFc.fall();
			  
		    countChars++;
		  }
      
    }
    
    changed(newValue) {
		  this.sliderValue = newValue;
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
      button = new St.Bin({style_class: 'panel-button',
                reactive: true,
                can_focus: true,
                x_fill: true,
                y_fill: false,
                track_hover: true});
      let icon = new St.Icon({icon_name:'system-run-symbolic',
                style_class: 'system-status-icon'});
      
      button.set_child(icon);
      
      var fcm = new FCM();
      this.fcm = fcm;
      
      //button.connect('button-press-event', fcm.toggle );
    }

    enable() {
      Main.panel._rightBox.insert_child_at_index(button, 0);
      disable = 0;
      this.fcm.dropChars();
    }

    disable() {
      Main.panel._rightBox.remove_child(button);
      disable = 1;
    }
  });

function init() {
    return new Extension();
}
