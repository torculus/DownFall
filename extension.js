/* DownFall – Gnome Shell Extension
 * Copyright (C) 2021 Benjamin S Osenbach
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
const GLib = imports.gi.GLib;
const Gdk = imports.gi.Gdk;
const Main = imports.ui.main;
const Clutter = imports.gi.Clutter;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;

// REMOVE THIS PART AFTER DONE TESTING
const Performance = Me.imports.performance;

let settings = Utils.getSettings();

let FALLITEMS;
let COLOR;
let FONT;
let SIZE;
let FI_STYLE;
let MATRIXTRAILS;
let FIREWORKS;
let MONITORS;
let DIRECTION;
let MAX_ITEMS;
let AVG_TIME;
let AVG_ROT;
let AVG_DRIFT;
let TIME_MDIFF = 2;

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
      
      //get coordinates for the start and end points
      let startEndpoints = Utils.startEndPoints(DIRECTION, monitor, AVG_DRIFT, this);
      let startX = startEndpoints[0];
      let startY = startEndpoints[1];
      let endX = startEndpoints[2];
      let endY = startEndpoints[3];
      
      if (FIREWORKS) {
      	//end in the middle
      	let alpha = Math.random();
      	endX = Math.floor(alpha*startX + (1-alpha)*endX);
      	endY = Math.floor(alpha*startY + (1-alpha)*endY);
      	this.endX = endX; this.endY = endY;
      }
      
      let time = (AVG_TIME + (2*Math.random()-1) * TIME_MDIFF) * 1000;
      let rotation = Math.floor( (2*Math.random()-1) * AVG_ROT);
      
      this.set_position(startX, startY);
      
      this.set_text(this.whichItem);
      this.set_style(FI_STYLE);
      
      this.show();
      
      this.save_easing_state();
      
      if (MATRIXTRAILS) {
      	this.set_easing_mode(Clutter.AnimationMode.LINEAR);
      	this.set_style(FI_STYLE + `color: #ffffff`);
      	
      	//get number of steps between (startX,startY) and (endX,endY)
      	let n = Math.ceil( Math.max( (endX-startX)/this.width, (endY-startY)/this.height ) );
      	let stepX = Math.ceil( (endX-startX)/n );
      	let stepY = Math.ceil( (endY-startY)/n );
      	
      	//rapidly change the FallItem
      	//GLib.timeout_add(GLib.PRIORITY_LOW, 500, () => {
      	//		this.set_text(FALLITEMS[Math.floor((Math.random() * FALLITEMS.length))]);
      	//		return GLib.SOURCE_CONTINUE;});
      	
      	//move towards (endX, endY)
      	for (var i=0; i < n; i++) {
      	    //pick out random item
      	    let matritem = new St.Label();
      	    Main.uiGroup.add_actor(matritem);
      	    matritem.set_position(startX + i*stepX, startY + i*stepY);
      	    matritem.set_text( FALLITEMS[Math.floor((Math.random() * FALLITEMS.length))] );
      	    matritem.set_style(`font-size: ${SIZE + "px"}; color: ${COLOR};`);
      	    
      	    matritem.hide();
      	    
      	    //show the item after a delay
      	    GLib.timeout_add(GLib.PRIORITY_DEFAULT, time*i/n,
      	    	() => {	matritem.show();
      	    		return GLib.SOURCE_REMOVE;});
      	    
      	    //remove the item after time milliseconds
      	    GLib.timeout_add(GLib.PRIORITY_DEFAULT, time,
      	    	() => {matritem.destroy(); //Main.uiGroup.remove_actor(matritem);
      	    		return GLib.SOURCE_REMOVE;});
      	}
      	
      } else {
      	this.set_easing_mode(Clutter.AnimationMode.EASE_OUT_QUAD);
      }
      
      this.set_easing_duration(time);
      this.set_position(endX, endY);
      this.set_rotation_angle(Clutter.RotateAxis.Z_AXIS, rotation);
      this.restore_easing_state();
      this.connect('transitions-completed', this.finish.bind(this) );     
    }
    
    finish() {
      this.hide();
      
      if (FIREWORKS) {
      	//explode
      	for (var n=0; n<6; n++) {
      	  let flare = new St.Label();
    	  let flcolor = "#" + Math.floor(Math.random()*16777215).toString(16);
    	  
    	  Main.uiGroup.add_actor(flare);
    	  flare.set_position(this.endX, this.endY);
    	  flare.set_text(".");
    	  flare.set_style(`font-size: ${SIZE + "px"};
    	  		   color: ${flcolor};`);
    	  flare.save_easing_state();
    	  flare.set_easing_mode(Clutter.AnimationMode.EASE_OUT_QUAD);
    	  flare.set_easing_duration(2000);
    	  
    	  //get hexagonal coordinates relative to the endX, endY
    	  //     i=2  i=1					(-s/2,s*sqrt(3)/2)  (+s/2, s*sqrt(3)/2)
    	  // i=3		i=0	goes with	(-s,0)						(+s,0)
    	  //     i=4  i=5					(-s/2,-s*sqrt(3)/2) (+s/2, -s*sqrt(3)/2)
    	  let Xflr = this.endX + Math.floor( (-1)**( (n%5) > 1)*(1/2)**( (n%3) > 0) * 200 );
    	  let Yflr = this.endY + Math.floor( (-1)**(n>3)*( (n%3) > 0)*Math.sqrt(3)/2 * 200 );
    	  
    	  flare.set_position(Xflr, Yflr);
    	  flare.restore_easing_state();
    	  flare.connect('transitions-completed', () => {flare.destroy(); return 0;} ); //Main.uiGroup.remove_actor(flare);
    	}
      }
      
      //reset the FallItem after a delay (reduces CPU load)
      /////////////////////////////////////////////////////////////////////////////////////////
      Performance.start("Test1");
      this.idle()
      	.then( result => {this.fall()} );
      Performance.end();
      /////////////////////////////////////////////////////////////////////////////////////////
    }
    
    idle() {
      return new Promise( resolve => GLib.idle_add(GLib.PRIORITY_LOW,
      				() => {resolve(0); return GLib.SOURCE_REMOVE}) );
    }
    
  });

var FIM = GObject.registerClass({
  GTypeName: 'FIM',
  Properties: {},
  Signals: {},
  },
  class FIM extends St.Widget { //see https://gjs-docs.gnome.org/clutter5~5_api/clutter.actor#method-destroy_all_children
    _init() {
    	let ca = new Clutter.Actor();
    	this.ca = ca;
    	
    	settings.connect('changed', this.settingsChanged.bind(this));
      	this.settingsChanged();
    }
    
    dropItems() {
      let countItems = 0;
      
      //only create MAX_ITEMS number of FallItems
      while (countItems < MAX_ITEMS) {
      	let whichItem = FALLITEMS[Math.floor((Math.random() * FALLITEMS.length))];
      	let newFi = new FallItem(whichItem, this);
      	
      	// THIS CODE IS CAUSING ISSUES
      	this.ca.add_child( newFi.get_clutter_text() );
      	
      	//newFi is an St.Label, which can't be added to ClutterActor. How about `this.add_child( newFi.get_clutter_text() )`
      	
      	Main.uiGroup.add_actor(newFi);
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
    	
    	var font_fam;
    	var font_weight = "normal";
    	var font_style = "normal";
    	
    	//most fonts are Regular, Bold, Italic, Bold Italic, or Oblique
    	if (FONT.includes("Regular")) {
    	    font_fam = FONT.slice( 0, FONT.indexOf("Regular") ).trim();
    	} else if (FONT.search("Bold Italic|Bold Oblique") > 0) {
    	    font_fam = FONT.slice( 0, FONT.search("Bold") ).trim();
    	    font_weight = "bold";
    	    font_style = "italic";
    	} else if (FONT.includes("Bold")) {
    	    font_fam = FONT.slice( 0, FONT.indexOf("Bold") ).trim();
    	    font_weight = "bold";
    	} else if (FONT.search("Italic|Oblique") > 0) {
    	    font_fam = FONT.slice( 0, FONT.search("Italic|Oblique") ).trim();
    	    font_style = "italic";
    	}
    	
    	FI_STYLE = `font-family: ${font_fam};
    		font-weight: ${font_weight};
    		font-style: ${font_style};
    		font-size: ${SIZE + "px"};
    		color: ${COLOR}`;
    		
    		//text-shadow: 1px 1px rgba(0, 0, 0, 0.4); opacity: 255
    	
    	MATRIXTRAILS = settings.get_boolean('matrixtrails');
    	FIREWORKS = settings.get_boolean('fireworks');
    	MONITORS = settings.get_int('fallmon');
    	DIRECTION = settings.get_int('falldirec'); //0=Down, 1=Up, 2=Right, 3=Left
    	MAX_ITEMS = settings.get_int('maxchars');
    	AVG_TIME = settings.get_int('falltime');
    	AVG_ROT = settings.get_int('fallrot');
    	AVG_DRIFT = settings.get_int('falldrift');
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
      this.fim.dropItems();
    }

    disable() {
      // SO IS THIS CODE
      this.fim.ca.destroy_all_children();
    }
  });

function init() {
    return new Extension();
}
