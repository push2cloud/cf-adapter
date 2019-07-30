## [v1.7.4](https://github.com/push2cloud/cf-adapter/compare/v1.7.3...v1.7.4)
- fix createUserProvidedServiceInstance response handling

## [v1.7.3](https://github.com/push2cloud/cf-adapter/compare/v1.7.2...v1.7.3)
- wait for service unbound confirmation before execute callback

## [v1.7.2](https://github.com/push2cloud/cf-adapter/compare/v1.7.1...v1.7.2)
- in case of error during start or stop app, retry once

## [v1.7.1](https://github.com/push2cloud/cf-adapter/compare/v1.6.7...v1.7.1)
- basic functions for user provided service instance

## [v1.6.7](https://github.com/push2cloud/cf-adapter/compare/v1.6.6...v1.6.7)
- added new complete message for new cell logs

## [v1.6.6](https://github.com/push2cloud/cf-adapter/compare/v1.6.5...v1.6.6)
- fix for parsing service infos of a user provided service

## [v1.6.5](https://github.com/push2cloud/cf-adapter/compare/v1.6.4...v1.6.5)
- make start and wait for functions more fault tolerant

## [v1.6.4](https://github.com/push2cloud/cf-adapter/compare/v1.6.3...v1.6.4)
- make stageApp more fault tolerant

## [v1.6.3](https://github.com/push2cloud/cf-adapter/compare/v1.6.2...v1.6.3)
- createTunnel: disable strict host key checking for ssh fallback

## [v1.6.2](https://github.com/push2cloud/cf-adapter/compare/v1.6.1...v1.6.2)
- optimize createTunnel

## [v1.6.1](https://github.com/push2cloud/cf-adapter/compare/v1.6.0...v1.6.1)
- optimize createTunnel

## [v1.6.0](https://github.com/push2cloud/cf-adapter/compare/v1.5.5...v1.6.0)
- createTunnel
- getCode
- getEnv

## [v1.5.5](https://github.com/push2cloud/cf-adapter/compare/v1.5.3...v1.5.5)
- bindService check if already existing

## [v1.5.3](https://github.com/push2cloud/cf-adapter/compare/v1.5.2...v1.5.3)
- use 120s as default timeout for waitForAllInstancesRunning and startAppAndWaitForMessages

## [v1.5.2](https://github.com/push2cloud/cf-adapter/compare/v1.5.1...v1.5.2)
- use 120s as default for healthCheckTimeout

## [v1.5.2](https://github.com/push2cloud/cf-adapter/compare/v1.5.1...v1.5.2)
- use 120s as default for healthCheckTimeout

## [v1.5.1](https://github.com/push2cloud/cf-adapter/compare/v1.5.0...v1.5.1)
- use max possible value for pagination

## [v1.5.0](https://github.com/push2cloud/cf-adapter/compare/v1.4.6...v1.5.0)
- use doppler_logging_endpoint when present

## [v1.4.6](https://github.com/push2cloud/cf-adapter/compare/v1.4.5...v1.4.6)
- update some dependencies

## [v1.4.5](https://github.com/push2cloud/cf-adapter/compare/v1.4.4...v1.4.5)
- improve pushApp to not createApp if not needed

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
