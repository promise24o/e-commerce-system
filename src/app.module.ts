import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "./auth/auth.module";
import { ProductsModule } from "./products/products.module";
import { UsersModule } from "./users/users.module";
import { AdminController } from './admin/admin.controller';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    MongooseModule.forRoot(process.env.DATABASE_URL),
    AdminModule,
  ],
  controllers: [AdminController],
  providers: [],
})
export class AppModule {}
