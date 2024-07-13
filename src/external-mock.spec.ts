import Axios, { mockPost } from "./__mock__/handler";
import { createRecord } from "./handler";

jest.mock("axios", () => {
  return { Axios: Axios };
});

describe("Handler", () => {
  beforeEach(() => {
    Axios.mockClear();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Post", () => {
    it("should throw the error from the server if url starts with /with-server-error", async () => {
      // Here you define your post implementation
      mockPost.mockRejectedValue(
        new Error("something wrong with post api in server 👎")
      );

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
