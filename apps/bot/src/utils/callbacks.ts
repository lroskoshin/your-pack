import { Context } from 'telegraf';

export const ensureCbData = async (ctx: Context): Promise<string> => {
  if (
    (await ctx.answerCbQuery()) &&
    'match' in ctx &&
    Array.isArray(ctx.match)
  ) {
    return (ctx.match as RegExpMatchArray)[1];
  } else {
    throw new Error('Callback data not found');
  }
};
