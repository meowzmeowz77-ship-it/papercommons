'use client';
import {useEffect} from 'react';
import {track} from '@/lib/analytics-client';
export function AnalyticsTracker(){useEffect(()=>{track('page_view')},[]);return null}
