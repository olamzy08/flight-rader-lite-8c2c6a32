# Flight Rader Lite

Here's the exact project spec from the image:



---



```

Project 13: Flight Radar Lite [Intermediate]



FUTM-SWE-221 | Page 5



| API    | OpenSky Network API    | https://opensky-network.org    |



Description

Show live flights over Nigeria on a map. Click any plane to see flight number, altitude, and speed.



SDLC Guidance

- Planning: bound map to Nigerian airspace

- Analysis: aviation student persona

- Design: map and sidebar detail panel

- Implementation: poll API and render markers

- Testing: data staleness handling

- Deployment: web app

```



---



Now tell Copilot:



"I'm building Flight Radar Lite from scratch using the exact spec below. Generate the complete code:



Project: Flight Radar Lite [Intermediate]

API: OpenSky Network API → https://opensky-network.org/api/states/all

Description: Show live flights over Nigeria on a map. Click any plane to see flight number, altitude, and speed.



Requirements:



· Map bound to Nigerian airspace (centered on Nigeria ~9.0820°N, 8.6753°E)

· Use OpenStreetMap with Leaflet.js

· Map + sidebar detail panel layout

· Poll API every 10 seconds and render plane markers

· Click plane → show: flight number (callsign), altitude (feet), speed (knots)

· Handle stale data (ignore flights with last_contact > 60 seconds ago)

· Filter flights to Nigeria bounds: lat 4°N to 14°N, lon 2°E to 15°E

· Use plane icon (✈) for markers

· OpenSky supports browser CORS, no proxy needed



Generate:



1. index.html (full page with map and sidebar)

2. style.css (inline in index.html)

3. app.js (inline in index.html, all logic)



Make it clean, functional, and match the spec exactly."

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/111e99b4-2161-44a1-8df1-5e726b29b779).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
