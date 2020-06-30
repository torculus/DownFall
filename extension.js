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

const MAX_CHARS = 100;
const FALLCHARS = ["🍁️","🍂️","🐘️","🇹🇬️"];
//const SNOWFLAKES = ["❄", "❅", "❆"];
const FC_STYLE = "text-shadow: 1px 1px rgba(0, 0, 0, 0.4); color: #ffffff; opacity: 255";
//const SF_STYLES = ["font-size: 29px; ", "font-size: 26px; ", "font-size: 23px; "];
const END_X_MDIFF = 50;
const TIME = 5;
const TIME_MDIFF = 2;
const ROTATION_MDIFF = 180;

let button;

var FallCharacter = GObject.registerClass({
  GTypeName: 'FallCharacter',
  Properties: {},
  Signals: {},
  },
  class FallCharacter extends St.Label {
    _init(description, fcm) {
      super._init(description);
      
      this.fcm = fcm; //reference back to the FallCharsManager (FCM)
      
      //this._fall = () => this.fall(); //lets FCM work properly
      //this.prototype.fall = this.fall.bind(this); //lets FCM work properly
      
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
      
      this.connect('transitions-completed', fcm.removeChars.bind(fcm));
    }
  });

var FCM = GObject.registerClass({
  GTypeName: 'FCM',
  Properties: {},
  Signals: {},
  },
  class FCM extends GObject.Object {
    _init() {
      this.countChars = 0;
		  this.maxChars = 50;
		  this.sliderValue = 0.3;
		  this.changed(0.3);
		  this.toggleSwitch = 0;
    }
    
    changed(newValue) {
		  this.sliderValue = newValue;
		  this.maxChars = Math.floor(this.sliderValue * MAX_CHARS) * Main.layoutManager.monitors.length;
		  
		  while (this.countChars < this.maxChars) { //limits rate
			  var whichChar = FALLCHARS[Math.floor((Math.random() * FALLCHARS.length))];
			  var newFc = new FallCharacter({style: FC_STYLE, text: whichChar}, this);
		    this.countChars++;
		  }
		  
	  }
	  
	  removeChars(lastfc) {
		  Main.uiGroup.remove_actor(lastfc);
		  lastfc.destroy();
		  this.countChars--;
	  }
	  
	  toggle() {
	    if (this.toggleSwitch == 0) {
	      //enable
	      this.changed(this.sliderValue);
	      this.toggleSwitch = 1;
	    } else {
	      //disable
	      this.maxChars = 0;
	      this.toggleSwitch = 0;
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
      
      button.connect('button-press-event', fcm.toggle );
    }

    enable() {
      Main.panel._rightBox.insert_child_at_index(button, 0);
    }

    disable() {
      Main.panel._rightBox.remove_child(button);
    }
  });

function init() {
    return new Extension();
}
