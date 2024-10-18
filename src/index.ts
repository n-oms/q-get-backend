import { app } from './app';
import { APP_CONSTANTS } from './libs/constants/common';
import { MongoDbClient } from './libs/services/mongo/client';

const PORT = process.env.PORT || 8000 

app.listen(PORT, async () => {
    console.log(`${APP_CONSTANTS.APP_NAME}:${APP_CONSTANTS.APP_VERSION} started on port ${PORT}`);
    console.log(`Environment: ${APP_CONSTANTS.NODE_ENV}`);
    console.log("Establishing database connection...");
    await MongoDbClient.initiazeConnect();
    console.log("Database connection established");
});

