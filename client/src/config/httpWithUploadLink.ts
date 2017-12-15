/* tslint:disable */
// The MIT License (MIT)
// Copyright (c) 2016 - 2017 Meteor Development Group, Inc.
// Workarround to support upload with apollo and absinthe
// This file come from Apollo link
// From https://github.com/apollographql/apollo-link/blob/master/packages/apollo-link-http/src/httpLink.ts

import { ApolloLink, Observable, RequestHandler, Operation } from 'apollo-link';
import { print } from 'graphql/language/printer';
import { extractFiles } from 'extract-files';

export namespace HttpLink {
  /**
   * A function that generates the URI to use when fetching a particular operation.
   */
  export interface UriFunction {
    (operation: Operation): string;
  }

  export interface Options {
    /**
     * The URI to use when fetching operations.
     *
     * Defaults to '/graphql'.
     */
    uri?: string | UriFunction;

    /**
     * Passes the extensions field to your graphql server.
     *
     * Defaults to false.
     */
    includeExtensions?: boolean;

    /**
     * A `fetch`-compatible API to use when making requests.
     */
    fetch?: GlobalFetch['fetch'];

    /**
     * An object representing values to be sent as headers on the request.
     */
    headers?: any;

    /**
     * The credentials policy you want to use for the fetch call.
     */
    credentials?: string;

    /**
     * Any overrides of the fetch options argument to pass to the fetch call.
     */
    fetchOptions?: any;
  }
}

// For backwards compatibility.
export import FetchOptions = HttpLink.Options;
export import UriFunction = HttpLink.UriFunction;

// XXX replace with actual typings when available
declare var AbortController: any;

//Used for any Error for data from the server
//on a request with a Status >= 300
//response contains no data or errors
type ServerError = Error & {
  response: Response;
  result: Record<string, any>;
  statusCode: number;
};

//Thrown when server's resonse is cannot be parsed
type ServerParseError = Error & {
  response: Response;
  statusCode: number;
  bodyText: string;
};

const throwServerError = (response: any, result: any, message: any) => {
  const error = new Error(message) as ServerError;

  error.response = response;
  error.statusCode = response.status;
  error.result = result;

  throw error;
};

const parseAndCheckResponse = (request: any) => (response: Response) => {
  return response
    .text()
    .then(bodyText => {
      try {
        return JSON.parse(bodyText);
      } catch (err) {
        const parseError = err as ServerParseError;
        parseError.response = response;
        parseError.statusCode = response.status;
        parseError.bodyText = bodyText;
        return Promise.reject(parseError);
      }
    })
    .then(result => {
      if (response.status >= 300) {
        //Network error
        throwServerError(response, result, `Response not successful: Received status code ${response.status}`);
      }
      if (!result.hasOwnProperty('data') && !result.hasOwnProperty('errors')) {
        //Data error
        throwServerError(response, result, `Server response was missing for query '${request.operationName}'.`);
      }
      return result;
    });
};

const checkFetcher = (fetcher: any | GlobalFetch['fetch']) => {
  if ((fetcher as any).use) {
    throw new Error(`
      It looks like you're using apollo-fetch! Apollo Link now uses native fetch
      implementation, so apollo-fetch is not needed. If you want to use your existing
      apollo-fetch middleware, please check this guide to upgrade:
        https://github.com/apollographql/apollo-link/blob/master/docs/implementation.md
    `);
  }
};

const warnIfNoFetch = (fetcher: any) => {
  if (!fetcher && typeof fetch === 'undefined') {
    let library: string = 'unfetch';
    if (typeof window === 'undefined') library = 'node-fetch';
    throw new Error(
      `fetch is not found globally and no fetcher passed, to fix pass a fetch for
      your environment like https://www.npmjs.com/package/${library}.
      For example:
        import fetch from '${library}';
        import { createHttpLink } from 'apollo-link-http';
        const link = createHttpLink({ uri: '/graphql', fetch: fetch });
      `
    );
  }
};

