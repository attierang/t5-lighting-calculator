module.exports = {
  globDirectory: "build/",
  globPatterns: [
    "**/*.{js,css,html,png,jpg,jpeg,gif,svg,ico,woff,woff2,ttf,eot}"
  ],
  swDest: "build/sw.js",
  swSrc: "public/sw.js",
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      eventName: 'origin',
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
        },
        cacheKeyWillBeUsed: async ({ request }) => {
          return `${request.url}?${Date.now()}`;
        }
      }
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      eventName: 'origin',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60 // <== 7 days
        }
      }
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      eventName: 'origin',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // <== 24 hours
        }
      }
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      eventName: 'origin',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // <== 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:mp3|wav|ogg)$/i,
      eventName: 'origin',
      handler: 'CacheFirst',
      options: {
        rangeRequests: true,
        cacheName: 'static-audio-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // <== 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:mp4)$/i,
      eventName: 'origin',
      handler: 'CacheFirst',
      options: {
        rangeRequests: true,
        cacheName: 'static-video-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // <== 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:js)$/i,
      eventName: 'origin',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // <== 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      eventName: 'origin',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-style-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // <== 24 hours
        }
      }
    },
    {
      urlPattern: /\/_next\/static.+\.js$/i,
      eventName: 'origin',
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-js-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 * 365 // <== 365 days
        }
      }
    },
    {
      urlPattern: /\/_next\/static.+\.css$/i,
      eventName: 'origin',
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-css-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 * 365 // <== 365 days
        }
      }
    },
    {
      urlPattern: /\/_next\/static.+\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      eventName: 'origin',
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 * 365 // <== 365 days
        }
      }
    },
    {
      urlPattern: /\/_next\/static.+\.(?:woff|woff2|ttf|eot)$/i,
      eventName: 'origin',
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-font-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 * 365 // <== 365 days
        }
      }
    },
    {
      urlPattern: /\.(?:json|xml|csv)$/i,
      eventName: 'origin',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'static-data-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // <== 24 hours
        }
      }
    },
    {
      urlPattern: /\/api\/.*$/i,
      eventName: 'origin',
      handler: 'NetworkFirst',
      method: 'GET',
      options: {
        cacheName: 'apis',
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 24 * 60 * 60 // <== 24 hours
        },
        networkTimeoutSeconds: 10 // <== 10 seconds
      }
    },
    {
      urlPattern: /.*/i,
      eventName: 'origin',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'others',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // <== 24 hours
        },
        networkTimeoutSeconds: 10 // <== 10 seconds
      }
    }
  ]
};

