# Terpiez AR Game

## Overview

Terpiez is an augmented reality (AR) game where players search for and capture virtual creatures called Terpiez hidden around campus. The game features statistics tracking, a map to locate Terpiez, a list of captured creatures, and detailed views of each Terpiez.

## Application Features

### Initial Application Structure

1. **Title Bar and Three Tabs:**
   - A title bar at the top of the application.
   - Three main tabs: Statistics, Finder, and List.

2. **Statistics Tab:**
   - Displays the number of Terpiez captured by the user.
   - Shows the number of days the user has been playing the game.
   - These values are initially hard-coded.

3. **Finder Tab:**
   - Displays a map with the user's location and the distance to the nearest Terpiez.
   - Uses a fixed image to represent the map.
   - The distance to the closest Terpiez is initially hard-coded.

4. **List Tab:**
   - Displays the types of Terpiez the player has caught.
   - This list is initially hard-coded with built-in icons representing the Terpiez.
   - Clicking on an icon takes the user to a detailed view.

5. **Details View:**
   - Shows a larger image of the Terpiez along with its name.
   - Initially, only the name of the Terpiez is displayed.

### Persistent Storage and Data Management

1. **User ID and Activity Tracking:**
   - User ID and days active are stored in Shared Preferences.
   - Connects to a Redis database to store and retrieve data.
   - Prompts for Redis credentials on first startup and prevents further action until entered.
   - Credentials are stored securely using `flutter_secure_storage`.

2. **Redis Database Interaction:**
   - Stores data as JSON on the Redis database.
   - Tracks Terpiez found by the user using the app's UUID.
   - Fetches location data, Terpiez details, and images from the database.

3. **Map and Data Display:**
   - Main map shows the closest un-caught Terpiez location and the user's current location.
   - Removes caught Terpiez from the list of locations.
   - Downloads and stores Terpiez images and species data locally.

4. **List and Detail Views:**
   - List of Terpiez shows thumbnails and names.
   - Detail view includes the name, full-sized image, stats, description, and a map of capture locations.

### In-App Notifications and Sensor Input

1. **Catching Terpiez:**
   - Displays a dialog with the Terpiez image and name upon capture.
   - Monitors connection to the Redis database and shows notifications for connection status changes.

2. **Sensor Input:**
   - Replaces the "Catch" button with a shake detection using accelerometers.
   - Provides visual cues when a Terpiez is in range.

3. **App Icon:**
   - Replaces the default Flutter icon with a custom icon for both Android and iOS.

### Sounds and Notifications

1. **Sound Indicators:**
   - Plays a sound when a Terpiez is caught.
   - Plays a notification sound when within 20m of a Terpiez.

2. **Background Service:**
   - Creates a background service for notifications.
   - Communicates between the app and the background service.
   - Tapping a notification opens the finder tab.

3. **User Preferences:**
   - Adds a Drawer with user preferences.
   - Allows users to enable/disable sounds and clear data.
   - Persists user preferences for sound settings.

## Demo Videos

- [Phase 4 Demo](movie/phase4.mov)
- [Phase 5 Demo](movie/phase5.mov)
- [Phase 6 Demo](movie/phase6.mov)

## Credits

All Terpiez images by Noah McMullen.
