//@flow

import type {Domain, DomainHooks} from './index.h'
import type {Store} from 'effector/store'
import {type Event, eventFabric} from 'effector/event'
import type {Effect} from 'effector/effect'
import type {CompositeName} from '../compositeName'
export class DomainHistory {
  /*::;+*/ events: Set<Event<any>> = new Set()
  /*::;+*/ effects: Set<Effect<any, any, any>> = new Set()
  /*::;+*/ storages: Set<Store<any>> = new Set()
  /*::;+*/ domains: Set<Domain> = new Set()
}

export function domainHooks(
  history: DomainHistory,
  compositeName: CompositeName,
  parentHooks?: DomainHooks,
) {
  let hooks: {
    domain: Event<Domain>,
    effect: Event<Effect<any, any, any>>,
    event: Event<Event<any>>,
    store: Event<any>,
  }
  if (parentHooks) {
    hooks = childDomainHooks(parentHooks)
  } else {
    hooks = singleDomainHooks(compositeName)
  }
  hooks.domain.watch(domain => {
    history.domains.add(domain)
  })
  hooks.event.watch(event => {
    history.events.add(event)
  })
  hooks.store.watch(store => {
    history.storages.add(store)
  })
  hooks.effect.watch(effect => {
    history.effects.add(effect)
  })
  return hooks
}

const singleDomainHooks = (compositeName: CompositeName) => {
  const event: Event<Event<any>> = eventFabric({
    name: `${compositeName.fullName} event hook`,
    parent: compositeName,
  })
  const effect: Event<Effect<any, any, any>> = eventFabric({
    name: `${compositeName.fullName} effect hook`,
    parent: compositeName,
  })
  const store: Event<Store<any>> = eventFabric({
    name: `${compositeName.fullName} store hook`,
    parent: compositeName,
  })
  const domain: Event<Domain> = eventFabric({
    parent: compositeName,
  })
  return {event, effect, store, domain}
}

const childDomainHooks = (parentHooks: DomainHooks) => {
  const event: Event<Event<any>> = parentHooks.event.prepend(_ => _)
  const effect: Event<Effect<any, any, any>> = parentHooks.effect.prepend(
    _ => _,
  )
  const store: Event<Store<any>> = parentHooks.store.prepend(_ => _)
  const domain: Event<Domain> = parentHooks.domain.prepend(_ => _)
  return {event, effect, store, domain}
}
