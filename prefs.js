/* DownFall – Gnome Shell Extension
 * Copyright (C) 2019-2022 Benjamin S Osenbach
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

const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk;
const GLib = imports.gi.GLib;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;
const Config = imports.misc.config;
const ExtensionUtils = imports.misc.extensionUtils;

function buildPrefsWidget() {
  
  let settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.downfall');
  
  let buildable = new Gtk.Builder();
  
  if ( Config.PACKAGE_VERSION.startsWith("4") ) { //running GNOME 40 or higher
    buildable.add_from_file(Me.dir.get_path() + '/prefs.xml');
  } else {
    buildable.add_from_file(Me.dir.get_path() + '/prefs_legacy.xml');
  }
  
  let prefsWidget = buildable.get_object('prefs_widget');
  
  //bind settings from prefs.xml to schema keys
  settings.bind('presets', buildable.get_object('presets'), 'active', Gio.SettingsBindFlags.DEFAULT);
  settings.bind('textfont', buildable.get_object('text_font'), 'font', Gio.SettingsBindFlags.DEFAULT);
  settings.bind('fallmon', buildable.get_object('fall_monitor'), 'active', Gio.SettingsBindFlags.DEFAULT);
  settings.bind('falldirec', buildable.get_object('fall_direc'), 'active', Gio.SettingsBindFlags.DEFAULT);
  settings.bind('fall3d', buildable.get_object('fall_3d'), 'active', Gio.SettingsBindFlags.DEFAULT);
  settings.bind('maxitems', buildable.get_object('max_items'), 'value', Gio.SettingsBindFlags.DEFAULT);
  settings.bind('falltime', buildable.get_object('fall_time'), 'value', Gio.SettingsBindFlags.DEFAULT);
  settings.bind('fallrot', buildable.get_object('fall_rot'), 'value', Gio.SettingsBindFlags.DEFAULT);
  settings.bind('falldrift', buildable.get_object('fall_drift'), 'value', Gio.SettingsBindFlags.DEFAULT);
  
  settings.bind('matrixtrails', buildable.get_object('matrix_switch'), 'active', Gio.SettingsBindFlags.DEFAULT);
  settings.bind('matfont', buildable.get_object('mat_font'), 'font', Gio.SettingsBindFlags.DEFAULT);
  
  settings.bind('fireworks', buildable.get_object('firework_switch'), 'active', Gio.SettingsBindFlags.DEFAULT);
  settings.bind('flrfont', buildable.get_object('flr_font'), 'font', Gio.SettingsBindFlags.DEFAULT);
  
  //set up text entries
  widget_schema('falltext', 'display_field', settings, buildable);
  widget_schema('matdisplay', 'mat_display', settings, buildable);
  widget_schema('flrdisplay', 'flr_display', settings, buildable);
  
  //set up color entries
  widget_color('textcolor', 'text_color', settings, buildable);
  widget_color('matcolor', 'mat_color', settings, buildable);
  widget_color('flrcolor', 'flr_color', settings, buildable);
  
  //bind presets to specific values
  buildable.get_object('presets').connect('changed', (presets) => {
  	let preset = presets.get_active_text();
  	set_presets(preset, buildable);
  });
  
  //bind random button to random values
  buildable.get_object('random_button').connect('clicked', () => {
  	let rgba = new Gdk.RGBA();
  	
  	buildable.get_object('presets').set_active(0);
  	buildable.get_object('display_field').set_text( String.fromCharCode(Math.floor(Math.random() * (65536))) );
  	let color = "\#" + Math.floor(Math.random()*16777215).toString(16);
  	rgba.parse( color );
  	buildable.get_object('text_color').set_rgba(rgba);
  	buildable.get_object('fall_direc').set_active(GLib.random_int_range(0,8));
  	buildable.get_object('max_items').set_value(GLib.random_int_range(1,40));
  	buildable.get_object('fall_time').set_value(GLib.random_int_range(2,20));
  	buildable.get_object('fall_rot').set_value(GLib.random_int_range(0,360));
  	buildable.get_object('fall_drift').set_value(GLib.random_int_range(0,100));
  	buildable.get_object('matrix_switch').set_active( (Math.random() >= 0.5) );
  	buildable.get_object('firework_switch').set_active( (Math.random() >= 0.5) );
  });
  
  if ( Config.PACKAGE_VERSION.startsWith("3.") ) { //running GNOME 3.36/3.38
    prefsWidget.show_all();
  }
  return prefsWidget;
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
            let rgba1 = button.get_rgba();
            let hexString = Utils.cssHexString(rgba1.to_string());
            settings.set_string(schemakey, hexString);
        });
}

function set_presets(preset, buildable) {
  if (preset == "Snow") {
      let rgba = new Gdk.RGBA();
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
  } else if (preset == "Leaves") {
      buildable.get_object('display_field').set_text("🍁️,🍂️");
      buildable.get_object('fall_direc').set_active(6);
      buildable.get_object('max_items').set_value(40);
      buildable.get_object('fall_time').set_value(10);
      buildable.get_object('fall_rot').set_value(60);
      buildable.get_object('fall_drift').set_value(60);
      buildable.get_object('matrix_switch').set_active(false);
      buildable.get_object('firework_switch').set_active(false);
  } else if (preset == "Matrix© rain") {
      let rgba1 = new Gdk.RGBA();
      let rgba2 = new Gdk.RGBA();
      rgba1.parse("White");
      rgba2.parse("SpringGreen3");
      buildable.get_object('display_field').set_text("ﾊ,ﾐ,ﾋ,ｰ,ｳ,ｼ,ﾅ,ﾓ,ﾆ,ｻ,ﾜ,ﾂ,ｵ,ﾘ,ｱ,ﾎ,ﾃ,ﾏ,ｹ,ﾒ,ｴ,ｶ,ｷ,ﾑ,ﾕ,ﾗ,ｾ,ﾈ,ｽ,ﾀ,ﾇ,ﾍ");
      buildable.get_object('text_color').set_rgba(rgba1);
      buildable.get_object('fall_direc').set_active(0);
      buildable.get_object('max_items').set_value(7);
      buildable.get_object('fall_time').set_value(7);
      buildable.get_object('fall_rot').set_value(0);
      buildable.get_object('fall_drift').set_value(0);
      buildable.get_object('matrix_switch').set_active(true);
      buildable.get_object('mat_display').set_text("ﾊ,ﾐ,ﾋ,ｰ,ｳ,ｼ,ﾅ,ﾓ,ﾆ,ｻ,ﾜ,ﾂ,ｵ,ﾘ,ｱ,ﾎ,ﾃ,ﾏ,ｹ,ﾒ,ｴ,ｶ,ｷ,ﾑ,ﾕ,ﾗ,ｾ,ﾈ,ｽ,ﾀ,ﾇ,ﾍ");
      buildable.get_object('mat_color').set_rgba(rgba2);
      buildable.get_object('firework_switch').set_active(false);
  } else if (preset == "Fireworks") {
      let rgba1 = new Gdk.RGBA();
      let rgba2 = new Gdk.RGBA();
      let rgba3 = new Gdk.RGBA();
      rgba1.parse("Orange");
      rgba2.parse("Gray");
      rgba3.parse("Yellow");
      buildable.get_object('display_field').set_text("🔸️");
      buildable.get_object('text_color').set_rgba(rgba1);
      buildable.get_object('fall_direc').set_active(1);
      buildable.get_object('max_items').set_value(5);
      buildable.get_object('fall_time').set_value(2);
      buildable.get_object('fall_rot').set_value(0);
      buildable.get_object('fall_drift').set_value(30);
      buildable.get_object('matrix_switch').set_active(true);
      buildable.get_object('mat_display').set_text(".");
      buildable.get_object('mat_color').set_rgba(rgba2);
      buildable.get_object('firework_switch').set_active(true);
      buildable.get_object('flr_display').set_text("★");
      buildable.get_object('flr_color').set_rgba(rgba3);
  }
}

function init() {
}


