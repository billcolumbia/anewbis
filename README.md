# anewbis

Experimenting with a little bit of JavaScript or CSS? Joining the #nobuild team? Anewbis will watch files for any changes and inject CSS or reload the page for all other files.

This is a refactor of [billcolumbia/anubis](https://github.com/billcolumbia/anubis). It uses [Bun](https://bun.sh/) instead of node. The only dependency is Bun. This is mostly a toy.

To install:
```bash
bun install https://github.com/billcolumbia/anewbis
```

Add a script to your `package.json`. Anewbis takes a files param. This can be a single file or a glob. 

```json
{
  "scripts": {
    "livereload": "anewbis --files='./src/**/*.{css,js,html,php}'"
  }
}
```

Add the websocket client to your HTML. You will want some kind of logic to make sure this is only loaded in a dev environment. Also there is no https support at the moment. Mismatching protocols could make this break.

```html
<html>
  <!-- ... -->
  <body>
    <!-- ... -->
    <script src="http://localhost:3000/live-reload.js"></script>
  </body>
<html>
```