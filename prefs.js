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

import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import Gdk from 'gi://Gdk';
import GLib from 'gi://GLib';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import * as Utils from './utils.js';
import * as Config from 'resource:///org/gnome/Shell/Extensions/js/misc/config.js';

export default class DFPreferences extends ExtensionPreferences {
 fillPreferencesWindow(window) {
    window.search_enabled = true;
    let builder = Gtk.Builder.new();
    builder.add_from_file(this.path + '/prefs.ui');
    let page1 = builder.get_object('appearance-page');
    let page2 = builder.get_object('behavior-page');
    let page3 = builder.get_object('sfx-page');
    let page4 = builder.get_object('about-page');
    window.add(page1);
    window.add(page2);
    window.add(page3);
    window.add(page4);

    let settings = this.getSettings();

    //bind settings from prefs.xml to schema keys
    settings.bind('presets', builder.get_object('presets'), 'active', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('textfont', builder.get_object('text_font'), 'font', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('fallmon', builder.get_object('fall_monitor'), 'active', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('falldirec', builder.get_object('fall_direc'), 'active', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('fall3d', builder.get_object('fall_3d'), 'active', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('clutteranimmode', builder.get_object('clutter_animmode'), 'active', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('maxitems', builder.get_object('max_items'), 'value', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('falltime', builder.get_object('fall_time'), 'value', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('fallrot', builder.get_object('fall_rot'), 'value', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('falldrift', builder.get_object('fall_drift'), 'value', Gio.SettingsBindFlags.DEFAULT);

    settings.bind('matrixtrails', builder.get_object('matrix_switch'), 'active', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('matfont', builder.get_object('mat_font'), 'font', Gio.SettingsBindFlags.DEFAULT);

    settings.bind('fireworks', builder.get_object('firework_switch'), 'active', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('flrfont', builder.get_object('flr_font'), 'font', Gio.SettingsBindFlags.DEFAULT);

    //set up text entries
    widget_schema('falltext', 'display_field', settings, builder);
    widget_schema('matdisplay', 'mat_display', settings, builder);
    widget_schema('flrdisplay', 'flr_display', settings, builder);

    //set up color entries
    widget_color('textcolor', 'text_color', settings, builder);
    widget_color('matcolor', 'mat_color', settings, builder);
    widget_color('flrcolor', 'flr_color', settings, builder);

    //bind presets to specific values
    builder.get_object('presets').connect('changed', (presets) => {
    	let preset = presets.get_active_text();
  	set_presets(preset, builder);
    });

    //bind random button to random values
    builder.get_object('random_button').connect('clicked', () => {
    	let rgba = new Gdk.RGBA();
  	
  	builder.get_object('presets').set_active(0);
  	builder.get_object('display_field').set_text( String.fromCharCode(Math.floor(Math.random() * (65536))) );
  	let color = "\#" + Math.floor(Math.random()*16777215).toString(16);
  	rgba.parse( color );
  	builder.get_object('text_color').set_rgba(rgba);
  	builder.get_object('fall_direc').set_active(GLib.random_int_range(0,8));
  	builder.get_object('max_items').set_value(GLib.random_int_range(1,40));
  	builder.get_object('fall_time').set_value(GLib.random_int_range(2,20));
  	builder.get_object('fall_rot').set_value(GLib.random_int_range(0,360));
  	builder.get_object('fall_drift').set_value(GLib.random_int_range(0,100));
  	builder.get_object('matrix_switch').set_active( (Math.random() >= 0.5) );
  	builder.get_object('firework_switch').set_active( (Math.random() >= 0.5) );
    });
 }
}

function widget_schema(schemakey, widget, settings, buildable) {
  //set widget from schemakey
  let disptext = settings.get_strv(schemakey).toString();
  buildable.get_object(widget).set_text(disptext);
  
  //bind schemakey to widget changes
  buildable.get_object(widget).connect('notify::text', (entry) => {
  	let typed = entry.get_text().split(',');
  	settings.set_strv(schemakey, typed);
  });
}

function widget_color(schemakey, widget, settings, buildable) {
  //set color button from settings
  let rgba = new Gdk.RGBA();
  rgba.parse(settings.get_string(schemakey));
  buildable.get_object(widget).set_rgba(rgba);
  
  //bind text color to key
  buildable.get_object(widget).connect('notify::rgba', (button) => {
            let rgba_1 = button.get_rgba();
            settings.set_string(schemakey, rgba_1.to_string());
        });
}

function set_presets(preset, buildable) {
  let rgba = new Gdk.RGBA();
  let rgba2 = new Gdk.RGBA();
  let rgba3 = new Gdk.RGBA();
  switch (preset) {
    case "Snow":
      buildable.get_object('display_field').set_text("*,.");
      rgba.parse("White");
      buildable.get_object('text_color').set_rgba(rgba);
      buildable.get_object('fall_direc').set_active(7);
      buildable.get_object('max_items').set_value(40);
      buildable.get_object('fall_time').set_value(7);
      buildable.get_object('fall_rot').set_value(45);
      buildable.get_object('fall_drift').set_value(75);
      buildable.get_object('matrix_switch').set_active(false);
      buildable.get_object('firework_switch').set_active(false);
      break;
    case "Leaves":
      buildable.get_object('display_field').set_text("🍁️,🍂️");
      buildable.get_object('fall_direc').set_active(6);
      buildable.get_object('max_items').set_value(40);
      buildable.get_object('fall_time').set_value(10);
      buildable.get_object('fall_rot').set_value(60);
      buildable.get_object('fall_drift').set_value(60);
      buildable.get_object('matrix_switch').set_active(false);
      buildable.get_object('firework_switch').set_active(false);
      break;
    case "Matrix© rain":
      rgba.parse("White");
      rgba2.parse("SpringGreen3");
      buildable.get_object('display_field').set_text("ﾊ,ﾐ,ﾋ,ｰ,ｳ,ｼ,ﾅ,ﾓ,ﾆ,ｻ,ﾜ,ﾂ,ｵ,ﾘ,ｱ,ﾎ,ﾃ,ﾏ,ｹ,ﾒ,ｴ,ｶ,ｷ,ﾑ,ﾕ,ﾗ,ｾ,ﾈ,ｽ,ﾀ,ﾇ,ﾍ");
      buildable.get_object('text_color').set_rgba(rgba);
      buildable.get_object('fall_direc').set_active(0);
      buildable.get_object('clutter_animmode').set_active(0); //LINEAR
      buildable.get_object('max_items').set_value(7);
      buildable.get_object('fall_time').set_value(7);
      buildable.get_object('fall_rot').set_value(0);
      buildable.get_object('fall_drift').set_value(0);
      buildable.get_object('matrix_switch').set_active(true);
      buildable.get_object('mat_display').set_text("ﾊ,ﾐ,ﾋ,ｰ,ｳ,ｼ,ﾅ,ﾓ,ﾆ,ｻ,ﾜ,ﾂ,ｵ,ﾘ,ｱ,ﾎ,ﾃ,ﾏ,ｹ,ﾒ,ｴ,ｶ,ｷ,ﾑ,ﾕ,ﾗ,ｾ,ﾈ,ｽ,ﾀ,ﾇ,ﾍ");
      buildable.get_object('mat_color').set_rgba(rgba2);
      buildable.get_object('firework_switch').set_active(false);
      break;
    case "Fireworks":
      rgba.parse("Orange");
      rgba2.parse("Gray");
      rgba3.parse("Yellow");
      buildable.get_object('display_field').set_text("🔸️");
      buildable.get_object('text_color').set_rgba(rgba);
      buildable.get_object('fall_direc').set_active(1);
      buildable.get_object('clutter_animmode').set_active(2); //EASE_OUT_QUAD
      buildable.get_object('max_items').set_value(2);
      buildable.get_object('fall_time').set_value(3);
      buildable.get_object('fall_rot').set_value(0);
      buildable.get_object('fall_drift').set_value(30);
      buildable.get_object('matrix_switch').set_active(true);
      buildable.get_object('mat_display').set_text(".");
      buildable.get_object('mat_color').set_rgba(rgba2);
      buildable.get_object('firework_switch').set_active(true);
      buildable.get_object('flr_display').set_text("★");
      buildable.get_object('flr_color').set_rgba(rgba3);
      break;
    case "Rain":
      buildable.get_object('display_field').set_text(".,💧");
      rgba.parse("Cyan");
      buildable.get_object('text_color').set_rgba(rgba);
      buildable.get_object('fall_direc').set_active(0);
      buildable.get_object('max_items').set_value(20);
      buildable.get_object('fall_time').set_value(3);
      buildable.get_object('fall_rot').set_value(0);
      buildable.get_object('fall_drift').set_value(5);
      buildable.get_object('matrix_switch').set_active(false);
      buildable.get_object('firework_switch').set_active(false);
      break;
    case "Fireflies":
      buildable.get_object('display_field').set_text("●");
      rgba.parse("GreenYellow");
      buildable.get_object('text_color').set_rgba(rgba);
      buildable.get_object('fall_direc').set_active(8);
      buildable.get_object('max_items').set_value(20);
      buildable.get_object('fall_time').set_value(7);
      buildable.get_object('fall_rot').set_value(0);
      buildable.get_object('fall_drift').set_value(85);
      buildable.get_object('matrix_switch').set_active(false);
      buildable.get_object('firework_switch').set_active(false);
      break;
    default: //"Confetti"
      //
  }
}
