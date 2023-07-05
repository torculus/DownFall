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

'use strict';

const {St, Gio, GObject, GLib, Clutter} = imports.gi;
const Main = imports.ui.main;
const QuickSettings = imports.ui.quickSettings;
const QuickSettingsMenu = Main.panel.statusArea.quickSettings;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;

var FallItem = GObject.registerClass({
  GTypeName: 'FallItem',
  Properties: {},
  Signals: {},
  },
  class FallItem extends St.Label {
    _init(fim) {
      super._init();
      this.fim = fim; //reference back to the FallItemsManager (FIM)

      //matrixtrails stuff
      this.trailson = false;
      this.matAddID = null;
    }

    change(text, fontstring, color) {
      //don't style on each iteration of fall()
      this.set_style(`color: ${color}`);

      this.get_clutter_text().set_font_name(fontstring);
      
      this.set_text(text);
    }
    
    fall() {
      this.idleID = null;
      this.monitor = (this.fim.MONITORS == 0) ? Main.layoutManager.currentMonitor
      				    : Main.layoutManager.primaryMonitor;
      
      //get coordinates for the start and end points
      let startEndpoints = Utils.startEndPoints(this.fim.DIRECTION, this.monitor, this.fim.AVG_DRIFT, this);
      let startX = startEndpoints[0];
      let startY = startEndpoints[1];
      let endX = startEndpoints[2];
      let endY = startEndpoints[3];
      
      if (this.fim.FIREWORKS) {
      	//end in the middle
      	let alpha = GLib.random_int_range(33,50)/100;
      	endX = Math.floor(alpha*startX + (1-alpha)*endX);
      	endY = Math.floor(alpha*startY + (1-alpha)*endY);
      	this.endX = endX; this.endY = endY;
      }
      
      let time = (this.fim.AVG_TIME + GLib.random_int_range(-1,1)) * 1000;
      let rotation = Math.floor( GLib.random_int_range(-50,50)/100 * this.fim.AVG_ROT);
      
      let cluttermode = this.fim.MATRIXTRAILS ? Clutter.AnimationMode.LINEAR
      				     : Clutter.AnimationMode.EASE_OUT_QUAD;
      
      this.set_position(startX, startY);
      
      this.show();
      
      if (this.fim.MATRIXTRAILS) {
	if (!this.trailson) { //only add on first fall
	  this.matrixtrail(startX, startY, endX, endY, time);
	} else {
	  this.matAddID = null;
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

    matrixtrail(startX, startY, endX, endY, time) {
      this.trailson = true;

      //get number of steps between (startX,startY) and (endX,endY)
      let n = Math.ceil( Math.max( Math.abs(endX-startX)/this.width, Math.abs(endY-startY)/this.height ) );
      
      for(var i=0; i<n; i++) {
      	let matritem = new St.Label();
	this.fim.mc.add_child(matritem);
	matritem.set_style(`color: ${this.fim.MATCOLOR}`);
	matritem.get_clutter_text().set_font_name(this.fim.MATFONT);
	matritem.set_text( this.fim.MATDISP[ GLib.random_int_range(0, this.fim.MATDISP.length) ] );
	matritem.hide();

	//show a new Matrix trail character every `time/n` milliseconds
	this.matAddID = GLib.timeout_add(GLib.PRIORITY_LOW, time*(1+i)/n, () => {
		//set the matritem at the current FallItem position
		let pos = this.get_position();
      		matritem.set_position(pos[0], pos[1]);
		matritem.show();
		
		//change the FallItem text
		this.set_text( this.fim.FALLITEMS[ GLib.random_int_range(0, this.fim.FALLITEMS.length) ] );

		matritem.matChangeID = GLib.timeout_add(GLib.PRIORITY_LOW, time, () => {
			//change the FallItem text
			this.set_text( this.fim.FALLITEMS[ GLib.random_int_range(0, this.fim.FALLITEMS.length) ] );

			matritem.hide();

			//move and change the matritem after `time` milliseconds
			let pos = this.get_position();
			matritem.set_position(pos[0], pos[1]);
			matritem.set_text( this.fim.MATDISP[ GLib.random_int_range(0, this.fim.MATDISP.length) ] );
			matritem.show();
			return GLib.SOURCE_CONTINUE; //stopped on 'destroy' signal
		});
		
		return GLib.SOURCE_REMOVE; //stop this after it's added 1st time
	});

      }

    }
    
    finish() {
      this.hide();
      
      if (this.fim.FIREWORKS) {
      	//explode
      	for (let n=0; n<6; n++) {
      	  let flare = new St.Label();
    	  //let flcolor = "#" + Math.floor(Math.random()*16777215).toString(16);

	  let angle = GLib.random_double_range(0, 6.28);
	  let speed = GLib.random_int_range(30, 70);
    	  
    	  this.fim.pane3D.add_child(flare);
    	  flare.set_position(this.endX, this.endY);
    	  flare.set_style(`color:${this.fim.FLRCOLOR}`);
      	  flare.get_clutter_text().set_font_name(this.fim.FLRFONT);
    	  flare.set_text( this.fim.FLRDISP[ GLib.random_int_range(0, this.fim.FLRDISP.length) ] );
    	  
    	  flare.ease({
    	    x : this.endX + Math.cos(angle)*speed/100 * this.monitor.width,
    	    y : this.endY + Math.sin(angle)*speed/100 * this.monitor.height + 1,
    	    duration : 2000,
	    opacity: 0,
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

const FIM = GObject.registerClass({
  GTypeName: 'FIM',
  Properties: {},
  Signals: {},
  },
  class FIM extends GObject.Object {
    _init(settings) {
        super._init();
    	this.settings = settings;
	this.MATRIXTRAILSON = false;
   	
    	this.ic = new Clutter.Actor(); //a place to store our FallItems
    	this.mc = new Clutter.Actor(); //a place to store our matritems

    	this.settings.connect('changed', this.settingsChanged.bind(this));

	this.loadSettings();
    }

    loadSettings() {
    	this.ENABLED = this.settings.get_boolean('feature-enabled');

    	this.FALL3D = this.settings.get_int('fall3d');

    	this.FALLITEMS = this.settings.get_strv("falltext");
    	this.FALLCOLOR = this.settings.get_string('textcolor');

    	this.FALLFONT = this.settings.get_string('textfont');
    	
    	this.MONITORS = this.settings.get_int('fallmon');
    	this.DIRECTION = this.settings.get_int('falldirec'); //0=Down, 1=Up, 2=Right, 3=Left
    	this.MAX_ITEMS = this.settings.get_int('maxitems');
    	this.AVG_TIME = this.settings.get_int('falltime');
    	this.AVG_ROT = this.settings.get_int('fallrot');
    	this.AVG_DRIFT = this.settings.get_int('falldrift')/100; //decimal percentage (e.g. 0.43)
    	
    	this.MATRIXTRAILS = this.settings.get_boolean('matrixtrails');
    	if (this.MATRIXTRAILS) {
	  this.MATDISP = this.settings.get_strv("matdisplay");
    	  this.MATCOLOR = this.settings.get_string('matcolor');
	  this.MATFONT = this.settings.get_string('matfont');
	  this.MATRIXTRAILSON = true;
	}

    	this.FIREWORKS = this.settings.get_boolean('fireworks');
    	if (this.FIREWORKS) {
    	  this.FLRDISP = this.settings.get_strv("flrdisplay");
    	  this.FLRCOLOR = this.settings.get_string('flrcolor');
    	  this.FLRFONT = this.settings.get_string('flrfont');
    	}
    }

    settingsChanged() {
    	this.loadSettings();

	//restart if matrixtrails are turned off while running
	if (this.MATRIXTRAILSON && !this.MATRIXTRAILS) {
	  this.MATRIXTRAILSON = false;
	  this.reset().then( this.dropItems() );
	}

	//update the FallItems
	this.ic.get_children().forEach( (fi) => {
		let whichItem = this.FALLITEMS[ GLib.random_int_range(0, this.FALLITEMS.length) ];
		fi.change(whichItem, this.FALLFONT, this.FALLCOLOR); } );
    }

    dropItems() {
      if (this.FALL3D == 0) { //in front
      	this.pane3D = global.top_window_group; 
      } else {
      	//Main.uiGroup, Main.overviewGroup, Main.screenShieldGroup, Main.modalDialogGroup, global.window_group, global.top_window_group 
	this.pane3D = Main.layoutManager._backgroundGroup;
      }

      this.pane3D.add_child(this.ic);
      this.pane3D.add_child(this.mc);

      //only create MAX_ITEMS number of FallItems
      for (let i=0; i < this.MAX_ITEMS; i++) {
      	let newFi = new FallItem(this);
      	this.ic.add_child(newFi);
      }
      
      //make it rain
      this.ic.get_children().forEach( (fi) => {
		let whichItem = this.FALLITEMS[ GLib.random_int_range(0, this.FALLITEMS.length) ];
		fi.change(whichItem, this.FALLFONT, this.FALLCOLOR);
		fi.fall();} );
    }

    stopTimers() {
      //stop all of the timers
      return new Promise( resolve => {
      	this.ic.get_children()
      		.forEach( (fi) => { if (fi.idleID) {
      				GLib.source_remove(fi.idleID);
      			    	fi.IdleID = null;
      			    }
      			    if (fi.matAddID) {
      				GLib.source_remove(fi.matAddID);
      				fi.matAddID = null;
      			    }
      			  } );
	
      	this.mc.get_children()
      		.forEach( (mi) => { GLib.source_remove(mi.matChangeID);
      			    mi.matChangeID = null;
      			  } );
	resolve('0');
      } );
    }

    reset() {
	//make sure the sources are removed before destroying anything
    	this.stopTimers().then( () => {
				//remove all of the FallItems
				this.ic.destroy_all_children();
				//remove any matritems
      				this.mc.destroy_all_children() } )
			.then( () => {
				//remove containers from pane3D
				this.pane3D.remove_child(this.ic);
				this.pane3D.remove_child(this.mc) } );
    }

    toggle() {
      this.loadSettings();

      if (this.ENABLED) {
        this.dropItems();
      } else {
      	this.reset();
      }
    }

  });

const FeatureToggle = GObject.registerClass(
class FeatureToggle extends QuickSettings.QuickToggle {
    _init(fim) {
        super._init({
	    title: 'DownFall',
            iconName: 'selection-mode-symbolic',
            toggleMode: true,
        });

        this.fim = fim;
        
        // Binding the toggle to a GSettings key
	this._settings = ExtensionUtils.getSettings();

        this._settings.bind('feature-enabled',
            this, 'checked',
            Gio.SettingsBindFlags.DEFAULT);
	
	this.connect('clicked', this.fim.toggle.bind(this.fim));
    }
  });

const FeatureIndicator = GObject.registerClass(
class FeatureIndicator extends QuickSettings.SystemIndicator {
    _init(fim) {
        super._init();

        this.fim = fim;

        // Create the icon for the indicator
        this._indicator = this._addIndicator();
        this._indicator.icon_name = 'selection-mode-symbolic';

        // Showing the indicator when the feature is enabled
	this._settings = ExtensionUtils.getSettings();

        this._settings.bind('feature-enabled',
            this._indicator, 'visible',
            Gio.SettingsBindFlags.DEFAULT);
        
        // Create the toggle and associate it with the indicator, being sure to
        // destroy it along with the indicator
        this.quickSettingsItems.push(new FeatureToggle(this.fim));
        
        this.connect('destroy', () => {
            this.quickSettingsItems.forEach(item => item.destroy());
        });
        
        // Add the indicator to the panel and the toggle to the menu
        QuickSettingsMenu._indicators.add_child(this);
        QuickSettingsMenu._addItems(this.quickSettingsItems);
    }
    
    // To add your toggle above another item, such as Background Apps, add it
    // using the built-in function, then move them afterwards.
    _addItems(items) {
        QuickSettingsMenu._addItems(items);

        for (const item of items) {
            QuickSettingsMenu.menu._grid.set_child_below_sibling(item,
                QuickSettingsMenu._backgroundApps.quickSettingsItems[0]);
        }
    }
  });

const Extension = GObject.registerClass({
  GTypeName: 'Extension',
  Properties: {},
  Signals: {},
  },
  class Extension extends GObject.Object {
    _init() {
      super._init();
      this._indicator = null;
    }

    enable() {
      this._settings = ExtensionUtils.getSettings();
      this.fim = new FIM(this._settings);

      this._indicator = new FeatureIndicator(this.fim);
    }

    disable() {
      this._indicator.destroy();
      this._indicator = null;

      this._settings = null;

      this.fim.reset();

      //remove everything else
      this.fim.ic.destroy();
      this.fim.mc.destroy();
      this.fim = null;
    }
  });

function init() {
    ExtensionUtils.initTranslations(Me.metadata.uuid);
    return new Extension();
}
