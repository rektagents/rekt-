'use client';

import { useEffect, useRef } from 'react';
import { useAlerts } from '@/hooks/useAlerts';
import { useCurrency } from '@/context/CurrencyContext';

export function AlertChecker() {
  const { currency } = useCurrency();
  const { alerts, markTriggered } = useAlerts(currency);
  const hasRequestedPermission = useRef(false);

  // Request notification permission on mount
  useEffect(() => {
    if (!hasRequestedPermission.current && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
      hasRequestedPermission.current = true;
    }
  }, []);

  // Check for triggered alerts
  useEffect(() => {
    alerts.forEach((alert) => {
      if (alert.shouldTrigger) {
        markTriggered(alert.id);

        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`${alert.coinName} Price Alert`, {
            body: `${alert.coinName} is now ${alert.condition === 'above' ? 'above' : 'below'} $${alert.targetPrice}`,
            icon: alert.coinImage,
          });
        }
      }
    });
  }, [alerts, markTriggered]);

  return null;
}
