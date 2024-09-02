import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class User extends Document {
  @ApiProperty({
    description: "The name of the user.",
    example: "John Doe",
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    description: "The email address of the user. It must be unique.",
    example: "john.doe@example.com",
  })
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @ApiProperty({
    description: 'The role assigned to the user. Default is "user".',
    example: "admin",
  })
  @Prop({ default: "user" })
  role: string;

  @ApiProperty({
    description: "Indicates whether the user is banned.",
    example: false,
  })
  @Prop({ default: false })
  isBanned: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
