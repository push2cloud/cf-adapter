## [v1.1.6](https://github.com/push2cloud/cf-adapter/compare/v1.1.5...v1.1.6)
- sometimes stopping an app causes an UnknownError so we make an additional get request to verify the app

## [v1.1.5](https://github.com/push2cloud/cf-adapter/compare/v1.1.4...v1.1.5)
- optimize graceRequest to catch strange >= 500 statusCode responses

## [v1.1.4](https://github.com/push2cloud/cf-adapter/compare/v1.1.3...v1.1.4)
- retry fix for delete app

## [v1.1.3](https://github.com/push2cloud/cf-adapter/compare/v1.1.1...v1.1.3)
- additional retry case for swisscom

## [v1.1.1](https://github.com/push2cloud/cf-adapter/compare/v1.1.0...v1.1.1)
- adds support to upload single files (e.g. jar files)

## [v1.1.0](https://github.com/push2cloud/cf-adapter/compare/v1.0.5...v1.1.0)
- stats retry event
- modular retry handlers
- autoAttachRetryHandler for swisscom

## [v1.0.4](https://github.com/push2cloud/cf-adapter/compare/v1.0.4...v1.0.5)
- adds support for ignoring invalid certs in websockets

## [v1.0.4](https://github.com/push2cloud/cf-adapter/compare/v1.0.3...v1.0.4)
- return correctly if login in graceRequest fails

## [v1.0.3](https://github.com/push2cloud/cf-adapter/compare/v1.0.2...v1.0.3)
- fix parseCFSummary function

## [v1.0.2](https://github.com/push2cloud/cf-adapter/compare/v1.0.1...v1.0.2)
- fix promise api

## [v1.0.1](https://github.com/push2cloud/cf-adapter/compare/v1.0.0...v1.0.1)
- fix convertSize regex
