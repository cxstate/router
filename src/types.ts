import Parser from 'route-parser';

export interface RouteDefinition<NameType> {
  name: NameType
  spec: string
}

export interface UseRouterConfig<NameType> {
  unknownRouteName: NameType
  definitions: RouteDefinition<NameType>[]
}

export type RouteParams = {[key: string]: string};

export interface RouteData<NameType> {
  name: NameType
  params: RouteParams
  pathname: string
}

export type OnChangeCallback<NameType> = (current: RouteData<NameType>) => void;

export type FilterFn<NameType> = (current: RouteData<NameType>) => boolean;

export interface ParserConfig<NameType> {
  name: NameType
  parser: Parser
}

export interface RoutingLocation {
  pathname: string
}

export type MatcherFn<NameType> = (...patterns: (NameType|[NameType|null, RouteParams])[]) => boolean

export interface RouterInstance<NameType> {
  currentContext: RouteData<NameType>
  onChange: (callback: OnChangeCallback<NameType>) => () => void
  goTo: (name: NameType, params: RouteParams) => Error|undefined
  backTo: (isHit: FilterFn<NameType>) => Promise<RouteData<NameType>|null>
  matchesOne: MatcherFn<NameType>
  matchesNone: MatcherFn<NameType>
}

export interface CurrentRoute<NameType> {
  context: RouteData<NameType>
  goTo: (name: NameType, params: RouteParams) => Error|undefined
  backTo: (isHit: FilterFn<NameType>) => Promise<RouteData<NameType>|null>
  matchesOne: MatcherFn<NameType>
  matchesNone: MatcherFn<NameType>
}
