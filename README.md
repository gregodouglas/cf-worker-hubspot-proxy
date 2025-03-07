# Cloudflare Worker Reverse Proxy for HubSpot

This repository contains a Cloudflare Worker script that reverse proxies specific HubSpot asset and API paths on your domain. Requests matching defined paths (e.g., `/hs`, `/_hcms`, `/hubfs`, `/hs-fs`, `/cs/c`, and `/e3t`) will be forwarded to your HubSpot origin using the required headers, while all other requests are handled normally (for example, by a WordPress site).

> **Note:** This repository is set up as a public template with placeholders. Replace the `{hubspotID}` and `{HubSpotPrimaryDomain}` placeholders with your production values in your private fork.

## Features

- **Selective Reverse Proxy:** Proxies only requests that match specific HubSpot asset paths.
- **Header Management:** Forwards essential headers such as `X-HS-Public-Host`, `X-HubSpot-Trust-Forwarded-For`, `X-Real-IP`, and others.
- **Preserves URL Structure:** Retains the original path and query string when constructing the target URL.
- **Flexible Configuration:** Easily add or modify paths to be proxied according to your needs.
- **Manual Redirect Handling:** Configured to use `redirect: "manual"` so that any HTTP redirects from HubSpot can be handled as needed.

## How It Works

1. **Request Matching:**  
   A regular expression checks if the request URL’s pathname starts with one of the defined prefixes. If a match is found, the request is identified as a HubSpot asset/API call.

2. **Target URL Construction:**  
   The worker constructs a new URL by appending the original pathname and query string to a HubSpot origin URL (using your HubSpot ID and the proper CDN domain).

3. **Header Forwarding:**  
   The script clones and updates the request headers to include required proxy headers. This ensures that HubSpot correctly recognizes the public host and client details.

4. **Proxying the Request:**  
   The modified request is sent to HubSpot with `redirect: "manual"`, so any HTTP redirection responses are returned to the worker rather than being automatically followed.

5. **Fallback Behavior:**  
   Requests that do not match the specified patterns are passed through normally (for example, to your WordPress installation).

## Setup & Configuration

1. **Clone This Repository:**

   ```bash
   git clone https://github.com/gregodouglas/cf-worker-hubspot-proxy.git
   cd cf-worker-hubspot-proxy

2. **Configure Placeholder**

3. **Deploying the Worker**
   You can deploy your Cloudflare Worker using the Cloudflare Dashboard or the Wrangler CLI:
   **Using Wrangler CLI:**

   ```bash
   npm install -g wrangler
