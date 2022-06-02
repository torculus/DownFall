# Change Log

## 3.3.0
* Moved Matrix© trails and Firework Explosion Endings to "Special Effects" tab
* Renamed "Firework Explosion Endings" to "Firework Flares"
* **New setting**: Added text, color, and font styling options to Special Effects

## 3.2.0

* **New setting**: "Unpredictable (??)" fall direction
* **New setting**: Introduce presets (Snow, Leaves, Matrix© rain, Random)

## 3.1.0

* **New setting**: `fall_3d` for falling in front of or behind windows
* Fix issue where DownFall prevents dragging windows left in GNOME overview
* Increased limits on max FallItems, time, and rotation

## 3.0.3

* Fixed adding a new `GLib.timeout_add()` on each call of `fallitem.fall()`

## 3.0.2

* Fixed division by 0 in Matrix© trails on 'Up' or 'Left'

## 3.0.1 (bugfixes)

* Moved a global scope variable to `enable()`
* Migrated `Utils.getSettings()` to standard `ExtensionUtils.getSettings()`
* FallItem timeout sources are now removed in `disable()`

## 3.0.0

* Switch to [Semantic Versioning](https://semver.org/)
* Complete re-write of the structure
* Replaced `destroy()` with `hide()` on each fall
* Made FallItems children of FIM for quick removal
* Replaced es6 Promises with `GLib.idle_add()`
* Re-worked Matrix© trails
* Addressed issue where GNOME shell froze

## 2.2

* Initial gtk4 support for GNOME 40

## 2.1

* Bugfix release
* Implemented gjs delays to reduce CPU load
* Improved Matrix© trails

## 2.0

* Multi-item support
* Renamed 'chars' to 'items'
* Better handling of font properties (bold, italic, etc.)
* Implemented firework explosions
* First implementation of Matrix© trails
* Improved 'About' tab

## 1.1

* Custom text, color, font, and size
* Custom directions (down, up, right, left, up-right, up-left, down-right, down-left)
* Custom time, rotation, and drift
* Multi-monitor support
