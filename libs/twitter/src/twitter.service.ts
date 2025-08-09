import { Injectable, Logger } from '@nestjs/common';
import { TwitterApi, TwitterApiReadOnly } from 'twitter-api-v2';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Env } from '@app/config';
import { CacheableByArgs } from '@app/shared';

interface XUserLegacy {
  followers_count: number;
}

interface XUserResult {
  legacy: XUserLegacy;
}

interface XUserContainer {
  user: {
    result: XUserResult;
  };
}

interface UserByScreenNameResponse {
  data: XUserContainer;
}

@Injectable()
export class TwitterService {
  private twitterClient: TwitterApiReadOnly;
  private readonly logger = new Logger(TwitterService.name);
  constructor(private readonly configService: ConfigService<Env>) {
    this.twitterClient = new TwitterApi(
      this.configService.get('X_BEARER_TOKEN', { infer: true }),
    ).readOnly;
  }
  public async getMembers(username: string): Promise<number | undefined> {
    const user = await this.twitterClient.v2.userByUsername(username, {
      'user.fields': ['public_metrics'],
    });
    console.log(user.data.public_metrics);
    return user.data.public_metrics?.followers_count;
  }

  public async getMembersAsGuest(
    username: string,
  ): Promise<number | undefined> {
    try {
      const guestToken = await this.getGuestToken();
      const response = await axios.get<UserByScreenNameResponse>(
        'https://api.x.com/graphql/gEyDv8Fmv2BVTYIAf32nbA/UserByScreenName',
        {
          params: {
            variables: `{"screen_name":"${username.toLowerCase()}","withGrokTranslatedBio":false}`,
            features:
              '{"hidden_profile_subscriptions_enabled":true,"payments_enabled":false,"rweb_xchat_enabled":false,"profile_label_improvements_pcf_label_in_post_enabled":true,"rweb_tipjar_consumption_enabled":true,"verified_phone_label_enabled":false,"subscriptions_verification_info_is_identity_verified_enabled":true,"subscriptions_verification_info_verified_since_enabled":true,"highlights_tweets_tab_ui_enabled":true,"responsive_web_twitter_article_notes_tab_enabled":true,"subscriptions_feature_can_gift_premium":true,"creator_subscriptions_tweet_preview_api_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true}',
          },
          headers: {
            authorization:
              'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
            'content-type': 'application/json',
            origin: 'https://x.com',
            referer: 'https://x.com/',
            'user-agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            'x-client-transaction-id':
              'v3epehEDcQlZbWEOhcO2LfcEgDlXfhZ5vMMiYYGhgDs8ZiP6cqEj+PRb1Ozwj28FdE9t+bsM7xbJaCws9CEKqQ2B25IZvA',
            'x-guest-token': guestToken,
            'x-twitter-active-user': 'yes',
            'x-twitter-client-language': 'en',
            'x-xp-forwarded-for':
              '7aa562a37f35fee9166592d6fe52004b5ae46d013ec58dc15c44726024f64c111bc27f4ca6dae1ac23828a449d62fc15f7bfb7d54bad5805967c5c4d7ce3bbff279d43f131f73103e1b62ffc7e02e95c91124193a2dfb53cd1c23548b3488bd4b168a74c62e652365daa16b5b3b4995f0459cc717f259682d714c583eefe57b6d3d6ce92ecf26e24cda96d1136ac18d41574cfa21263cc14fb51ff4037bbc0481f34bc75f2d249ff85ec55ef64572e6a7d78de929d785fae5ebdb6fbc03fd64eafb725400c8285ee4814f308806aa052e4ae6cbddc5b4a4379118e7fe4ea0787d8fd4e4fa53d50961bdd4fcc88a5271a1dff08ae59da94fad00101d1a606e4a838',
            cookie:
              'guest_id_marketing=v1%3A175467478326415648; guest_id_ads=v1%3A175467478326415648; guest_id=v1%3A175467478326415648',
          },
        },
      );

      const followers =
        response.data?.data?.user?.result?.legacy?.followers_count;

      if (typeof followers === 'number') {
        return followers;
      }
      return undefined;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      return undefined;
    }
  }

  @CacheableByArgs({
    ttlSeconds: 60 * 30,
    keyBuilder: () => 'guest-token',
  })
  private async getGuestToken(): Promise<string | undefined> {
    this.logger.log('Getting new guest token');
    const response = await axios.get('https://x.com/elonmusk', {
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        priority: 'u=0, i',
        'sec-ch-ua':
          '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      },
    });
    if (!response.data || typeof response.data !== 'string') {
      throw new Error('Failed to get guest token');
    }
    const match = response.data.match(/document\.cookie\s*=\s*["']gt=([^;]+);/);
    if (match && match[1]) {
      return match[1];
    }
    throw new Error('Failed to get guest token');
  }
}
