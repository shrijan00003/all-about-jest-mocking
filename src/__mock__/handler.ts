export const mockPost = jest.fn();
const AxiosMock = jest.fn().mockImplementation(() => {
  return {
    post: mockPost,
  };
});

// const axiosMock = jest.mock("axios", () => {
//   return {
//     Axios: jest.fn().mockImplementation(() => {
//       return {
//         post: mockPost,
//       };
//     }),
//   };
// });

// const axiosMock = jest.fn().mockImplementation(() => {
//   return {
//     Axios: jest.fn().mockImplementation(() => {
//       return {
//         post: mockPost,
//       };
//     }),
//   };
// });

export default AxiosMock;
