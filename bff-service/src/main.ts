import { NestFactory } from "@nestjs/core";
import * as dotenv from "dotenv";
import * as helmet from "helmet";
import { AppModule } from "./app.module";

dotenv.config();

const port = process.env.PORT || 3001;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (req, callback) => callback(null, true)
  });
  app.use(helmet());

  await app.listen(port);
}
bootstrap().then(() => {
  console.log("App is running on %s port", port);
});
