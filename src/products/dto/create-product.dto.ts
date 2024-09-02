import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'The name of the product',
    example: 'Sample Product',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The price of the product',
    example: 99.99,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'A brief description of the product',
    example: 'This is a sample product.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'The quantity of the product in stock',
    example: 10,
  })
  @IsNumber()
  quantity: number;
}