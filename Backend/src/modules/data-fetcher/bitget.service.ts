import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { DbService } from "src/db/db.service";

@Injectable()
export class BitgetService {
  private readonly logger = new Logger(BitgetService.name);
  private readonly apiUrl =
    'https://data-api.binance.vision/api/v3/exchangeInfo';

  constructor(
    private httpService: HttpService,
    private dbService: DbService,
  ) {}
}
