# gather-map-printer


Prints interactive project map to png file automatically displays and centers on project spatial documents


#Quick use

print the map 512x256px, with devtools open and don't close chromium when finished (debug)

```bash
npm install
node index.js '{"url":"https://the.url/project-id/access-token", "devtools":true, "w":512, "h":256, "out":"_map.png", "exit":false}'

```