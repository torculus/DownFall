# Change Log

## 4.3.1
- Replace `GtkColorButton` with `GtkColorDialogButton`
- Add GNOME 48 support

## 4.3.0
- Move `Utils.startEndPoints()` inside `FallItem`
- Remove `utils.js`

## 4.2.0
- Attempt fix for "`this.pane3d` is null"
- Update README with instructions for enabling the extension
- Update README video

## 4.2.0
- Prefs window and widgets migrated completely to `libadwaita`
- ***New feature:*** text shadows
- Use `GLib.rand_int_range()` in direction instead of custom implementation
- Adjusted all presets to make them more realistic

## 4.1.2
- Bugfix: #10 not working on all monitors

## 4.1.1
- ***New feature***: Allow falling on all monitors (fixed #10)
- Changed default "Down" to move FallItems off screen (#10)
- Reworked enable/disable logic (#9)
- Implement new presets (#11)
    - Rain
    - Fireflies

## 4.1.0
- Port to GNOME 45 ESM
- Fix FallItems not showing on background layout (needed `export { startEndPoints }` in `Utils.js`)

## 4.0.2
- Moved `stopTimers()` to FallItems instead of FIM
- Replaced `ic.destroy_all_children()` to `remove_all_children()`, fixing long-standing error with logs getting flooded with errors

## 4.0.1
- Adjusted Firework preset and flare logic to be more realistic (fade out, random angles)

## 4.0.0
- Separated `fi.change()` and `fi.matrixtrail()` from `fi.fall()` for performance
- Use Pango and GLib instead of custom functions
- Removed all global variables (code safety)
- ***New feature***: changing text and style dynamically ("on the fly")
- ***New feature***: Port settings dialog to `libadwaita`
- ***New feature***: QuickSettings menu item (requires GNOME 44+)

## 3.3.2
- Added GNOME 43 to metadata

## 3.3.1
- Adjusted Firework preset and `Clutter.AnimationMode` to be more realistic

## 3.3.0
- Moved Matrix© trails and Firework Explosion Endings to "Special Effects" tab
- Renamed "Firework Explosion Endings" to "Firework Flares"
- **New setting**: Added text, color, and font styling options to Special Effects

## 3.2.0
- **New setting**: "Unpredictable (??)" fall direction
- **New setting**: Introduce presets (Snow, Leaves, Matrix© rain, Random)

## 3.1.0
- **New setting**: `fall_3d` for falling in front of or behind windows
- Fix issue where DownFall prevents dragging windows left in GNOME overview
- Increased limits on max FallItems, time, and rotation

## 3.0.3
- Fixed adding a new `GLib.timeout_add()` on each call of `fallitem.fall()`

## 3.0.2
- Fixed division by 0 in Matrix© trails on 'Up' or 'Left'

## 3.0.1 (bugfixes)
- Moved a global scope variable to `enable()`
- Migrated `Utils.getSettings()` to standard `ExtensionUtils.getSettings()`
- FallItem timeout sources are now removed in `disable()`

## 3.0.0
- Switch to [Semantic Versioning](https://semver.org/)
- Complete re-write of the structure
- Replaced `destroy()` with `hide()` on each fall
- Made FallItems children of FIM for quick removal
- Replaced es6 Promises with `GLib.idle_add()`
- Re-worked Matrix© trails
- Addressed issue where GNOME shell froze

## 2.2
- Initial gtk4 support for GNOME 40

## 2.1
- Bugfix release
- Implemented gjs delays to reduce CPU load
- Improved Matrix© trails

## 2.0
- Multi-item support
- Renamed 'chars' to 'items'
- Better handling of font properties (bold, italic, etc.)
- Implemented firework explosions
- First implementation of Matrix© trails
- Improved 'About' tab

## 1.1
- Custom text, color, font, and size
- Custom directions (down, up, right, left, up-right, up-left, down-right, down-left)
- Custom time, rotation, and drift
- Multi-monitor support
