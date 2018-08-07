export default class Config {
  public static readonly baseURI: string = 'http://localhost:8080/'
  public static readonly database: DatabasesConfig = {
    development: {
      host: 'localhost',
      port: 27017,
      name: 'bringgle'
    },
    production: {
      host: 'localhost',
      port: 27017,
      name: 'bringgle'
    },
    test: {
      host: 'localhost',
      port: 27017,
      name: 'bringgle-test'
    }
  }
  public static readonly email: EmailConfig = {
    from: 'no-reply@bringgle.io'
  }
}

interface EmailConfig {
  from: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
}

interface DatabasesConfig {
  development: DatabaseConfig;
  production: DatabaseConfig;
  test: DatabaseConfig;
  [key: string]: DatabaseConfig;
}
