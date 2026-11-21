/* ════════════════════════════════════════════════════════════════
   EDGE-OLFACTION SHOWCASE — ASSETS CACHESTORAGE & PROGRESS STREAM
   0 ms Instant Repeat Visits · Telemetry Loading Feedback
   ════════════════════════════════════════════════════════════════ */

const CACHE_NAME = "edge-olfaction-3d-cache-v5";

export async function fetchWithCache(url, onProgress) {
  const hasCache = typeof window !== "undefined" && "caches" in window;

  if (hasCache) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(url);
      if (cachedResponse) {
        if (typeof onProgress === "function") {
          onProgress({ percent: 100, cached: true, loaded: 1, total: 1 });
        }
        return await cachedResponse.blob();
      }
    } catch (e) {
      console.warn("[CacheStorage] Cache lookup failed, falling back to network", e);
    }
  }

  // Live fetch with streaming progress
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load asset ${url}: ${response.status} ${response.statusText}`);
  }

  const contentLength = response.headers.get("Content-Length");
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  if (!response.body || !total) {
    const blob = await response.blob();
    if (hasCache) {
      try {
        const cache = await caches.open(CACHE_NAME);
        cache.put(url, new Response(blob.slice()));
      } catch (e) {}
    }
    if (typeof onProgress === "function") {
      onProgress({ percent: 100, cached: false, loaded: total, total });
    }
    return blob;
  }

  const reader = response.body.getReader();
  let loaded = 0;
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    if (typeof onProgress === "function") {
      const percent = Math.min(100, Math.round((loaded / total) * 100));
      onProgress({ percent, cached: false, loaded, total });
    }
  }

  const fullBlob = new Blob(chunks);
  if (hasCache) {
    try {
      const cache = await caches.open(CACHE_NAME);
      cache.put(url, new Response(fullBlob.slice()));
    } catch (e) {}
  }

  return fullBlob;
}
