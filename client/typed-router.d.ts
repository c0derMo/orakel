/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
// Generated by unplugin-vue-router. ‼️ DO NOT MODIFY THIS FILE ‼️
// It's recommended to commit this file.
// Make sure to add this file to your tsconfig.json file as an "includes" or "files" entry.

declare module 'vue-router/auto-routes' {
  import type {
    RouteRecordInfo,
    ParamValue,
    ParamValueOneOrMore,
    ParamValueZeroOrMore,
    ParamValueZeroOrOne,
  } from 'vue-router'

  /**
   * Route name map generated by unplugin-vue-router
   */
  export interface RouteNamedMap {
    '/': RouteRecordInfo<'/', '/', Record<never, never>, Record<never, never>>,
    '/login': RouteRecordInfo<'/login', '/login', Record<never, never>, Record<never, never>>,
    '/manage/[tournament]': RouteRecordInfo<'/manage/[tournament]', '/manage/:tournament', { tournament: ParamValue<true> }, { tournament: ParamValue<false> }>,
    '/manage/[tournament]/': RouteRecordInfo<'/manage/[tournament]/', '/manage/:tournament', { tournament: ParamValue<true> }, { tournament: ParamValue<false> }>,
    '/manage/[tournament]/matches': RouteRecordInfo<'/manage/[tournament]/matches', '/manage/:tournament/matches', { tournament: ParamValue<true> }, { tournament: ParamValue<false> }>,
    '/manage/[tournament]/participants': RouteRecordInfo<'/manage/[tournament]/participants', '/manage/:tournament/participants', { tournament: ParamValue<true> }, { tournament: ParamValue<false> }>,
    '/manage/[tournament]/stages/[stageNumber]': RouteRecordInfo<'/manage/[tournament]/stages/[stageNumber]', '/manage/:tournament/stages/:stageNumber', { tournament: ParamValue<true>, stageNumber: ParamValue<true> }, { tournament: ParamValue<false>, stageNumber: ParamValue<false> }>,
    '/manage/[tournament]/stages/new': RouteRecordInfo<'/manage/[tournament]/stages/new', '/manage/:tournament/stages/new', { tournament: ParamValue<true> }, { tournament: ParamValue<false> }>,
    '/tournaments/[tournament]': RouteRecordInfo<'/tournaments/[tournament]', '/tournaments/:tournament', { tournament: ParamValue<true> }, { tournament: ParamValue<false> }>,
    '/tournaments/browse': RouteRecordInfo<'/tournaments/browse', '/tournaments/browse', Record<never, never>, Record<never, never>>,
    '/tournaments/create': RouteRecordInfo<'/tournaments/create', '/tournaments/create', Record<never, never>, Record<never, never>>,
  }
}
