type SetOp<TValue = any> = ['set', { key: string | symbol; value: TValue }];
type FuncOp<TProp extends Array<any> = Array<any>> = ['func', { key: string | symbol; props: TProp }];

type Op = SetOp | FuncOp;

const getResponseFromOps = (operations: Op[]) => {
  type ResponseProps = {
    body: BodyInit | null;
    init: ResponseInit;
  };

  const accum: ResponseProps = {
    body: null,
    init: {
      status: undefined,
      headers: {},
    },
  };

  const { body, init } = operations.reduce((responseProps, [method, op]) => {
    // 這部份後續可以擴充

    if (method === 'set') {
      const { key, value } = op;

      if (key === 'statusCode') {
        responseProps.init.status = value;
      }
    }

    if (method === 'func') {
      const { key, props } = op;

      if (key === 'write') {
        const [body] = props;
        responseProps.body = body;
      }
    }

    return responseProps;
  }, accum);

  return new Response(body, init);
};

export const createHttpResponseProxy = () => {
  const OPERATIONS_KEY = '$operations';

  interface ProxyObject {
    $operations: Op[];
    toResponse: () => Response;
  }

  const createObj = (): ProxyObject => {
    const obj = Object.create(null);
    obj.$operations = [];
    return obj;
  };

  const handler: ProxyHandler<ProxyObject> = {
    get(target, key, receiver) {
      console.log(target, key, receiver);

      if (key === 'toResponse') {
        // 可以在 end 這裡處理一些事情
        const ops = Reflect.get(target, OPERATIONS_KEY);

        return () => {
          const response = getResponseFromOps(ops);
          return response;
        };
      }

      return (...props: any[]) => {
        const ops = Reflect.get(target, OPERATIONS_KEY);
        ops.push(['func', { key, props }]);
      };
    },

    set(target, key, value) {
      const ops = Reflect.get(target, OPERATIONS_KEY);
      ops.push(['set', { key, value }]);

      return true;
    },
  };

  return new Proxy(createObj(), handler);
};
