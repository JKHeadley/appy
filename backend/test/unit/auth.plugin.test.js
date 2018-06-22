const rewire = require('rewire')

let authPlugin = rewire('../../server/plugins/auth.plugin')

describe('applyRefreshStrategy ', () => {
  let applyRefreshStrategy
  let server

  beforeAll(() => {
    applyRefreshStrategy = authPlugin.__get__('internals.applyRefreshStrategy')

    server = {
      ext: jest.fn(),
      auth: {
        strategy: jest.fn()
      }
    }
  })

  test('calls server.ext', () => {
    expect.assertions(1);

    applyRefreshStrategy(server)

    let onPostHandlerCallback = server.ext.mock.calls[0][1]
    expect(server.ext).toBeCalledWith('onPostHandler', onPostHandlerCallback);
  });

  test('calls server.auth.strategy', () => {
    expect.assertions(1);

    let AUTH_STRATEGIES = authPlugin.__get__('AUTH_STRATEGIES')

    applyRefreshStrategy(server)

    let authStrategyObj = server.auth.strategy.mock.calls[0][2]
    expect(server.auth.strategy).toBeCalledWith(AUTH_STRATEGIES.REFRESH, 'jwt', authStrategyObj);
  });

});
