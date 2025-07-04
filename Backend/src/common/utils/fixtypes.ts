// src/fixtypes.ts
import { IsString, IsNumber, IsIn, ValidateNested, IsISO8601, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class FixHeader {
  @IsString()   msg_type!: string;
  @IsString()   sender_comp_id!: string;
  @IsString()   target_comp_id!: string;
  @IsNumber()   seq_num!: number;
  @IsISO8601()  timestamp!: string;
}

export class FixTrailer {
  @IsArray() @IsString({ each: true })
  public_key!: string[];

  @IsArray() @IsString({ each: true })
  signature!: string[];
}

// Body unions

export class NewIndexOrderBody {
  @IsString() client_order_id!: string;
  @IsString() symbol!: string;
  @IsIn(['1','2']) side!: string;
  @IsString() amount!: string;
}

export class NewQuoteRequestBody {
  @IsString() client_quote_id!: string;
  @IsString() symbol!: string;
  @IsIn(['1','2']) side!: string;
  @IsString() amount!: string;
}

export class AccountToCustodyBody { /* no fields */ }
export class CustodyToAccountBody { /* no fields */ }

// The master request
export class FixRequest {
  @ValidateNested() @Type(() => FixHeader)
  standard_header!: FixHeader;

  @IsNumber() chain_id!: number;
  @IsString() address!: string;

  // union: we’ll pick one based on msg_type
  @ValidateNested() body!: any;

  @ValidateNested() @Type(() => FixTrailer)
  standard_trailer!: FixTrailer;
}
