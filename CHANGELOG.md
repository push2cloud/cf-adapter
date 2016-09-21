## [v1.4.4](https://github.com/push2cloud/cf-adapter/compare/v1.4.3...v1.4.4)
- improves updateServiceInstance function

## [v1.4.3](https://github.com/push2cloud/cf-adapter/compare/v1.4.2...v1.4.3)
- adds updateServiceInstance function

## [v1.4.2](https://github.com/push2cloud/cf-adapter/compare/v1.4.1...v1.4.2)
- change default of maxRetries for waitForServiceInstance

## [v1.4.1](https://github.com/push2cloud/cf-adapter/compare/v1.4.0...v1.4.1)
- added log message trigger for dockerImage staging

## [v1.4.0](https://github.com/push2cloud/cf-adapter/compare/v1.3.0...v1.4.0)
- added options for dockerImage

## [v1.3.0](https://github.com/push2cloud/cf-adapter/compare/v1.2.1...v1.3.0)
- possibility to create routes with path and port or generatedPort

## [v1.2.1](https://github.com/push2cloud/cf-adapter/compare/v1.2.0...v1.2.1)
- fix parseCFSummary when there is no lastOperation on service

## [v1.2.0](https://github.com/push2cloud/cf-adapter/compare/v1.1.9...v1.2.0)
- new function: waitForServiceInstance

## [v1.1.9](https://github.com/push2cloud/cf-adapter/compare/v1.1.5...v1.1.9)
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
