export type TokenObject = {
  sub: string;
  role: string;
  businessId: number | null;
  iat: number;
  exp: number;
};

export type UserForToken = {
  sub: string;
  role: string;
  businessId: number | null;
};
