// Augments the CloudflareEnv type declared by @opennextjs/cloudflare so
// `env.MEDIA` is typed everywhere without redeclaring the whole interface.
export {};

declare global {
  interface CloudflareEnv {
    MEDIA: R2Bucket;
  }
}
