---
title: Alerts privacy
eyebrow: Alerts
summary: What the email alerts keep about you, for how long, who else sees it and how to delete it.
description: What the Ocean Metrics email alerts store, for how long, and how to delete it.
---

The alerts are a small service of their own (a Cloudflare Worker with a key-value store). This page says what it keeps.

## What is stored

- **Your address, encrypted.** It is kept only so that the alert mails can be sent. It is encrypted before it is stored (AES-256-GCM); the key is a secret of the service and is not in any repository. The address is in plain text only in the service's memory while a mail is sent, and in the request to the mail provider.
- **A fingerprint of your address**, a one-way hash. It is how the service recognizes the same address without reading it, and how it avoids mailing an address that unsubscribed, bounced or complained.
- **The rules of each alert**: the places and indicators watched, the kinds of change (status changes, first values), how often, the title shown in the list, where you subscribed from, when it was confirmed and when a mail was last sent. No name, no organization, no IP address.
- **Short-lived counters** for rate limiting, keyed by a hash of the connection, never by the address or the plain IP address, and gone after a few minutes.
- **Usage counts**: one anonymous count per request and per mail (which route, which outcome). Never an address.

## How long

- A request you did not confirm is deleted after 48 hours.
- A confirmed alert is kept until you delete it or unsubscribe.
- When you unsubscribe from all alerts, your alerts are deleted and only the fingerprint of the address stays, so it is not mailed again by mistake. You can subscribe anew after an unsubscribe. When a mail bounces or draws a spam complaint, the alerts end and the address is blocked for good.

## What is not here

- No tracking pixels in the mails, no analytics script on these pages, no cookies. The confirm and manage pages carry their secret in the part of the web address after the <code>#</code>, which browsers never send to a server.
- The address is never sold, shared or used for anything but these alerts. No newsletter, no other mailing.
- The mails are plain, with a text part, and carry no tracking pixel.

## Who handles it

- **Cloudflare** runs the service and stores the encrypted records. Its request logs may show the one-click unsubscribe address, which contains your manage token.
- **Resend** sends the mails from <code>mail.oceanmetrics.io</code>. It sees your address, the mail and whether it was delivered, bounced or marked as spam, under its own privacy policy.
- **Cloudflare Turnstile** checks that a person is subscribing, if the check is switched on.

## Delete it

- Press **Unsubscribe** in your mail program, or the Unsubscribe link at the bottom of any alert mail and then the button on the page that opens.
- Or open the **Manage** link of any alert mail, delete the alerts one by one, or unsubscribe from all.
- If you have no mail left to open a link from, write to <a href="/contact/">Ocean Metrics</a> from the address and ask to be removed.

Back to <a href="/alerts/">Alerts</a>.
