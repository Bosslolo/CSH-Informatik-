# CSH-Informatik-
Git Repo of all IT students

Tim - HTMl
Laurin - Routes
Jana - C

# CSH-Informatik – Auto Data WebApp

To-Do's
Tim
- [ ] Test
Jana
- [ ] Test
Laurin
- [ ] Test

## Product:

* Webapp to read and visualize car data
* Physical connection from laptop to car Bus Interface (e.g. OBD / CAN)
* Local-only application (no cloud, no external servers)
* CLI with command to launch the local webapp
* Configurable polling rate (control how often data is read)
* Focus on predictable behavior instead of random / unstructured coding
* Open Source project maintained by IT students

## Goal:

* Read raw car bus data
* Decode and display relevant auto information
* Store and replay data for debugging and analysis
* Avoid “vibe coding” by defining clear product scenarios and outcomes

## Components

### [Client](/Spec/Client/readme.md)

* Dashboard webapp (browser-based)
* Real-time data visualization
* Service to request permission and connect to serial port
* Displays:

  * Live car data
  * Connection status
  * Read frequency
* Works offline after startup

### Routes

* Dashboard

  * Live data view
  * Status of Bus connection

* View previous recordings

  * Select stored sessions
  * Inspect raw and processed data

* Export data

  * Download data as file (e.g. JSON / CSV)

* Settings

  * Configure read interval
  * Select Bus interface
  * Enable/disable logging

* Replay raw BUS data

  * Works without a connected car
  * Used for testing and debugging

### Backend

* Queue manager for streaming Bus data

  * Ensures stable data flow
  * Prevents data loss at high read rates

* Data store

  * Stores raw Bus data
  * Stores decoded values
  * Used for debugging and replay

* Handles:

  * Serial communication
  * Data validation
  * Rate limiting

### CLI

* CLI command to launch local webapp
* Starts backend and frontend together
* Allows basic configuration via flags
* Example use case:

  * Plug in car
  * Run CLI command
  * Open dashboard in browser

## Product Scenarios

* User connects laptop to car → starts CLI → sees live data
* User records a drive → saves data → exports it
* User replays recorded Bus data without car connected
* User changes read frequency to reduce load

## Predictable Outcomes

* Stable data reading
* Reproducible results
* Clear separation of components
* Easier debugging and testing

## Why Spec Kit fits

* Encourages defining scenarios before coding
* Reduces unstructured “vibe coding”
* Improves code quality and team collaboration
* Makes behavior and outputs predictable

## Repository

* One shared Git repository
* Used by all IT students
* Open Source
* GitHub Stars show interest and project relevance
* License defines how the code can be used and shared