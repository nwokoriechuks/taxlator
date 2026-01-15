export type SignUpPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type SignInPayload = {
  email: string;
  password: string;
};

// Upstream responses vary; keep flexible
export type AnyJson = Record<string, any>;
