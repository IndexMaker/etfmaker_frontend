import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateDepositTransactionDto {
  @IsString() txHash: string;
  @IsNumber() blockNumber: number;
  @IsNumber() logIndex: number;

  @IsString() eventType: string; // e.g. "mint"
  @IsString() contractAddress: string;
  @IsString() network: string;

  @IsOptional() @IsString() userAddress?: string;
  @IsOptional() @IsNumber() amount?: number;
  @IsOptional() @IsNumber() quantity?: number;
}
