# Changelog

## [1.2.Beta] - 2026-04-24

### Added
- Initial release of the XtrStudios TypeScript SDK
- `stream` module — movie, series, and episode streaming with quality selection and health checks
- `series` module — full series, season, and episode browsing and search
- `database` module — query, insert, update, delete, and batch operations
- `freemium` module — plan management, subscriptions, upgrades, and usage tracking
- `flutter` module — plugin registry, app config, asset manifests, and install guides
- `framework` module — feature flags, health checks, versioning, and plugin management
- `xtrstudios` module — catalog, featured content, announcements, and global search
- `xtrsoftwares` module — software packages, changelogs, downloads, and compatibility checks
- `routes` module — typed route registry with dynamic path and query resolution
- `middleware` module — composable pipeline with logging, auth, cache, rate-limit, retry, and timeout handlers
- Typed error hierarchy: `XtrError`, `XtrAuthError`, `XtrNotFoundError`, `XtrRateLimitError`, `XtrNetworkError`, `XtrStreamError`, `XtrTimeoutError`, `XtrValidationError`
- Automatic exponential-backoff retries
- Configurable request timeout via `AbortController`
- Full TypeScript types and declarations
