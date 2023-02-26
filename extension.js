/* DownFall – Gnome Shell Extension
 * Copyright (C) 2019-2023 Benjamin S Osenbach
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

const {St, GObject, GLib} = imports.gi;
const Main = imports.ui.main;
const Clutter = imports.gi.Clutter;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;

let FALLITEMS;
let COLOR;
let FI_STYLE;
let MONITORS;
let DIRECTION;
let FALL3D;
let MAX_ITEMS;
let AVG_TIME;
let AVG_ROT;
let AVG_DRIFT;
let TIME_MDIFF = 2;

let MATRIXTRAILS;
let MATDISP;
let MATCOLOR;
let MAT_STYLE;

let FIREWORKS;
let FLRDISP;
let FLRCOLOR;
let FLR_STYLE;

var FallItem = GObject.registerClass({
  GTypeName: 'FallItem',
  Properties: {},
  Signals: {},
  },
  class FallItem extends St.Label {
    _init(fim) {
      super._init();
      this.fim = fim; //reference back to the FallItemsManager (FIM)
    }

	style(fistyle, text) {
	  //don't style on each iteration of fall()
	  this.set_text(text);

      if (MATRIXTRAILS) {
      	this.set_style(fistyle + `color: #ffffff`);
	  } else {
		this.set_style(fistyle);
	  }
	}
    
    fall() {
      this.idleID = null;
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
      	let alpha = GLib.random_int_range(33,50)/100;
      	endX = Math.floor(alpha*startX + (1-alpha)*endX);
      	endY = Math.floor(alpha*startY + (1-alpha)*endY);
      	this.endX = endX; this.endY = endY;
      }
      
      let time = (AVG_TIME + GLib.random_int_range(-50,50)/100 * TIME_MDIFF) * 1000;
      let rotation = Math.floor( GLib.random_int_range(-50,50)/100 * AVG_ROT);
      
      let cluttermode = MATRIXTRAILS ? Clutter.AnimationMode.LINEAR
      				     : Clutter.AnimationMode.EASE_OUT_QUAD;
      
      this.set_position(startX, startY);
      
      this.show();
      
      if (MATRIXTRAILS) {
      	//get number of steps between (startX,startY) and (endX,endY)
      	let n = Math.ceil( Math.max( Math.abs(endX-startX)/this.width, Math.abs(endY-startY)/this.height ) );
      	
      	//add a new Matrix trail character every `time/n` milliseconds
      	if (!this.matAddID) { //only on first fall
      	  this.matAddID = GLib.timeout_add(GLib.PRIORITY_LOW, time/n,
      		() => {
      		    let matritem = new St.Label();
      		    this.fim.mc.add_child(matritem);
      		    let pos = this.get_position();
      		    //set the matritem at the current FallItem position
      		    matritem.set_position(pos[0], pos[1]);
      	    	    matritem.set_text( MATDISP[ GLib.random_int_range(0, MATDISP.length) ] );
      	    	    matritem.set_style(MAT_STYLE);
      	    	    matritem.show();
      	    	    
      	    	    //change the FallItem text
      	    	    this.set_text( FALLITEMS[ GLib.random_int_range(0, FALLITEMS.length) ] );
      	    	    
      	    	    //destroy the matritem after `time` milliseconds
      	    	    matritem.matRemID = GLib.timeout_add( GLib.PRIORITY_LOW, time,
      	    	    	() => {this.fim.mc.remove_child(matritem);
      	    	    	       matritem.destroy();
      	    	    	       return GLib.SOURCE_REMOVE} );
      	    	    
      	    	    return GLib.SOURCE_CONTINUE; //stopped on 'destroy' signal
      		});
      	}
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
    	  
    	  this.fim.pane3D.add_child(flare);
    	  flare.set_position(this.endX, this.endY);
    	  flare.set_text( FLRDISP[ GLib.random_int_range(0, FLRDISP.length) ] );
    	  flare.set_style(FLR_STYLE);
    	  
    	  /*get hexagonal coordinates relative to the endX, endY
    	  	i=2  i=1			(-s/2,s*sqrt(3)/2)  (+s/2, s*sqrt(3)/2)
    	  i=3		i=0	goes with  (-s,0)				      (+s,0)
    	  	i=4  i=5			(-s/2,-s*sqrt(3)/2) (+s/2, -s*sqrt(3)/2)
    	  */
    	  let Xflr = this.endX + Math.floor( (-1)**( (n%5) > 1)*(1/2)**( (n%3) > 0) * 200 );
    	  let Yflr = this.endY + Math.floor( (-1)**(n>3)*( (n%3) > 0)*Math.sqrt(3)/2 * 200 );
    	      	  
    	  flare.ease({
    	    x : Xflr,
    	    y : Yflr,
    	    duration : 2000,
    	    mode : Clutter.AnimationMode.EASE_OUT_EXPO,
    	    onComplete : () => {flare.destroy()}
    	  });
    	  
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
    _init(settings) {
        super._init();
    	this.settings = settings;
    	
    	if (FALL3D == 0) { //in front
    	  this.pane3D = global.top_window_group; //Main.uiGroup, Main.overviewGroup, Main.screenShieldGroup, Main.modalDialogGroup, global.window_group, global.top_window_group, 
    	} else {
    	  this.pane3D = Main.layoutManager._backgroundGroup;
    	}
    	
    	let itemContainer = new Clutter.Actor(); //a place to store our FallItems
    	this.ic = itemContainer;
    	this.pane3D.add_child(this.ic);
    	
    	let matContainer = new Clutter.Actor(); //a place to store our matritems
    	this.mc = matContainer;
    	this.pane3D.add_child(this.mc);
    	
    	this.settings.connect('changed', this.settingsChanged.bind(this));
      	this.settingsChanged();
    }
    
    dropItems() {
      //only create MAX_ITEMS number of FallItems
      for (let i=0; i < MAX_ITEMS; i++) {
      	let newFi = new FallItem(this);
      	this.ic.add_child(newFi);
      }
      
      //make it rain
      this.ic.get_children().forEach( (fi) => {
	    let whichItem = FALLITEMS[ GLib.random_int_range(0, FALLITEMS.length) ];
		fi.style(FI_STYLE, whichItem);
		fi.fall();} );
    }
    
    settingsChanged() {
    	FALLITEMS = this.settings.get_strv("falltext");
    	COLOR = this.settings.get_string('textcolor');
    	
    	let fi_fontstring = this.settings.get_string('textfont');
    	let [font_fam, font_weight, font_style, font_size] = Utils.get_font_props(fi_fontstring);
    	    	
    	FI_STYLE = `font-family: ${font_fam};
    		font-weight: ${font_weight};
    		font-style: ${font_style};
    		font-size: ${font_size + "px"};
    		color: ${COLOR}`;
    		//text-shadow: 1px 1px rgba(0, 0, 0, 0.4); opacity: 255
    	
    	MONITORS = this.settings.get_int('fallmon');
    	DIRECTION = this.settings.get_int('falldirec'); //0=Down, 1=Up, 2=Right, 3=Left
    	FALL3D = this.settings.get_int('fall3d'); //0=in front, 1=behind
    	MAX_ITEMS = this.settings.get_int('maxitems');
    	AVG_TIME = this.settings.get_int('falltime');
    	AVG_ROT = this.settings.get_int('fallrot');
    	AVG_DRIFT = this.settings.get_int('falldrift')/100; //decimal percentage (e.g. 0.43)
    	
    	MATRIXTRAILS = this.settings.get_boolean('matrixtrails');
    	if (MATRIXTRAILS) {
    	    MATDISP = this.settings.get_strv("matdisplay");
    	    MATCOLOR = this.settings.get_string('matcolor');
    	    let mat_fontstring = this.settings.get_string('matfont');
    	    let [mat_fam, mat_weight, mat_style, mat_size] = Utils.get_font_props(mat_fontstring);
    	    MAT_STYLE = `font-family: ${mat_fam};
    	    		   font-weight: ${mat_weight};
    	    		   font-style: ${mat_style};
    	    		   font-size: ${mat_size + "px"};
    	    		   color: ${MATCOLOR}`;
    	}
    	
    	FIREWORKS = this.settings.get_boolean('fireworks');
    	if (FIREWORKS) {
    	    FLRDISP = this.settings.get_strv("flrdisplay");
    	    FLRCOLOR = this.settings.get_string('flrcolor');
    	    let flr_fontstring = this.settings.get_string('flrfont');
    	    let [flr_fam, flr_weight, flr_style, flr_size] = Utils.get_font_props(flr_fontstring);
    	    FLR_STYLE = `font-family: ${flr_fam};
    	    		   font-weight: ${flr_weight};
    	    		   font-style: ${flr_style};
    	    		   font-size: ${flr_size + "px"};
    	  		   color: ${FLRCOLOR}`;
    	}
       
		this.ic.get_children().forEach( (fi) => {
			let whichItem = FALLITEMS[ GLib.random_int_range(0, FALLITEMS.length) ];
			fi.style(FI_STYLE, whichItem); } );
    	
    }
    	 
  });

