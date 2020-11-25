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
const Utils = Me.imports.utils;

let settings = Utils.getSettings();

let FALLITEMS;
let COLOR;
let FONT;
let SIZE;
let FI_STYLE;
let MONITORS;
let DIRECTION;
let MAX_ITEMS;
let AVG_TIME;
let AVG_ROT;
let AVG_DRIFT;
let TIME_MDIFF = 2;

let disable;

var FallItem = GObject.registerClass({
  GTypeName: 'FallItem',
  Properties: {},
  Signals: {},
  },
  class FallItem extends St.Label {
    _init(whichItem, fim) {
      super._init();
      this.whichItem = whichItem;
      this.fim = fim; //reference back to the FallItemsManager (FIM)
    }
    
    fall() {
      let monitor;
      
      if (MONITORS == 0) {
        monitor = Main.layoutManager.currentMonitor;
      } else {
        monitor = Main.layoutManager.primaryMonitor;
      }
      
      Main.uiGroup.add_actor(this);
      
      //get coordinates for the start and end points
      let startEndpoints = Utils.startEndPoints(DIRECTION, monitor, AVG_DRIFT, this);
      let startX = startEndpoints[0];
      let startY = startEndpoints[1];
      let endX = startEndpoints[2];
      let endY = startEndpoints[3];
      
      let time = (AVG_TIME + (2*Math.random()-1) * TIME_MDIFF) * 1000;
      let rotation = Math.floor( (2*Math.random()-1) * AVG_ROT);
      
      this.set_position(startX, startY);
      
      this.set_text(this.whichItem);
      this.set_style(FI_STYLE);
      
      this.save_easing_state();
      this.set_easing_mode(Clutter.AnimationMode.EASE_OUT_QUAD);
      this.set_easing_duration(time);
      this.set_position(endX, endY);
      this.set_rotation_angle(Clutter.RotateAxis.Z_AXIS, rotation);
      this.restore_easing_state();
      
      this.connect('transitions-completed', this.fim.checkFall.bind(this.fim));
    }
  });

var FIM = GObject.registerClass({
  GTypeName: 'FIM',
  Properties: {},
  Signals: {},
  },
  class FIM extends GObject.Object {
    _init() {
    	settings.connect('changed', this.settingsChanged.bind(this));
      	this.settingsChanged();
    }
    
    dropItems() {
      let countItems = 0;
      
      //only create MAX_ITEMS number of FallItems
      while (countItems < MAX_ITEMS) {
      	let whichItem = FALLITEMS[Math.floor((Math.random() * FALLITEMS.length))];
      	let newFi = new FallItem(whichItem, this);
      	newFi.fall();
      	countItems++;
      }
      
    }
    
    settingsChanged() {
    	FALLITEMS = settings.get_strv("falltext");
    	COLOR = settings.get_string('textcolor');
    	
    	//get the size as an integer from the GtkFontButton
    	SIZE = settings.get_string('textfont').slice(-2).trim();
    	
    	if (SIZE.length == 1) {
    	    FONT = settings.get_string('textfont').slice(0,-1).trim();
    	} else {
    	    FONT = settings.get_string('textfont').slice(0,-2).trim();
    	}
    	
    	FI_STYLE = `font-family: ${FONT};
    		font-size: ${SIZE + "px"};
    		color: ${COLOR}`;
    		
    		//text-shadow: 1px 1px rgba(0, 0, 0, 0.4); opacity: 255
    	
    	MONITORS = settings.get_int('fallmon');
    	DIRECTION = settings.get_int('falldirec'); //0=Down, 1=Up, 2=Right, 3=Left
    	MAX_ITEMS = settings.get_int('maxchars');
    	AVG_TIME = settings.get_int('falltime');
    	AVG_ROT = settings.get_int('fallrot');
    	AVG_DRIFT = settings.get_int('falldrift');
    	}
	  
    checkFall(fi) {
	//remove the FallItem from the screen
	Main.uiGroup.remove_actor(fi);
	
	if (disable == 1) {
	    //destroy the FallItem when it finishes falling
	    fi.destroy();
	} else {
	    //reset the FallItem
	    fi.fall();
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
      var fim = new FIM();
      this.fim = fim;
    }

    enable() {
      disable = 0;
      this.fim.dropItems();
    }

    disable() {
      disable = 1;
    }
  });

function init() {
    return new Extension();
}
