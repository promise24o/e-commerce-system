import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ApproveProductDto {
  @ApiProperty({
    description: 'Indicates whether the product is approved or not',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isApproved: boolean;
}
