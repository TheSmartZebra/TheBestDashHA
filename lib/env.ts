function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Missing required env var ${name}. Copy .env.example to .env and fill it in.`
    );
  }
  return v;
}

export const env = {
  get haUrl() {
    return required("HA_URL").replace(/\/+$/, "");
  },
  get haToken() {
    return required("HA_TOKEN");
  },
  get sessionSecret() {
    return required("APP_SESSION_SECRET");
  },
  get appPassword() {
    return required("APP_PASSWORD");
  },
  get port() {
    return Number(process.env.PORT ?? 3000);
  }
};
