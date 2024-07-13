import { post } from "./http";

export function createRecord(path: string) {
  const data = {
    key1: "value1",
    key2: "value2",
  };

  return post(path, data);
}
