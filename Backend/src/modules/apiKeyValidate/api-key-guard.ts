import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DbService } from 'src/db/db.service';
import { apiKeysTable } from 'src/db/schema';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private dbService: DbService;
  constructor() {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API key is missing');
    }

    
    const db = this.dbService.getDb();
    const result = await db
      .select()
      .from(apiKeysTable)
      .where(eq(apiKeysTable.key, apiKey))
      .limit(1);

    if (result.length === 0) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
