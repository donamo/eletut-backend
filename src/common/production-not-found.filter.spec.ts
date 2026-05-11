import { ArgumentsHost, Logger, NotFoundException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Request, Response } from 'express';
import { ProductionNotFoundFilter } from './production-not-found.filter';

type TestResponse = Response & {
  status: jest.MockedFunction<Response['status']>;
  end: jest.MockedFunction<Response['end']>;
};

const createResponse = () => {
  const response = {
    headersSent: false,
  } as TestResponse;
  response.status = jest.fn().mockReturnValue(response) as TestResponse['status'];
  response.end = jest.fn() as unknown as TestResponse['end'];
  return response;
};

const createHttpHost = (response: Response) =>
  ({
    getType: () => 'http',
    switchToHttp: () => ({
      getRequest: () =>
        ({
          ip: '127.0.0.1',
          headers: {},
          method: 'GET',
          originalUrl: '/missing',
          socket: {},
        }) as Request,
      getResponse: () => response as Response,
    }),
  }) as ArgumentsHost;

describe('ProductionNotFoundFilter', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sends the 404 response immediately when delay is disabled', () => {
    const response = createResponse();

    new ProductionNotFoundFilter(0).catch(
      new NotFoundException(),
      createHttpHost(response),
    );

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.end).toHaveBeenCalledTimes(1);
  });

  it('delays the 404 response when delay is configured', () => {
    jest.useFakeTimers();
    const response = createResponse();

    new ProductionNotFoundFilter(250).catch(
      new NotFoundException(),
      createHttpHost(response),
    );

    expect(response.status).not.toHaveBeenCalled();

    jest.advanceTimersByTime(250);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.end).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});
