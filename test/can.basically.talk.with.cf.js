const expect = require('expect.js');
const cfAdapter = require('../');
const join = require('path').join;

describe('can basically talk with cf', () => {

  var api;

  before(() => {
    api = cfAdapter({
      api: 'https://api.lyra-836.appcloud.swisscom.com',
      username: process.env.CF_USER,
      password: process.env.CF_PWD,
      org: process.env.CF_ORG,
      space: process.env.CF_SPACE
    });
  });

  describe('getInfo', () => {

    it('should work as expected', (done) => {

      api.getInfo((err, result) => {
        expect(err).not.to.be.ok();
        expect(result).to.be.ok();
        done();
      });

    });

  });

  describe('init', () => {

    it('should work as expected', (done) => {

      api.init((err, result) => {
        expect(err).not.to.be.ok();
        expect(api.actualDeploymentConfig).to.be.an('object');
        expect(api.inited).to.eql(true);
        expect(api.services).to.be.an('array');
        expect(api.services[0].servicePlans).to.be.an('array');
        done();
      });

    });

  });

  describe('inited', () => {

    before((done) => {
      api.init(done);
    });

    describe('getSpaceSummary', () => {

      it('should work as expected', (done) => {

        api.getSpaceSummary((err, result) => {
          expect(err).not.to.be.ok();
          expect(result.guid).to.eql(api.spaceGuid);
          expect(result.name).to.eql(api.options.space);
          expect(result.apps).to.be.an('array');
          expect(result.services).to.be.an('array');
          done();
        });

      });

    });

    describe('getActualDeploymentConfig', () => {

      it('should work as expected', (done) => {

        api.getActualDeploymentConfig((err, result) => {
          expect(err).not.to.be.ok();
          expect(result.apps).to.be.an('array');
          expect(result.services).to.be.an('array');
          expect(api.actualDeploymentConfig).to.eql(result);
          done();
        });

      });

    });

    describe.skip('createServiceInstance and deleteServiceInstance', () => {

      it('should work as expected', (done) => {

        api.createServiceInstance({ name: 'temp-service', type: 'elk', plan: 'beta' }, (err, result) => {
          expect(err).not.to.be.ok();
          expect(result.entity.name).to.eql('temp-service');

          api.deleteServiceInstance({ serviceInstanceGuid: result.metadata.guid }, (err, result) => {
            expect(err).not.to.be.ok();
            done();
          });
        });

      });

    });

    describe.skip('pushApp and updateApp and deleteApp', () => {

      it('should work as expected', (done) => {

        api.pushApp({ name: 'temp-app', appPath: join(__dirname, '/sampleApp') }, (err, result) => {
          expect(err).not.to.be.ok();
          expect(result.entity.name).to.eql('temp-app');

          api.updateApp({ appGuid: result.metadata.guid, newName: 'temp-app-modified', instances: 5 }, (err, result) => {
            expect(err).not.to.be.ok();

            api.deleteApp({ appGuid: result.metadata.guid }, (err, result) => {
              expect(err).not.to.be.ok();
              done();
            });
          });
        });

      });

    });

    describe.skip('round-trip', () => {

      it('should work as expected', (done) => {

        api.pushApp({ name: 'temp-app', appPath: join(__dirname, '/sampleApp') }, (err, app) => {
          expect(err).not.to.be.ok();
          expect(app.entity.name).to.eql('temp-app');

          api.createServiceInstance({ name: 'temp-service', serviceName: 'elk', planName: 'beta' }, (err, service) => {
            expect(err).not.to.be.ok();
            expect(service.entity.name).to.eql('temp-service');

            api.bindService({ appGuid: app.metadata.guid, serviceInstanceGuid: service.metadata.guid }, (err, binding) => {
              expect(err).not.to.be.ok();
              expect(binding.metadata.guid).to.be.ok();

              api.unbindService({ serviceBindingGuid: binding.metadata.guid }, (err) => {
                expect(err).not.to.be.ok();

                api.deleteApp({ appGuid: app.metadata.guid }, (err, result) => {
                  expect(err).not.to.be.ok();

                  api.deleteServiceInstance({ serviceInstanceGuid: service.metadata.guid }, (err, result) => {
                    expect(err).not.to.be.ok();
                    done();
                  });
                });
              });
            });
          });
        });

      });

    });

    describe('createRoute and deleteRoute', () => {

      it('should work as expected', (done) => {

        api.createRoute({
          hostname: 'tmp-route-for-my-cf-test-space',
          domain: 'scapp.io'
        }, (err, result) => {
          expect(err).not.to.be.ok();
          expect(result.metadata.guid).to.be.ok();

          api.deleteRoute({
            routeGuid: result.metadata.guid
          }, (err) => {
            expect(err).not.to.be.ok();
            done();
          });
        });

      });

    });

    describe('route round-trip', () => {

      it('should work as expected', (done) => {

        api.createRoute({
          hostname: 'tmp-route-for-my-cf-test-space',
          domain: 'scapp.io'
        }, (err, route) => {
          expect(err).not.to.be.ok();
          expect(route.metadata.guid).to.be.ok();

          api.createApp({ name: 'tmp-app' }, (err, app) => {
            expect(err).not.to.be.ok();

            api.associateRoute({ appGuid: app.metadata.guid, routeGuid: route.metadata.guid }, (err) => {
              expect(err).not.to.be.ok();

              api.disassociateRoute({ appGuid: app.metadata.guid, routeGuid: route.metadata.guid }, (err) => {
                expect(err).not.to.be.ok();

                api.deleteRoute({
                  routeGuid: route.metadata.guid
                }, (err) => {
                  expect(err).not.to.be.ok();

                  api.deleteApp({
                    appGuid: app.metadata.guid
                  }, (err) => {
                    expect(err).not.to.be.ok();
                    done();
                  });
                });
              });
            });

          });

        });

      });

    });

    describe.skip('staging round-trip', () => {

      it('should work as expected', (done) => {

        this.timeout(120000);

        api.pushApp({ name: 'temp-app', appPath: join(__dirname, '/sampleApp') }, (err, app) => {
          expect(err).not.to.be.ok();
          expect(app.entity.name).to.eql('temp-app');

          api.stageApp({ appGuid: app.metadata.guid }, (err) => {
            expect(err).not.to.be.ok();

            api.startAppAndWaitForInstances({ appGuid: app.metadata.guid, gracePeriod: 3, interval: 2 }, (err) => {
              expect(err).not.to.be.ok();

              api.deleteApp({ appGuid: app.metadata.guid }, (err) => {
                expect(err).not.to.be.ok();
                done();
              });
            });
          });
        });

      });

    });

    describe('setEnv', () => {

      it('should work as expected', (done) => {

        api.createApp({ name: 'tmp-app' }, (err, app) => {
          expect(err).not.to.be.ok();

          api.setEnv({ appGuid: app.metadata.guid, env: { a: 'val 1', b: 'other' } }, (err, res) => {
            expect(err).not.to.be.ok();
            expect(res.entity.environment_json.a).to.eql('val 1');

            api.deleteApp({
              appGuid: app.metadata.guid
            }, (err) => {
              expect(err).not.to.be.ok();
              done();
            });
          });

        });

      });

    });

  });

});
