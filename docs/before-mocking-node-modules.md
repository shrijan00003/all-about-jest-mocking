# Before Mocking Node modules

We are trying to test our `createRecord` function from the handler. The basic test case will look like:

```js
it("should pass the request with proper url and data", async () => {
  process.env.BASE_URL = "https://some-valid-url.com/v1";
  const path = "/some-valid-path";

  const result = await createRecord(path);
  expect(result).toBeTruthy();
});
```

I hope the code is self descriptive. We are calling `createRecord` method and expect the result be something truthy.

What is the result here?

```bash
 FAIL  src/handler.spec.ts
  Handler
    Post
      ✕ should pass the request with proper url and data (70 ms)

  ● Handler › Post › should pass the request with proper url and data

    AxiosError: Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream

      15 |   }
      16 |
    > 17 |   return axios.post(url, data);
         |                ^
      18 | }
      19 |
      20 | export function get(url: string) {

      at dispatchHttpRequest (../node_modules/.pnpm/axios@1.7.2/node_modules/axios/lib/adapters/http.js:321:23)
      at post (http.ts:17:16)
      at createRecord (handler.ts:9:14)
      at Object.<anonymous> (handler.spec.ts:14:40)
      at Object.<anonymous> (handler.spec.ts:14:22)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 total
Snapshots:   0 total
Time:        1.623 s, estimated 2 s
Ran all test suites matching /<path>/all-about-jest-mock\/src\/handler.spec.ts/i with tests matching "Handler".

```

Clearly, we can see that `axios.post` request is failing.

## Lets try mocking now

We are adding `jest.mock("axios")` at the top of the `handler.spec.ts` file. Why are using mocking axios and not the http.ts module or services. Thats the good question and we can mock the https.ts module as well if we want but axios is the lib that we are using for making API call i.e network call. Like we have said before, we don't have to mock local functions if we are not doing any Network call.

To find out what is the `axios.post` in the `post` of http.ts, we have added console.log.

```js
export function post(url: string, data: Record<string, unknown>) {
  // to replicate the error we will throw error for /with-error
  if (url.startsWith("/with-error")) {
    throw new Error("something wrong with post api");
  }

  // --> this line added
  console.log("What is axios.post here", axios.post);

  return axios.post(url, data);
}
```

If you run the test again, you can find the output of the console.log something like:

```bash
    What is axios.post here [Function: httpMethod] {
      _isMockFunction: true,
      getMockImplementation: [Function (anonymous)],
      mock: [Getter/Setter],
      mockClear: [Function (anonymous)],
      mockReset: [Function (anonymous)],
      mockRestore: [Function (anonymous)],
      mockReturnValueOnce: [Function (anonymous)],
      mockResolvedValueOnce: [Function (anonymous)],
      mockRejectedValueOnce: [Function (anonymous)],
      mockReturnValue: [Function (anonymous)],
      mockResolvedValue: [Function (anonymous)],
      mockRejectedValue: [Function (anonymous)],
      mockImplementationOnce: [Function (anonymous)],
      withImplementation: [Function: bound withImplementation],
      mockImplementation: [Function (anonymous)],
      mockReturnThis: [Function (anonymous)],
      mockName: [Function (anonymous)],
      getMockName: [Function (anonymous)],
      _protoImpl: [Function: httpMethod] {
        _isMockFunction: true,
        getMockImplementation: [Function (anonymous)],
        mock: [Getter/Setter],
        mockClear: [Function (anonymous)],
        mockReset: [Function (anonymous)],
        mockRestore: [Function (anonymous)],
        mockReturnValueOnce: [Function (anonymous)],
        mockResolvedValueOnce: [Function (anonymous)],
        mockRejectedValueOnce: [Function (anonymous)],
        mockReturnValue: [Function (anonymous)],
        mockResolvedValue: [Function (anonymous)],
        mockRejectedValue: [Function (anonymous)],
        mockImplementationOnce: [Function (anonymous)],
        withImplementation: [Function: bound withImplementation],
        mockImplementation: [Function (anonymous)],
        mockReturnThis: [Function (anonymous)],
        mockName: [Function (anonymous)],
        getMockName: [Function (anonymous)]
      }
    }
```

Since, we have mocked the whole node module by `jest.mock` function, all its functions is mocked. Now it is the mock function that doesn't return anything i.e `undefined`. So tht our assertions will be failed as we expect it to be something truthy.

```bash
    Post
      ✕ should pass the request with proper url and data (25 ms)

  ● Handler › Post › should pass the request with proper url and data

    expect(received).toBeTruthy()

    Received: undefined

      14 |
      15 |       const result = await createRecord(path);
    > 16 |       expect(result).toBeTruthy();
         |                      ^
      17 |     });
      18 |   });
      19 | });

      at Object.<anonymous> (handler.spec.ts:16:22)
```

