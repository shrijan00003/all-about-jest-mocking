// const mockPost = jest.fn();
// jest.mock("axios", () => {
//   return {
//     Axios: jest.fn().mockImplementation(() => {
//       return {
//         post: mockPost,
//       };
//     }),
//   };
// });

import MockAxios, { mockPost } from "./__mock__/handler";

// import { Axios } from "axios";
import { createRecord } from "./handler";
jest.mock("axios", () => {
  return {
    Axios: MockAxios,
  };
});

// jest.mock("axios", () => {
//   return {
//     Axios: jest.fn().mockImplementation(() => {
//       return {
//         post: jest
//           .fn()
//           .mockImplementation(() => Promise.resolve({ success: true })),
//       };
//     }),
//   };
// });

// jest.mock("axios", () => {
//   return {
//     Axios: jest.fn().mockImplementation(() => {
//       return {
//         post: jest
//           .fn()
//           .mockRejectedValue(
//             new Error("something wrong with post api in server 👎")
//           ),
//       };
//     }),
//   };
// });

const mockData = {
  key1: "value1",
  key2: "value2",
};

describe("Handler", () => {
  // beforeEach(() => {
  //   MockAxios.mockClear();
  // });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("Post", () => {
    it("should pass the request with proper url and data", async () => {
      process.env.BASE_URL = "https://some-valid-url.com/v1";
      const path = "/some-valid-path";

      const result = await createRecord(path);
      expect(result).toEqual({ success: true });
    });

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

    it("should throw the error from the server if url starts with /with-server-error", async () => {
      // (Axios as unknown as jest.Mock).mockImplementation(() => {
      //   return {
      //     post: jest
      //       .fn()
      //       .mockRejectedValue(
      //         new Error("something wrong with post api in server 👎")
      //       ),
      //   };
      // });

      // mockAxios.mockImplementation(() => {
      //   return {
      //     post: jest.fn().mockRejectedValue(new Error("whatever!")),
      //   };
      // });

      // This is success
      mockPost.mockRejectedValue(
        new Error("something wrong with post api in server 👎")
      );

      // jest
      //   .spyOn(Axios.prototype, "post")
      //   .mockRejectedValue(
      //     new Error("something wrong with post api in server 👎")
      //   );

      // jest.spyOn(axios, "Axios").mockImplementation(() => {
      //   return {
      //     post: jest.fn().mockRejectedValue(new Error("whateveer!")),
      //   } as any;
      // });

      const path = "/with-server-error";
      // we know that it is going to throw the error so lets do try catch to handle the error here.
      try {
        await createRecord(path);
        // it should not be here 🔴
        expect(true).toBe(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          expect(error.message).toEqual(
            "something wrong with post api in server 👎"
          );
        }
      }
    });
  });
});
