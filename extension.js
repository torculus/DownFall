/* DownFall – Gnome Shell Extension
 * Copyright (C) 2019-2021 Benjamin S Osenbach
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
      
      //stop matrix trails on 'destroy' signal
      this.connect('destroy', () => {
      		if (MATRIXTRAILS) {GLib.source_remove(this.matID);}
      		});
    }
    
    fall() {
      let monitor = (MONITORS == 0) ? Main.layoutManager.currentMonitor
      				    : Main.layoutManager.primaryMonitor;
      
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
      
      let cluttermode = MATRIXTRAILS ? Clutter.AnimationMode.LINEAR
      				     : Clutter.AnimationMode.EASE_OUT_QUAD;
      
      this.set_position(startX, startY);
      
      this.set_text(this.whichItem);
      this.set_style(FI_STYLE);
      
      this.show();
      
      if (MATRIXTRAILS) {
      	this.set_style(FI_STYLE + `color: #ffffff`);
      	
      	//get number of steps between (startX,startY) and (endX,endY)
      	let n = Math.ceil( Math.max( (endX-startX)/this.width, (endY-startY)/this.height ) );
      	
      	//add a new Matrix trail character every `time/n` milliseconds
      	this.matID = GLib.timeout_add(GLib.PRIORITY_LOW, time/n,
      		() => {
      		    let matritem = new St.Label();
      		    this.fim.mc.add_child(matritem);
      		    let pos = this.get_position();
      		    //set the matritem at the current FallItem position
      		    matritem.set_position(pos[0], pos[1]);
      	    	    matritem.set_text( FALLITEMS[Math.floor((Math.random() * FALLITEMS.length))] );
      	    	    matritem.set_style(FI_STYLE);
      	    	    matritem.show();
      	    	    
      	    	    //change the FallItem text
      	    	    this.set_text( FALLITEMS[Math.floor((Math.random() * FALLITEMS.length))] );
      	    	    
      	    	    //destroy the matritem after `time` milliseconds
      	    	    GLib.timeout_add(GLib.PRIORITY_LOW, time,
      	    	    	() => {matritem.destroy(); return GLib.SOURCE_REMOVE});
      	    	    
      	    	    return GLib.SOURCE_CONTINUE; //stopped on 'destroy' signal
      		});
      }
      
      this.ease({
      	x : endX,
      	y : endY,
      	duration : time,
      	mode : cluttermode,
      	rotation_angle_z : rotation,
      	onComplete : () => {this.finish()}
      });
      
    }
    
    finish() {
      this.hide();
      
      if (FIREWORKS) {
      	//explode
      	for (let n=0; n<6; n++) {
      	  let flare = new St.Label();
    	  let flcolor = "#" + Math.floor(Math.random()*16777215).toString(16);
    	  
    	  Main.uiGroup.add_child(flare);
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
    	  flare.connect('transitions-completed', () => {flare.destroy();} );
    	}
      }
      
      //reset the FallItem after a delay (reduces CPU load)    
      this.idleID = GLib.idle_add(GLib.PRIORITY_LOW,
      			() => {this.fall(); return GLib.SOURCE_REMOVE});
    }
    
  });

var FIM = GObject.registerClass({
  GTypeName: 'FIM',
  Properties: {},
  Signals: {},
  },
  class FIM extends GObject.Object {
    _init() {
    	let itemContainer = new Clutter.Actor(); //a place to store our FallItems
    	this.ic = itemContainer;
    	Main.uiGroup.add_child(this.ic);
    	
    	let matContainer = new Clutter.Actor(); //a place to store our matritems
    	this.mc = matContainer;
    	Main.uiGroup.add_child(this.mc);
    	
    	settings.connect('changed', this.settingsChanged.bind(this));
      	this.settingsChanged();
    }
    
    dropItems() {
      //only create MAX_ITEMS number of FallItems
      for (let i=0; i < MAX_ITEMS; i++) {
      	let whichItem = FALLITEMS[Math.floor((Math.random() * FALLITEMS.length))];
      	let newFi = new FallItem(whichItem, this);
      	this.ic.add_child(newFi);
      }
      
      //make it rain
      this.ic.get_children().forEach( (fi) => {fi.fall();} );
    }
    
    settingsChanged() {
    	FALLITEMS = settings.get_strv("falltext");
    	COLOR = settings.get_string('textcolor');
    	
    	//get the size as an integer from the GtkFontButton string
    	SIZE = settings.get_string('textfont').slice(-2).trim();
    	
    	if (SIZE.length == 1) {
    	    FONT = settings.get_string('textfont').slice(0,-1).trim();
    	} else {
    	    FONT = settings.get_string('textfont').slice(0,-2).trim();
    	}
    	
    	let font_fam;
    	let font_weight = "normal";
    	let font_style = "normal";
    	
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
    constructor() {}

    enable() {
      let fim = new FIM();
      this.fim = fim;
      this.fim.dropItems();
    }

    disable() {
      //remove all of the FallItems
      Main.uiGroup.remove_child(this.fim.ic);
      this.fim.ic.destroy_all_children();
      this.fim.ic.destroy();
      
      //remove any matritems
      Main.uiGroup.remove_child(this.fim.mc);
      this.fim.mc.destroy_all_children();
      this.fim.mc.destroy();
      
      this.fim = null;
    }
  });

function init() {
    return new Extension();
}
