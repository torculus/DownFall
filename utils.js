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

import GLib from 'gi://GLib';

function startEndPoints(direction, monitor, avgdrift, fallItem) {
    let startX;
    let startY;
    let endX;
    let endY;
    
    if (direction < 4) {
    	var rand1 = GLib.random_int_range(0,100)/100;
    	var rand2 = GLib.random_int_range(-100,100)/100;
    } else {
    	var rand1 = GLib.random_int_range(-50,50)/100;
    	var rand2 = GLib.random_int_range(-50,50)/100;
    	var rand3 = GLib.random_int_range(-50,50)/100;
    	var rand4 = GLib.random_int_range(-50,50)/100;
    }
    
    switch (direction) {
      case 0: //Down
        startX = monitor.x + Math.floor(rand1 * (monitor.width - fallItem.width));
        startY = monitor.y - fallItem.height;
        endX = startX + Math.floor( rand2 * avgdrift * monitor.width);
        endY = monitor.y + monitor.height;// - fallItem.height;
	break;
      case 1: //Up
        startX = monitor.x + Math.floor(rand1 * (monitor.width - fallItem.width));
        startY = monitor.y + monitor.height - fallItem.height;
        endX = startX + Math.floor( rand2 * avgdrift * monitor.width);
        endY = monitor.y - fallItem.height;
	break;
      case 2: //Right
        startX = monitor.x - fallItem.width;
        startY = monitor.y + Math.floor(rand1 * (monitor.height - fallItem.height));
        endX = monitor.x + monitor.width - fallItem.width;
        endY = startY + Math.floor( rand2 * avgdrift * monitor.height);
	break;
      case 3: //Left
        startX = monitor.x + monitor.width - fallItem.width;
        startY = monitor.y + Math.floor(rand1 * (monitor.height - fallItem.height));
        endX = monitor.x - fallItem.width;
        endY = startY + Math.floor( rand2 * avgdrift * monitor.height);
	break;
      case 4: //Up-Right
        startX = monitor.x + Math.floor( rand1 * avgdrift * monitor.width);
        startY = monitor.y + monitor.height + Math.floor( rand2 * avgdrift * monitor.height);
        endX = monitor.x + monitor.width - fallItem.width + Math.floor( rand3 * avgdrift * monitor.width);
        endY = monitor.y - fallItem.height + Math.floor( rand4 * avgdrift * monitor.height);
	break;
      case 5: //Up-Left
        startX = monitor.x + monitor.width - fallItem.width + Math.floor( rand1 * avgdrift * monitor.width);
        startY = monitor.y + monitor.height - fallItem.height + Math.floor( rand2 * avgdrift * monitor.height);
        endX = monitor.x + Math.floor( rand3 * avgdrift * monitor.width);
        endY = monitor.y - fallItem.height + Math.floor( rand4 * avgdrift * monitor.height);
	break;
      case 6: //Down-Right
        startX = monitor.x + Math.floor( rand1 * avgdrift * monitor.width);
        startY = monitor.y - fallItem.height + Math.floor( rand2 * avgdrift * monitor.height);
        endX = monitor.x + monitor.width - fallItem.width + Math.floor( rand3 * avgdrift * monitor.width);
        endY = monitor.y + monitor.height - fallItem.height + Math.floor( rand4 * avgdrift * monitor.height);
	break;
      case 7: //Down-Left
        startX = monitor.x + monitor.width - fallItem.width + Math.floor( rand1 * avgdrift * monitor.width);
        startY = monitor.y - fallItem.height + Math.floor( rand2 * avgdrift * monitor.height);
        endX = monitor.x + Math.floor( rand3 * avgdrift * monitor.width);
        endY = monitor.y + monitor.height - fallItem.height + Math.floor( rand4 * avgdrift * monitor.height);
	break;
      default:  //Unpredictable
    	startX = monitor.width/2 + Math.floor(rand1 * (monitor.width - fallItem.width));
    	startY = monitor.height/2 + Math.floor(rand2 * (monitor.height - fallItem.height));
    	endX = startX + Math.floor( rand3 * avgdrift * monitor.width);
    	endY = startY + Math.floor(rand4 * avgdrift * (monitor.height - fallItem.height));
    }
    
    
    return [startX, startY, endX, endY];
}

export { startEndPoints };
