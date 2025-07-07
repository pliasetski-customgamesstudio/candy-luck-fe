export abstract class ISessionHolder {
  abstract get userId(): string | null;
  abstract get sessionToken(): string;
}
