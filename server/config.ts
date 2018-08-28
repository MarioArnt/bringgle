export default class Config {
	public static readonly protocole: string = 'http';
	public static readonly baseURI: string = 'localhost:8080';
	public static readonly port: PortConfig = {
		production: 8081,
		development: 8081,
		test: 8082
	};
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
	};
	public static readonly email: EmailConfig = {
		from: 'no-reply@bringgle.io'
	};
}

interface PortConfig {
	development: number;
	production: number;
	test: number;
	[key: string]: number;
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
