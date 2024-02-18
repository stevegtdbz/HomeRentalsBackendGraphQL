import { GraphQLError } from 'graphql';

export const AuthenticationError = () => {
  return new GraphQLError("", {
    extensions: {
      code: 'UNAUTHENTICATED',
      http: { status: 401 },
    },
  });
};
