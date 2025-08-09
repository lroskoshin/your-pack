import { Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

export interface CacheableByArgsOptions<TArgs extends unknown[] = unknown[]> {
  ttlSeconds?: number;
  keyBuilder: (input: {
    className: string;
    methodName: string;
    args: TArgs;
    instance: unknown;
  }) => string;
  cacheUndefined?: boolean;
}

const DEFAULT_TTL_SECONDS = 60 as const;
const logger = new Logger('CacheableByArgs');

export function CacheableByArgs<
  TArgs extends unknown[] = unknown[],
  TResult = unknown,
>(options: CacheableByArgsOptions<TArgs>) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): void {
    const methodCandidate: unknown = descriptor.value as unknown;
    if (typeof methodCandidate !== 'function') {
      throw new Error(
        `@CacheableByArgs can only be applied to methods. Received ${typeof methodCandidate} on ${String(propertyKey)}.`,
      );
    }
    const originalMethod = methodCandidate as (
      ...args: TArgs
    ) => Promise<TResult> | TResult;

    if (!options || typeof options.keyBuilder !== 'function') {
      throw new Error(
        `@CacheableByArgs requires a keyBuilder function. Fix on method ${String(propertyKey)}.`,
      );
    }

    // Provide cache manager on instance
    Inject(CACHE_MANAGER)(target as object, 'cacheManager');

    descriptor.value = async function (...args: TArgs): Promise<TResult> {
      const cacheManager: Cache | undefined = (this as { cacheManager?: Cache })
        .cacheManager;
      if (!cacheManager) {
        logger.error(
          `Cache manager not available on ${(this as { constructor?: { name?: string } }).constructor?.name ?? 'UnknownClass'}. ` +
            'Ensure CacheModule (or equivalent) is imported.',
        );
        throw new Error(
          `Cache manager not available on ${(this as { constructor?: { name?: string } }).constructor?.name ?? 'UnknownClass'}. ` +
            'Ensure CacheModule (or equivalent) is imported.',
        );
      }

      const className =
        (this as { constructor?: { name?: string } })?.constructor?.name ??
        'UnknownClass';

      const key = options.keyBuilder({
        className,
        methodName: propertyKey,
        args: args,
        instance: this,
      });

      const cached: TResult | undefined = await cacheManager.get<TResult>(key);
      if (cached !== undefined) {
        logger.log(`Cache hit for ${key}`);
        return cached;
      }

      logger.log(`Cache miss for ${key}`);

      const maybePromise = originalMethod.apply(this, args) as
        | TResult
        | Promise<TResult>;
      const result: TResult = await Promise.resolve(maybePromise);

      if (
        result === (undefined as unknown as TResult) &&
        options.cacheUndefined !== true
      ) {
        return result;
      }

      const ttlMs = (options.ttlSeconds ?? DEFAULT_TTL_SECONDS) * 1000;
      await cacheManager.set(key, result as unknown, ttlMs);
      logger.log(`Cache set for ${key}`);
      return result;
    };
  };
}
