export interface IntegrationAdapter {
  readonly provider: string;
  isEnabled(): boolean;
}
