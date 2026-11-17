# flightline-site

The FlightLine website, served by GitHub Pages at <https://getflightline.app>.

Plain HTML and CSS, no build step. Edit the files and push to `main`; Pages redeploys in a minute or two.

| Path | Page |
|---|---|
| `index.html` | Landing page with the beta waitlist form |
| `join.js` | Sends the waitlist form without leaving the page (the form also works without JavaScript) |
| `privacy/index.html` | Privacy policy |
| `support/index.html` | Support contact |
| `404.html` | Not-found page |
| `CNAME` | Custom domain for GitHub Pages |

Barlow Condensed is self-hosted in `fonts/` under the SIL Open Font License (`fonts/OFL.txt`).

The waitlist form posts to the `join-waitlist` Supabase Edge Function (FlightLine repo,
`supabase/functions/join-waitlist`). It must be deployed (with `--no-verify-jwt`) and its
migration pushed before the form works.
