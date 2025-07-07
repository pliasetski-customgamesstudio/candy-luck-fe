import { IterateExecutor } from './iterate_executor';
import { ConfigConstants } from '../../configuration/config_constants';
import { IMessageContext } from '../i_message_context';
import { SceneObject } from '@cgs/syd';
import { CancellationToken } from '../../../future/cancellation_token';
import { TutorialComponent } from '../../components/tutorial_component';

export class TutorialExecutor extends IterateExecutor {
  constructor(tutorialName: string, tutorialState: string, delay: string) {
    super({
      [ConfigConstants.tutorialName]: tutorialName,
      [ConfigConstants.tutorialState]: tutorialState,
      [ConfigConstants.tutorialDelay]: delay,
    });
  }

  static fromJson(json: any): TutorialExecutor {
    return new TutorialExecutor(
      json[ConfigConstants.tutorialName],
      json[ConfigConstants.tutorialState],
      json[ConfigConstants.tutorialDelay]
    );
  }

  async iteratePlay(
    context: IMessageContext,
    paramsList: Record<string, string>,
    roots: SceneObject[],
    token: CancellationToken
  ): Promise<void> {
    const tutorial = paramsList[ConfigConstants.tutorialName]
      ? context.message?.getValue(paramsList[ConfigConstants.tutorialName])
      : context.message?.getValue(TutorialComponent.tutorialKey);

    switch (paramsList[ConfigConstants.tutorialState]) {
      case ConfigConstants.tutorialStart:
        tutorial.start(token);
        break;
      case ConfigConstants.tutorialStop:
        tutorial.stop(token);
        break;
      case ConfigConstants.tutorialRestart:
        tutorial.restart(token);
        break;
    }

    return Promise.resolve();
  }
}
