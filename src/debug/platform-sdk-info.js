/**
 * Collects Wildlife platform SDK data for the debug System tab.
 * Each method returns a Promise<string> that resolves to the display
 * value, or "err: <message>" on failure.
 */

import { Platform } from '@wildlife/platform-capacitor';

async function safe(fn) {
  try {
    const v = await fn();
    if (v === null || v === undefined) return 'null';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  } catch (e) {
    return `err: ${e?.message ?? e}`;
  }
}

export async function collectPlatformSdkInfo() {
  const P = Platform();

  const sections = {
    'Wildlife SDK': {
      'Platform Version': await safe(() => P.getPlatformVersion()),
      'Native SDK Version': await safe(() => P.getNativeSdkVersion()),
      'Capacitor Plugin Version': P.pluginVersion,
      'Initialized': String(P.isInitialized),
    },
    'Wildlife Device Info': {
      'getDeviceName': await safe(() => P.deviceInfoGetDeviceName()),
      'getDeviceModel': await safe(() => P.deviceInfoGetDeviceModel()),
      'getDeviceLanguage': await safe(() => P.deviceInfoGetDeviceLanguage()),
      'getDeviceRegion': await safe(() => P.deviceInfoGetDeviceRegion()),
      'getDeviceTimezone': await safe(() => P.deviceInfoGetDeviceTimezone()),
      'getDeviceSystemVersion': await safe(() => P.deviceInfoGetDeviceSystemVersion()),
      'getAppBundle': await safe(() => P.deviceInfoGetAppBundle()),
      'getAppVersion': await safe(() => P.deviceInfoGetAppVersion()),
      'getAppBuildNumber': await safe(() => P.deviceInfoGetAppBuildNumber()),
    },
    'Wildlife Identification': {
      'getDeviceId': await safe(() => P.getDeviceId()),
      'getFirstInstall': await safe(() => P.getFirstInstall()),
      'getCurrentInstall': await safe(() => P.getCurrentInstall()),
    },
    'Tracking Transparency': {
      'getAdvertisementId': await safe(() => P.trackingTransparencyGetAdvertisementId()),
    },
  };

  if (P.isInitialized) {
    sections['Wildlife Analytics'] = {
      'isFirstSession': await safe(() => P.analyticsIsFirstSession),
      'isReinstall': await safe(() => P.analyticsIsReinstall),
      'numSessions': await safe(() => P.analyticsNumSessions),
      'firstInstallId': await safe(() => P.analyticsFirstInstallId),
      'firstInstallAppVersion': await safe(() => P.analyticsFirstInstallAppVersion),
      'activationDate': await safe(() => P.analyticsActivationDate),
    };
  } else {
    sections['Wildlife Analytics'] = {
      status: 'skipped — Platform().initialize() not called',
    };
  }

  return sections;
}

/** Fire an analytics smoke event. Returns "sent ..." or "err: ...". */
export async function sendAnalyticsSmokeEvent() {
  try {
    const P = Platform();
    if (!P.isInitialized) return 'skipped — not initialized';
    const eventType = 'debug_smoke_test';
    const params = {
      source: 'debug-panel',
      timestamp: String(Date.now()),
    };
    await P.analyticsSendEvent(eventType, params);
    return `sent → ${eventType}`;
  } catch (e) {
    return `err: ${e?.message ?? e}`;
  }
}

/** Fire a Singular smoke event + revenue. Returns "sent" or "err: ...". */
export async function sendSingularSmokeEvents() {
  try {
    const P = Platform();
    if (!P.isInitialized) return 'skipped — not initialized';
    await P.singularService.trackEvent('smoke_test_event', {
      source: 'debug-panel',
      timestamp: Date.now(),
    });
    await P.singularService.trackRevenue('smoke_test_revenue', 'USD', 0.99, {
      productId: 'smoke_sku',
    });
    return 'sent → sdk-api-v1.singular.net';
  } catch (e) {
    return `err: ${e?.message ?? e}`;
  }
}
