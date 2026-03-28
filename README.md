# @xtrstudios/sdk

Official TypeScript SDK for the [XtrStudios](https://www.xtrstudios.site) API.

## Installation

```bash
npm install @xtrstudios/sdk
# or
yarn add @xtrstudios/sdk
# or
pnpm add @xtrstudios/sdk
```

## Quick Start

```typescript
import { createClient } from '@xtrstudios/sdk';

const sdk = createClient({
  apiKey: 'YOUR_API_KEY',
});

const featured = await sdk.xtrstudios.getFeatured();
const stream = await sdk.stream.getMovieStream({ id: 12345 });
```

## Configuration

```typescript
import { XtrStudiosSDK } from '@xtrstudios/sdk';

const sdk = new XtrStudiosSDK({
  apiKey: 'YOUR_API_KEY',
  timeout: 15000,
  retries: 3,
  retryDelay: 1000,
  headers: {
    'X-Custom-Header': 'value',
  },
});
```

All requests point to `https://www.xtrstudios.site`.

---

## Modules

### `sdk.xtrstudios`

General XtrStudios catalog and info.

```typescript
const info       = await sdk.xtrstudios.getInfo();
const catalog    = await sdk.xtrstudios.getCatalog(1, 20);
const featured   = await sdk.xtrstudios.getFeatured();
const notices    = await sdk.xtrstudios.getAnnouncements();
const results    = await sdk.xtrstudios.search({ q: 'inception' });
const latency    = await sdk.xtrstudios.ping();
```

### `sdk.xtrstudios.movies`

```typescript
const popular  = await sdk.xtrstudios.movies.getPopular({ page: 1 });
const trending = await sdk.xtrstudios.movies.getTrending();
const movie    = await sdk.xtrstudios.movies.getById(550);
const byImdb   = await sdk.xtrstudios.movies.getByImdbId('tt0137523');
const found    = await sdk.xtrstudios.movies.search({ q: 'fight club' });
const genres   = await sdk.xtrstudios.movies.getGenres();
```

### `sdk.stream`

```typescript
const movieStream = await sdk.stream.getMovieStream({
  id: 550,
  options: { quality: '1080p', format: 'hls' },
});

const seriesStream = await sdk.stream.getSeriesStream({
  id: 1399,
  season: 1,
  episode: 1,
  options: { quality: '720p' },
});

const sources  = await sdk.stream.getSources(550, 'movie');
const best     = sdk.stream.selectBestSource(sources, '1080p');
const health   = await sdk.stream.checkHealth(sources);
const filtered = sdk.stream.filterByFormat(sources, 'hls');
```

### `sdk.series`

```typescript
const series  = await sdk.series.list({ page: 1, genre: 'drama' });
const show    = await sdk.series.getById(1399);
const seasons = await sdk.series.getSeasons(1399);
const eps     = await sdk.series.getEpisodes(1399, 1);
const ep      = await sdk.series.getEpisode(1399, 1, 1);
const next    = await sdk.series.getNextEpisode(1399, 1, 1);
const popular = await sdk.series.getPopular();
const found   = await sdk.series.search({ q: 'breaking bad' });
```

### `sdk.database`

```typescript
const rows = await sdk.database.query({
  table: 'watchlist',
  where: [sdk.database.filter('user_id', 'eq', 'u123')],
  order_by: [sdk.database.sort('created_at', 'desc')],
  limit: 20,
});

const record = await sdk.database.findById('watchlist', 'item-1');
const exists = await sdk.database.exists('watchlist', [
  sdk.database.filter('user_id', 'eq', 'u123'),
]);

const inserted = await sdk.database.insertOne('watchlist', {
  user_id: 'u123',
  media_id: 550,
  media_type: 'movie',
});

await sdk.database.updateById('watchlist', 'item-1', { progress: 72 });
await sdk.database.deleteById('watchlist', 'item-1');

const batchResult = await sdk.database.batch([
  { operation: 'insert', payload: { table: 'logs', data: { event: 'play' } } },
  { operation: 'update', payload: { table: 'user', data: { last_seen: new Date().toISOString() }, where: [{ field: 'id', operator: 'eq', value: 'u123' }] } },
]);
```

### `sdk.freemium`

```typescript
const plans  = await sdk.freemium.getPlans();
const status = await sdk.freemium.getStatus();

const result = await sdk.freemium.subscribe({
  plan_id: 'pro',
  coupon_code: 'SAVE20',
});

await sdk.freemium.upgrade({ new_plan_id: 'premium', immediate: true });
await sdk.freemium.cancel('Switching provider');

const allowed = sdk.freemium.isStreamingAllowed(status);
const hasAds  = sdk.freemium.hasAds(plans[0]);
const { better, improvements } = sdk.freemium.comparePlans(plans[0], plans[1]);
```

### `sdk.flutter`

```typescript
const plugins  = await sdk.flutter.getPlugins('android');
const config   = await sdk.flutter.getConfig('my-app-id');
const manifest = await sdk.flutter.getManifest();
const assets   = await sdk.flutter.getAssets('1.0.0');
const guide    = await sdk.flutter.getInstallGuide('xtrstudios_player');

const theme    = sdk.flutter.getDefaultTheme(true);
const player   = sdk.flutter.getDefaultPlayerConfig();
const initCode = sdk.flutter.generateInitCode(config);
const errors   = sdk.flutter.validateConfig(config);
```

### `sdk.framework`

```typescript
const config   = await sdk.framework.getConfig();
const health   = await sdk.framework.checkHealth();
const healthy  = await sdk.framework.isHealthy();
const version  = await sdk.framework.getVersion();
const update   = await sdk.framework.checkForUpdates();
const features = await sdk.framework.getFeatures();

const isOn  = await sdk.framework.isFeatureEnabled('dark_mode');
const value = await sdk.framework.getExperimentValue('new_ui_v2');
const pct   = await sdk.framework.getRolloutPercentage('beta_player');

const plugins = await sdk.framework.getPlugins();
await sdk.framework.enablePlugin('analytics');
await sdk.framework.disablePlugin('legacy-player');
```

### `sdk.xtrsoftwares`

```typescript
const packages = await sdk.xtrsoftwares.getPackages({ platform: 'android' });
const pkg      = await sdk.xtrsoftwares.getPackageById('xtr-player');
const download = await sdk.xtrsoftwares.getDownloadInfo('xtr-player');
const changelog = await sdk.xtrsoftwares.getChangelog('xtr-player');
const latest   = await sdk.xtrsoftwares.getLatest(5);

const compat   = await sdk.xtrsoftwares.checkCompatibility('xtr-player', 'android', '12');
const valid    = await sdk.xtrsoftwares.verifyChecksum('xtr-player', 'abc123');
const latest_entry = sdk.xtrsoftwares.getLatestChangelogEntry(changelog);
const breaking = sdk.xtrsoftwares.getBreakingChanges(changelog);
const fixes    = sdk.xtrsoftwares.filterChangesByType(changelog, 'fix');
```

### `sdk.middleware`

```typescript
import {
  loggingMiddleware,
  authMiddleware,
  cacheMiddleware,
  rateLimitMiddleware,
  retryMiddleware,
} from '@xtrstudios/sdk';

sdk.middleware
  .use(loggingMiddleware(console.log))
  .use(authMiddleware(() => localStorage.getItem('token') ?? undefined))
  .use(cacheMiddleware(60_000))
  .use(rateLimitMiddleware(100, 60_000))
  .use(retryMiddleware(3, 1000));
```

### `sdk.router`

```typescript
const url = sdk.router.resolve(
  '/api/series/:id/seasons/:season/episodes',
  { id: 1399, season: 1 },
  { page: 1, limit: 20 }
);

const data = await sdk.router.call('movies.popular', undefined, { page: 1 });
const routes = sdk.router.listRoutes();
```

---

## Error Handling

```typescript
import {
  XtrError,
  XtrAuthError,
  XtrNotFoundError,
  XtrRateLimitError,
  XtrNetworkError,
  XtrStreamError,
  isXtrError,
} from '@xtrstudios/sdk';

try {
  const movie = await sdk.xtrstudios.movies.getById(99999);
} catch (err) {
  if (err instanceof XtrNotFoundError) {
    console.log('Not found:', err.message);
  } else if (err instanceof XtrAuthError) {
    console.log('Auth failed — check your API key');
  } else if (err instanceof XtrRateLimitError) {
    console.log('Rate limited. Retry after:', err.retryAfter);
  } else if (isXtrError(err)) {
    console.log(`SDK error [${err.code}]:`, err.message);
  }
}
```

---

## License

MIT © [XtrStudios](https://www.xtrstudios.site)
