import { User } from '@prisma/client';
import { TFunction } from 'i18next';
import { SceneContext, WizardContext } from 'telegraf/typings/scenes';

export interface SceneState {
  packId?: string;
}

export interface UserContext extends SceneContext {
  user: User | null;
  language: 'en' | 'ru';
  t: TFunction;
  scene: SceneContext['scene'] & { state: SceneState };
}

export interface UserWizardContext extends WizardContext {
  user: User | null;
  language: 'en' | 'ru';
  t: TFunction;
}
