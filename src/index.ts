import { createBrowserHistory } from 'history';
import Parser from 'route-parser';
import {
  RouteDefinition,
  RouteParams,
  RouteData,
  OnChangeCallback,
  FilterFn,
  ParserConfig,
  RoutingLocation,
  RouterInstance,
} from './types';

function Router<NameType>(
  unknownRouteName: NameType,
  definitions: RouteDefinition<NameType>[],
) :RouterInstance<NameType> {
  const history = createBrowserHistory();
  const listeners: OnChangeCallback<NameType>[] = [];
  const parserConfigs = initParserConfigs(definitions);

  const findRoute = (pathname: string) :RouteData<NameType> => {
    for (const config of parserConfigs.values()) {
      const match = config.parser.match(pathname);
      if (match) {
        return {
          name: config.name,
          params: match,
          pathname: pathname,
        };
      }
    }
    return {
      name: unknownRouteName,
      params: {},
      pathname,
    };
  };

  const historyChangeCallback = (location: RoutingLocation) => {
    const finding = findRoute(location.pathname);
    service.currentContext = finding;
    listeners.forEach(callback => {
      callback(service.currentContext);
    });
  };

  const complexPatternMatches = (name: NameType|null, params: RouteParams) => {
    if ((name === null) || (service.currentContext.name === name)) {
      for (const [paramName, paramValue] of Object.entries(params)) {
        if (service.currentContext.params[paramName] !== paramValue) {
          return false;
        }
      }
      return true;
    }
    return false;
  };

  const matches = (positivMatchValue: boolean, patterns: (NameType|[NameType|null, RouteParams])[]) => {
    for (const pat of patterns) {
      if (isComplexMatcherPattern(pat)) {
        const [name, params] = pat as [NameType, RouteParams];
        if (complexPatternMatches(name, params)) {
          return positivMatchValue;
        }
      } else {
        const name = pat as NameType;
        if (name === service.currentContext.name) {
          return positivMatchValue;
        }
      }
    }
    return !positivMatchValue;
  };

  let service: RouterInstance<NameType> = {
    currentContext: {name: unknownRouteName, params: {}, pathname: ''},
    onChange: (callback: OnChangeCallback<NameType>) => {
      listeners.push(callback);
      return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) listeners.splice(index, 1);
      };
    },
    goTo: (name: NameType, params: RouteParams) => {
      let didMatch = false;
      for (const config of parserConfigs.values()) {
        if (name === config.name) {
          const pathname = config.parser.reverse(params);
          if (pathname) {
            const cr: RouteData<NameType> = {name: name, params: params, pathname};
            history.push(pathname, cr);
          } else {
            return new Error("Params don't fit to route definition");
          }
          didMatch = true;
          break;
        }
      }
      if (!didMatch) return new Error("Definition doesn't fit any previously configured");
    },
    backTo: (isHit: FilterFn<NameType>) => new Promise<RouteData<NameType>>((resolve) => {
      const removeListener = history.listen((location: RoutingLocation) => {
        const route = findRoute(location.pathname);
        if (isHit(route)) {
          removeListener();
          resolve(route);
        } else {
          history.goBack();
        }
      });
      history.goBack();
    }),
    matchesOne: (...patterns: (NameType|[NameType|null, RouteParams])[]) => {
      return matches(true, patterns);
    },
    matchesNone: (...patterns: (NameType|[NameType|null, RouteParams])[]) => {
      return matches(false, patterns);
    },
  };

  history.listen(historyChangeCallback);
  historyChangeCallback(history.location);

  return service;
};

function initParserConfigs<NameType>(definitions: RouteDefinition<NameType>[]) {
  const acc = new Map<NameType, ParserConfig<NameType>>();
  for (const def of definitions) {
    if (acc.has(def.name)) {
      throw new Error(`Routes must be unique, route "${def.name}" with spec "${def.spec}" cannot be redefined with another spec "${def.spec}"`);
    }
    acc.set(def.name, {name: def.name, parser: new Parser(def.spec)});
  }
  return acc;
}

function isComplexMatcherPattern<NameType>(pattern: NameType|[NameType, RouteParams]) {
  return (pattern instanceof Array) && (pattern.length === 2);
}

export * from './types';
export * from './hook';

export default Router;
