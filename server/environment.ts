const nodeEnv = String(process.env.NODE_ENV);

const databaseUrl = String(process.env.NEW_MONGO_URL);
const databaseSessionTable  = String(process.env.MONGO_SESSION_TABLE);
const databaseUserTable  = String(process.env.MONGO_USER_TABLE);
const databaseTagTable  = String(process.env.MONGO_TAG_TABLE);
const databasePostTable  = String(process.env.MONGO_POST_TABLE);
const databaseName  = String(process.env.MONGO_DB);

const port  = Number(process.env.PORT);

const sessionSecret  = String(process.env.SESSION_SECRET);

const bucketEndpointUrl  = String(process.env.ENDPOINT_URL);
const bucketCdnUrl  = String(process.env.CDN_URL);
const bucketName  = String(process.env.BUCKET);
const bucketKeyId  = String(process.env.BUCKET_KEY_ID);
const bucketAccessKey  = String(process.env.BUCKET_ACCESS_KEY);

const discordClientId  = String(process.env.DISCORD_CLIENT_ID);
const discordSecret  = String(process.env.DISCORD_SECRET);
const discordRedirectUrl  = String(process.env.DISCORD_REDIRECT_URL);

export {
	nodeEnv,
	databaseUrl,
	databaseSessionTable,
	databaseUserTable,
	databaseTagTable,
	databasePostTable,
	databaseName,
	port,
	sessionSecret,
	bucketEndpointUrl,
	bucketCdnUrl,
	bucketName,
	bucketKeyId,
	bucketAccessKey,
	discordClientId,
	discordSecret,
	discordRedirectUrl,
}