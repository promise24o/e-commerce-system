import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ApproveProductDto {
  @IsBoolean()
  @IsNotEmpty()
  isApproved: boolean;
}
