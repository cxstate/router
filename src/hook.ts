import { useEffect, useState } from 'react';
import Router from '.';
import {
  UseRouterConfig,
  RouteData,
  RouterInstance,
  CurrentRoute,
} from './types';

export function useRouter<NameType>(config: UseRouterConfig<NameType>) :CurrentRoute<NameType> {
  const [router] = useState<RouterInstance<NameType>>(
    () => Router<NameType>(config.unknownRouteName, config.definitions),
  );
  const [context, setContext] = useState<RouteData<NameType>>(router.currentContext);
  useEffect(() => router.onChange(setContext), [router, setContext]);
  return {
    context,
    goTo: router.goTo,
    backTo: router.backTo,
    matchesOne: router.matchesOne,
    matchesNone: router.matchesNone,
  };
}
