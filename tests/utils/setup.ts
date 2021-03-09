import { getConnection } from '.';

getConnection(true).then(() => process.exit());
