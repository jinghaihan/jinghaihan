import process from 'node:process'

// Site configuration - can be overridden by environment variables
export const DOMAIN = process.env.SITE_URL || 'https://octohash.me'