Now, its depends on you how you want to mock this function.

Lets modify our mock to have something like this.

```js
jest.mock("axios", () => {
  return {
    Axios: jest.fn().mockImplementation(() => {
      return {
        post: jest.fn().mockResolvedValue({
          success: true,
        }),
      };
    }),
  };
});
```

Here, we are replacing behavior of all the methods of axios package at once at the top of the file.

Since Axios is the ES6 Class constructor, we need to replace its behavior with `mockImplementation` method. We know that we are using post method of Axios, so that we can also change the behavior of the post method like we want. Here `mockResolveValue` is the syntactic sugar for

```ts
jest.fn().mockImplementation(() => Promise.resolve(value));
```

That means, you can rewrite above mocks with:

```ts
jest.mock("axios", () => {
  return {
    Axios: jest.fn().mockImplementation(() => {
      return {
        post: jest
          .fn()
          .mockImplementation(() => Promise.resolve({ success: true })),
      };
    }),
  };
});
```

I guess, first version of it looks more readable to me, If your function should return Promise value you can simply use `mockResolveValue` instead of `mockImplementation`.

If you run the test now, you will be amazed as our first test case with mock just got passed.

```bash
 PASS  src/handler.spec.ts
  Handler
    Post
      ✓ should pass the request with proper url and data (25 ms)

```

You can even check expected result rather than just say it should be truthy or defined.

```ts
expect(result).toEqual({ success: true });
```

And it passes too. 👌

## Internal Error Case 🔴

As per our implementation, we have thrown error for url starting with `/with-error`. So our test case will look like

```ts
it("should throw the error if the url starts with /with-error", async () => {
  const path = "/with-error";
  // we know that it is going to throw the error so lets do try catch to handle the error here.
  try {
    await createRecord(path);
    // it should not be here 🔴
    expect(true).toBe(false);
  } catch (error: unknown) {
    if (error instanceof Error) {
      expect(error.message).toBe("something wrong with post api");
    }
  }
});
```

And it should pass as expected ✅

## External Error Case 🟥

Lets assume a scenario, the external service will throw error if url path starts with `/with-server-error`. The test case should look like this.

```ts
it("should throw the error from the server if url starts with /with-server-error", async () => {
  const path = "/with-server-error";
  // we know that it is going to throw the error so lets do try catch to handle the error here.
  try {
    await createRecord(path);
    // it should not be here 🔴
    expect(true).toBe(false);
  } catch (error: unknown) {
    if (error instanceof Error) {
      expect(error.message).toBe("something wrong with post api in server 👎");
    }
  }
});
```

If we run this test without any modification, it should fail for something like:

```bash
  ● Handler › Post › should throw the error from the server if url starts with /with-server-error

    expect(received).toBe(expected) // Object.is equality

    - Expected  - 1
    + Received  + 4

    - something wrong with post api in server 👎
    + expect(received).toBe(expected) // Object.is equality
    +
    + Expected: false
    + Received: true
```

The reason is obvious, our mock implementation for post method is returning `{success:true}` for all cases.

Lets modify the mock we have created earlier.

```ts
jest.mock("axios", () => {
  return {
    Axios: jest.fn().mockImplementation(() => {
      return {
        post: jest
          .fn()
          .mockRejectedValue(
            new Error("something wrong with post api in server 👎")
          ),
      };
    }),
  };
});
```

You might have noticed that `mockResolveValue` is replaced with the `mockRejectedValue`.

Here the problem occurred, we can't maintain both as implementation in the mock, instead we need to create implementation different from the mock from the top of the file.

Since we can not mock whole structure of `axios` like previously, we should find the way to mock `post` method and change its behavior as per our test cases separately.

### Manual Mocking (jest.mock)

Ref: https://jestjs.io/docs/es6-class-mocks#manual-mock

Instead of creating new file for mock, lets try to mock `post` method at the top of the file and change its behavior in each test case as per our requirement.

#### 1. Mock at the top of the file

At the top of your `handler.spec.ts` file create mock for the axios like:

```ts
const mockPost = jest.fn();
jest.mock("axios", () => {
  return {
    Axios: jest.fn().mockImplementation(() => {
      return {
        post: mockPost,
      };
    }),
  };
});

// -- other imports here
import { createRecord } from "./handler";
```

And in the test case you can add the `post` implementation as per your requirement.

```ts
mockPost.mockRejectedValue(
  new Error("something wrong with post api in server 👎")
);
```