const createSignalIfSupported = () => {
  if (typeof AbortController === 'undefined') return { controller: false, signal: false };

  const controller = new AbortController();
  const signal = controller.signal;
  return { controller, signal };
};

const defaultHttpOptions = {
  includeQuery: true,
  includeExtensions: false
};

export const createHttpLink = (
  { uri, fetch: fetcher, includeExtensions, ...requestOptions }: HttpLink.Options = {}
) => {
  // dev warnings to ensure fetch is present
  warnIfNoFetch(fetcher);
  if (fetcher) checkFetcher(fetcher);

  // use default global fetch is nothing passed in
  if (!fetcher) fetcher = fetch;
  if (!uri) uri = '/graphql';

  return new ApolloLink(
    operation =>
      new Observable(observer => {
        const {
          headers,
          credentials,
          fetchOptions = {},
          uri: contextURI,
          http: httpOptions = {}
        } = operation.getContext();
        const { operationName, extensions, variables, query } = operation;
        const http = { ...defaultHttpOptions, ...httpOptions };
        const body = { operationName, variables };

        if (includeExtensions || http.includeExtensions) (body as any).extensions = extensions;

        // not sending the query (i.e persisted queries)
        if (http.includeQuery) (body as any).query = print(query);

        let options = fetchOptions;
        if (requestOptions.fetchOptions) options = { ...requestOptions.fetchOptions, ...options };
        const fetcherOptions: any = {
          method: 'POST',
          ...options,
          headers: {
            // headers are case insensitive (https://stackoverflow.com/a/5259004)
            accept: '*/*'
          }
        };

        /////////////////////////////////////////////////////////////////
        // This part is added to support upload with apollo and absinthe
        /////////////////////////////////////////////////////////////////
        const files = extractFiles(body);
        if (files.length) {
          fetcherOptions.body = new FormData();
          files.forEach(({ path, file }: any) => {
            const pathArray = path.split('.');
            variables[pathArray[pathArray.length - 1]] = path;
            fetcherOptions.body.append(path, file);
          });
          fetcherOptions.body.append('operationName', operationName);
          fetcherOptions.body.append('variables', JSON.stringify(variables));
          fetcherOptions.body.append('query', print(query));
        } else {
          let serializedBody;
          try {
            serializedBody = JSON.stringify(body);
          } catch (e) {
            const parseError: any = new Error(`Network request failed. Payload is not serializable: ${e.message}`);
            parseError.parseError = e;
            throw parseError;
          }
          fetcherOptions.headers['content-type'] = 'application/json';
          fetcherOptions.body = serializedBody;
        }
        /////////////////////////////////////////////////////////////////
        // end
        /////////////////////////////////////////////////////////////////

        if (requestOptions.credentials) fetcherOptions.credentials = requestOptions.credentials;
        if (credentials) fetcherOptions.credentials = credentials;

        if (requestOptions.headers)
          fetcherOptions.headers = {
            ...fetcherOptions.headers,
            ...requestOptions.headers
          };
        if (headers) fetcherOptions.headers = { ...fetcherOptions.headers, ...headers };

        const { controller, signal } = createSignalIfSupported();
        if (controller) fetcherOptions.signal = signal;

        fetcher(contextURI || uri, fetcherOptions)
          // attach the raw response to the context for usage
          .then(response => {
            operation.setContext({ response });
            return response;
          })
          .then(parseAndCheckResponse(operation))
          .then(result => {
            // we have data and can send it to back up the link chain
            observer.next(result);
            observer.complete();
            return result;
          })
          .catch(err => {
            // fetch was cancelled so its already been cleaned up in the unsubscribe
            if (err.name === 'AbortError') return;
            observer.error(err);
          });

        return () => {
          // XXX support canceling this request
          // https://developers.google.com/web/updates/2017/09/abortable-fetch
          if (controller) controller.abort();
        };
      })
  );
};

export class HttpLink extends ApolloLink {
  public requester: RequestHandler;
  constructor(opts?: HttpLink.Options) {
    super(createHttpLink(opts).request);
  }
}
