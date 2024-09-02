import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
  @ApiProperty({
    description: 'The name of the product',
    example: 'Updated Product',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'The price of the product',
    example: 79.99,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({
    description: 'A brief description of the product',
    example: 'This is an updated product description.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'The quantity of the product in stock',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  quantity?: number;
}
