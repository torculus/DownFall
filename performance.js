/**
 * PERFORMANCE MEASUREMENT Library for GNOME Shell Extensions
 * 
 * LICENSE:
 * 
 * Copyright 2020 Just Perfection
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
 * IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * HOW TO USE:
 *
 * Import this file to your GNOME Shell Extension project (For example,
 * import it as Performance). Then use this in start and end of the block you
 * want to measure:
 *
 * Performance.start('Test1');
 * // code to measure
 * Performance.end();
 *
 * You can also use it in nested blocks:
 *
 * Performance.start('Test1');
 * // code lines to measure for Test1
 *   Performance.start('Test2');
 *   // code lines to measure for Test2
 *   Performance.end(); 
 * // code lines to measure for Test1
 * Performance.end();
 *
 * Now if you go to the gnome-shell log, you can see the performance result.
 *
 * To view GNOME Shell log:
 * journalctl -f -o cat /usr/bin/gnome-shell
 *
 * DEPENDENCY:
 *
 * libgtop2
 *
 * Ubuntu: sudo apt install libgtop2-dev
 * Fedora: sudo dnf install libgtop2-devel
 * 
 * @author     Just Perfection <justperfection.channel@gmail.com>
 * @copyright  2020
 * @license    MIT License
 * @link       https://gitlab.com/justperfection.channel/gs-performance
 */

const {GLib, GTop} = imports.gi;
const Me = imports.misc.extensionUtils.getCurrentExtension();

/**
 * timing for each block
 * 
 * @var object
 *   property name is string of id,
 *   value is int of time in microseconds
 */
let timing = {};

/**
 * block ids in queue
 * 
 * @var array
 *   value is string of id
 */
let ids = [];

/**
 * memory reference
 * 
 * @var object
 */
let mem = new GTop.glibtop_mem();

/**
 * memory usage in bytes
 * the order should be the same as ids and it will indicate to the id name
 * 
 * @var array
 *   value is int of bytes
 */
let memUsageOnStart = [];

/**
 * starts the block measurement
 *
 * @param string id unique name for the block
 * 
 * @return void
 */
function start (id) {
  if (id in timing) {
    throw new Error("the block id has been already started");
  } else if (typeof id !== 'string') {
    throw new Error("id should be string");
  } else if (id.length < 1) {
    throw new Error("pick a proper name for id");
  } else {
    timing[id] = GLib.get_real_time();
    ids.push(id);
    memUsageOnStart.push(currentUsedMemory());
  }
}

/**
 * ends the block measurement
 *
 * @param string id unique name for the block
 * 
 * @return void
 */
function end () {
  if (ids.length < 1) {
    throw new Error("Nothing has been queued!");
  } else {
    let id = ids.pop();
    let microsec = GLib.get_real_time() - timing[id];
    let millisec = microsec / 1000;
    let memoryBytes = currentUsedMemory() - memUsageOnStart.pop();
    delete timing[id];
    log('------------------------------------------');
    log('PERFORMANCE MEASUREMENT');
    log('------------------------------------------');
    log('Extension Name: ' + Me.metadata.name);
    log('Block ID: ' + id);
    log('Microseconds: ' + microsec);
    log('Milliseconds: ' + millisec);
    log('Memory Usage: ' + friendlyBytes(memoryBytes));
  }
}

/**
 * get the memory that is currently used
 *
 * @return int bytes
 */
function currentUsedMemory () {
  GTop.glibtop_get_mem(mem);
  return mem.used;
}

/**
 * convert bytes to KB, MB, ...
 *
 * @param int bytes
 *
 * @return string
 */
function friendlyBytes (bytes) {
  if (bytes === 0) return '0 Bytes';
  let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  let kilo = 1000;
  let step = Math.floor(Math.log(bytes) / Math.log(kilo));
  let number = parseFloat((bytes / Math.pow(kilo, step)).toFixed(2));
  return number + ' ' + sizes[step];
}

