import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  @ApiProperty({
    description: 'The name of the product.',
    example: 'Sample Product',
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    description: 'The price of the product.',
    example: 10.00,
  })
  @Prop({ required: true })
  price: number;

  @ApiProperty({
    description: 'A brief description of the product.',
    example: 'This is a sample product description.',
    required: false,
  })
  @Prop()
  description?: string;

  @ApiProperty({
    description: 'The quantity of the product in stock.',
    example: 100,
  })
  @Prop({ required: true })
  quantity: number;

  @ApiProperty({
    description: 'Indicates whether the product is approved.',
    example: false,
  })
  @Prop({ default: false })
  isApproved: boolean;

  @ApiProperty({
    description: 'The ID of the user who owns the product.',
    example: '64c3a7f913b6e1b6313e2d7f',
  })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  ownerId: MongooseSchema.Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
