# manage Mastodon boosts

The website is here: https://manage-boosts.jvns.ca

### no server

This is a static site: there's no server, all your data is stored only in your
browser, as soon as you clear your cache it's all gone.

I've tested it with mastodon.social, it may or may not work with other Mastodon instances.

### this code is unmaintained

I made this library just for me to use, it's fulfilled its purpose for me, and
I'm not planning to take feature requests or fix bugs. You can make PRs /
issues if you want but I'll probably ignore them :)

It's MIT licensed so you can use it however you want.

### how to develop it

To develop this locally, run:

```
python3 -m http.server 8081
```

Then open http://localhost:8081 in your browser.

### contains a tiny Mastodon library

This contains a tiny Mastodon library called `mastodon.js` for logging in with
OAuth and making requests. You can see some examples of how to use it in
`mastodon-login-example.html` in this repository, or in `script.js`.

I also probably won't be fixing bugs or taking feature requests for that library.
