import { createProxyForType, getProxyByType, isProxyType, isTypeBlacklisted } from './proxies';
import {
  getComponentDisplayName,
  isCompositeComponent,
  isContextType,
  isForwardType,
  isLazyType,
  isMemoType,
} from '../internal/reactUtils';
import configuration, { internalConfiguration } from '../configuration';

const shouldNotPatchComponent = type => isTypeBlacklisted(type);

export function resolveType(type, options = {}) {
  const element = { type };
  if (isLazyType(element) || isMemoType(element) || isForwardType(element) || isContextType(element)) {
    return getProxyByType(type) || type;
  }

  if (!isCompositeComponent(type) || isProxyType(type)) {
    return type;
  }

  const existingProxy = getProxyByType(type);

  if (shouldNotPatchComponent(type)) {
    return existingProxy ? existingProxy.getCurrent() : type;
  }

  if (!existingProxy && configuration.onComponentCreate) {
    configuration.onComponentCreate(type, getComponentDisplayName(type));
    if (shouldNotPatchComponent(type)) return type;
  }

  const proxy = internalConfiguration.disableProxyCreation ? existingProxy : createProxyForType(type, options);

  return proxy ? proxy.get() : type;
}
