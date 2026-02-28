export class BaseIntegrationAdapter {
  constructor(provider) {
    this.provider = provider;
  }

  isEnabled() {
    return false;
  }
}
