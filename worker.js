

addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request))
  })
  
  async function handleRequest(request) {
    const originalUrl = new URL(request.url)
    // Regex matching the required paths for HubSpot assets and API calls
    // Add additional location for other assets here such as landing pages.
    const pattern = /^\/(hs|_hcms|hubfs|hs-fs|cs\/c|e3t)(\/|$)/
  
    // If the path matches one of our defined prefixes, reverse proxy to HubSpot.
    if (pattern.test(originalUrl.pathname)) {
      // Construct the new target URL
      // follow HubSpot guide at https://developers.hubspot.com/docs/guides/cms/content/performance/reverse-proxy-support
      const targetUrl = new URL("https://{hubspotID}.sites-proxy.hscoscdnXX.net" + originalUrl.pathname)
      targetUrl.search = originalUrl.search
  
      // Clone the original headers and update with required proxy headers
      let newHeaders = new Headers(request.headers)
      
      // Use the original host for the Host header
      newHeaders.set("Host", originalUrl.host)
      newHeaders.set("X-HS-Public-Host", "{HubSpotPrimaryDomain}]")
      newHeaders.set("X-HubSpot-Trust-Forwarded-For", "true")
      
      // Cloudflare Workers do not support modifying TLS settings (SNI) like nginx,
      // but using the target URL will handle TLS appropriately.
      
      // Get the client IP from Cloudflare's header; fallback to empty string if not provided
      const clientIP = request.headers.get("CF-Connecting-IP") || ""
      newHeaders.set("X-Real-IP", clientIP)
      
      // Set the X-Forwarded-Proto based on the request's protocol (remove the colon)
      newHeaders.set("X-Forwarded-Proto", originalUrl.protocol.slice(0, -1))
      
      // Append the client IP to any existing X-Forwarded-For header, or set it if not present
      const forwardedFor = request.headers.get("X-Forwarded-For")
      newHeaders.set("X-Forwarded-For", forwardedFor ? `${forwardedFor}, ${clientIP}` : clientIP)
      
      newHeaders.set("X-HubSpot-Client-IP", clientIP)
      newHeaders.set("X-Forwarded-Host", "{HubSpotPrimaryDomain}")
  
      // Create a new request with the modified URL and headers.
      // Note: The request body is forwarded as-is.
      const modifiedRequest = new Request(targetUrl.toString(), {
        method: request.method,
        headers: newHeaders,
        body: request.body,
        redirect: "manual"
      })
  
      return fetch(modifiedRequest)
    } else {
      // For non-matching URLs, continue with the default behavior (e.g., serving WordPress)
      return fetch(request)
    }
  }