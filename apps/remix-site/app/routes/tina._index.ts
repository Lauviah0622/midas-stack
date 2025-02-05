import { TinaNodeBackend, LocalBackendAuthProvider } from '@tinacms/datalayer'
// import { TinaAuthJSOptions, AuthJsBackendAuthProvider } from 'tinacms-authjs'
import { createHttpResponseProxy } from "../utils/responseAdapter";

import databaseClient from '@tina-gen/databaseClient'
import { LoaderFunctionArgs } from '@remix-run/cloudflare'
import { IncomingMessage, Server, ServerResponse } from 'http';

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true'

const handler = TinaNodeBackend({
  // 先暫時用這個
  authProvider: LocalBackendAuthProvider(),
    // ? LocalBackendAuthProvider()
    // : AuthJsBackendAuthProvider({
    //     authOptions: TinaAuthJSOptions({
    //       databaseClient: databaseClient,
    //       secret: process.env.NEXTAUTH_SECRET ?? '',
    //     }),
    //   }),
  databaseClient,
});

export async function loader({ request }: LoaderFunctionArgs) {
  // type hack T_T
  const requestClone = request as unknown as IncomingMessage
  const resProxy = createHttpResponseProxy();
  // type hack T_T
  await handler(requestClone, resProxy as unknown as ServerResponse);
  const response = resProxy.toResponse();
  return response;
}