var Extension = GObject.registerClass({
  GTypeName: 'Extension',
  Properties: {},
  Signals: {},
  },
  class Extension extends GObject.Object {
    _init() {
      super._init();
    }

    enable() {
      let settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.downfall');
      let fim = new FIM(settings);
      this.fim = fim;
      this.fim.dropItems();
    }

    disable() {
      let settings = null;
      
      //stop all of the timers
      this.fim.ic.get_children()
      	.forEach( (fi) => { if (fi.idleID) {
      				GLib.source_remove(fi.idleID);
      			    	fi.IdleID = null;
      			    }
      			    if (fi.matAddID) {
      				GLib.source_remove(fi.matAddID);
      				fi.matAddID = null;
      			    }
      			    //remove all of the FallItems
      			    this.fim.ic.remove_child(fi);
      			    fi.destroy() } );
      this.fim.mc.get_children()
      	.forEach( (mi) => { GLib.source_remove(mi.matRemID);
      			    mi.matRemID = null;
      			    //remove any matritems
      			    this.fim.mc.remove_child(mi);
      			    mi.destroy() } );
      
      //remove everything else
      this.fim.pane3D.remove_child(this.fim.ic);
      this.fim.ic.destroy();
      this.fim.pane3D.remove_child(this.fim.mc);
      this.fim.mc.destroy();
      this.fim = null;
    }
  });

function init() {
    ExtensionUtils.initTranslations(Me.metadata.uuid);
    return new Extension();
}
