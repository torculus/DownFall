/*
  Let it snow – Gnome Shell Extension
  Copyright (C) 2018 Mateusz Banaszek

  Inspired by gsnow (https://github.com/offlineric/gsnow).

  This program is free software; you can redistribute it and/or
  modify it under the terms of the GNU General Public License
  as published by the Free Software Foundation; either version 2
  of the License, or (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program; if not, write to the Free Software
  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/

const St = imports.gi.St;
const Main = imports.ui.main;
const Meta = imports.gi.Meta;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const Slider = imports.ui.slider;
const Clutter = imports.gi.Clutter;
const Lang = imports.lang;

const MAX_SF = 200;
const SNOWFLAKES = ["🍁️","🍂️","🍁️"];
//const SNOWFLAKES = ["❄", "❅", "❆"];
const SF_STYLE = "text-shadow: 1px 1px rgba(0, 0, 0, 0.4); color: #ffffff; "
const SF_STYLES = ["font-size: 29px; ", "font-size: 26px; ", "font-size: 23px; "];
const END_X_MDIFF = 50;
const TIME = 5;
const TIME_MDIFF = 2;
const ROTATION_MDIFF = 180;



let snowManager, snowIndicator;


const SnowManager = new Lang.Class({
	Name: 'SnowManager',

	_init: function() {
		this._countSf = 0;
		this._maxSf = 0;
		this._sliderValue = 0.3;
	},

	changed: function(slider, newValue) {
		this._sliderValue = newValue;
		this._maxSf = Math.floor(this._sliderValue * MAX_SF) * Main.layoutManager.monitors.length;
		while (this._countSf < this._maxSf) {
			this._countSf++;
			let newSf = new Snowflake();
			Main.uiGroup.add_actor(newSf);
			newSf.fall();
		}
	},

	fallen: function(snowflake) {
		if (this._maxSf < this._countSf) { // too many snowflakes
			this._countSf--;
			Main.uiGroup.remove_actor(snowflake);
			snowflake.destroy();
		}
		else { // fall again
			snowflake.fall();
		}
	},

	enable: function() {
		this.changed(null, this._sliderValue);
	},

	disable: function() {
		this._maxSf = 0;
		/* Snowflakes will be destroyed when they fall down. */
	},

	sliderValue: function() {
		return this._sliderValue;
	},

});

const SnowIndicator = new Lang.Class({
	Name: 'SnowIndicator',
	Extends: PanelMenu.Button,

	_init: function(sliderValue) {
		let label = new St.Label({
			text: "❄"
		});

		this.parent(null, "Let it snow", false);
		this.actor.add_child(label);
		this.container.y_fill = false;

		let menu = new PopupMenu.PopupBaseMenuItem();
		let slider = new Slider.Slider(sliderValue);
		//slider.connect('value-changed', snowManager.changed.bind(snowManager));
		menu.actor.add(slider.actor, { expand: true });
		this.menu.addMenuItem(menu);
	},
});


const Snowflake = new Lang.Class({
	Name: 'Snowflake',
	Extends: St.Label,

	_init: function() {
		let whichFlake = Math.floor((Math.random() * SNOWFLAKES.length));
		this.parent({
			style: SF_STYLE + SF_STYLES[Math.floor(Math.random() * SF_STYLES.length)],
			/* Style here instead of in stylesheet.css? It's (unfortunately) an ugly hack.
			   Problem? `disable()` is invoked when showflakes are in the air:
			   `disable()` can't stop them falling thus they will be destroyed only
			   when they finally fall down, but the stylesheet is unloaded now.
			*/
			text: SNOWFLAKES[whichFlake],
		});
		this.opacity = 255;
		this.connect('transitions-completed', snowManager.fallen.bind(snowManager));
	},

	fall: function() {
		let i = Math.floor(Math.random() * Main.layoutManager.monitors.length);
		let monitor = Main.layoutManager.monitors[i];

		let startX = monitor.x + Math.floor(Math.random() * (monitor.width - this.width));
		let startY = monitor.y - this.height;

		let endX = startX + Math.floor((Math.random() * END_X_MDIFF * 2) - END_X_MDIFF);
		let endY = monitor.y + monitor.height - this.height;
		let focusWindow = global.display.focus_window;
		if ((focusWindow !== null) && (focusWindow.get_window_type() !== Meta.WindowType.DESKTOP)) {
			let rect = focusWindow.get_frame_rect();
			if ((rect.x <= startX) && (startX <= rect.x + rect.width))
				endY = Math.min(endY, rect.y - this.height);
		}

		let time = (TIME + (Math.random() * TIME_MDIFF * 2) - TIME_MDIFF) * 1000;
		let rotation = Math.floor((Math.random() * ROTATION_MDIFF * 2) - ROTATION_MDIFF);

		this.set_position(startX, startY);
		this.save_easing_state();
		this.set_easing_mode(Clutter.AnimationMode.EASE_OUT_QUAD);
		this.set_easing_duration(time);
		this.set_position(endX, endY);
		this.set_rotation_angle(Clutter.RotateAxis.Z_AXIS, rotation);
		this.restore_easing_state();
	},

});


function init() {
	snowManager = new SnowManager();
}

function enable() {
	snowIndicator =  new SnowIndicator(snowManager.sliderValue());
	Main.panel._addToPanelBox('Let it snow', snowIndicator, 0, Main.panel._rightBox);
	snowManager.enable();
}

function disable() {
	snowManager.disable();
	snowIndicator.destroy();
}
