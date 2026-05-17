export const environment = {
  production: true,
  useMocks: false,
  // Using relative path for production so Nginx can proxy it to the backend container
  apiUrl: '/api'
};
