import api from './api';
import config from '../../config.json';
import messages from './messages';

export interface MessageEntity {
  offset: number;
  length: number;
  type: string;
}

export function createWebhookUrl(): string {
  return `${config.domain}${config.bot.webhookPath}/${config.bot.token}`;
}

export async function isBotInitialised(): Promise<boolean> {
  const {
    result: { url },
  } = await api.getWebhookInfo();
  return Boolean(url === createWebhookUrl());
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export async function isAuthorized(from: any, text: string): Promise<boolean> {
  const { id, first_name: firstName, is_bot: isBot } = from;
  if (id !== Number(config.bot.chatId)) {
    api.sendMessage(messages.common.unauthorized, id);
    api.sendMessage(messages.common.unauthorizedAlert(id, firstName, isBot, text));
    return false;
  }
  return true;
}

export function getCommandFromText(text: string, entities: MessageEntity[]): string | undefined {
  const [entity] = entities;
  return entity && entity.type === 'bot_command' ? text.substr(entity.offset + 1, entity.length - 1) : undefined;
}

export function isValidAlias(alias: string): boolean {
  const aliasRegex = /^[\w-.]+$/;
  return aliasRegex.test(alias);
}

export function isValidUrl(url: string): boolean {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}

export function chunkify(array: string[], size: number): string[][] {
  return Array(Math.ceil(array.length / size))
    .fill(undefined)
    .map((_, index) => index * size)
    .map(begin => array.slice(begin, begin + size));
}
