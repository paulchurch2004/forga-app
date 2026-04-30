import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Platform } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

/**
 * Curated list of 10 short sports / extreme effort clips, looped at 1s each.
 * Source: Mixkit free stock video CDN — verified live (HTTP 206 streaming OK).
 * If any URL ever 404s, swap by browsing https://mixkit.co/free-stock-video/<keyword>/
 * and grabbing the 1080p MP4 link.
 */
const CLIPS: string[] = [
  // Boxing — heavy bag training
  'https://assets.mixkit.co/videos/40954/40954-1080.mp4',
  // Female workout / running on treadmill
  'https://assets.mixkit.co/videos/32809/32809-1080.mp4',
  // Boxing combat 2 — sparring
  'https://assets.mixkit.co/videos/40969/40969-1080.mp4',
  // Tennis serve
  'https://assets.mixkit.co/videos/869/869-1080.mp4',
  // Race car — circuit
  'https://assets.mixkit.co/videos/615/615-1080.mp4',
  // Skydive / parachute
  'https://assets.mixkit.co/videos/4052/4052-1080.mp4',
  // Athlete running / sprint outdoor
  'https://assets.mixkit.co/videos/606/606-1080.mp4',
  // Boxing 3 — gym training
  'https://assets.mixkit.co/videos/40962/40962-1080.mp4',
  // Tennis 2 — rally
  'https://assets.mixkit.co/videos/876/876-1080.mp4',
  // Workout / fitness moves
  'https://assets.mixkit.co/videos/608/608-1080.mp4',
];

const CLIP_DURATION_MS = 1500;
const CROSSFADE_MS = 350;

interface VideoMontageProps {
  /** Override the default clip list. Use file:// URIs for local bundled assets. */
  clips?: string[];
  /** Time each clip is on screen (ms). */
  clipDurationMs?: number;
}

export function VideoMontage({ clips = CLIPS, clipDurationMs = CLIP_DURATION_MS }: VideoMontageProps) {
  // Two players ping-pong: while one shows, the other preloads the next clip.
  const [activePlayer, setActivePlayer] = useState<'A' | 'B'>('A');
  const indexRef = useRef(0);
  const opacityA = useRef(new Animated.Value(1)).current;
  const opacityB = useRef(new Animated.Value(0)).current;

  const playerA = useVideoPlayer(clips[0] ?? null, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  const playerB = useVideoPlayer(clips[1] ?? null, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  useEffect(() => {
    if (clips.length === 0) return;
    const interval = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % clips.length;

      const willShow = activePlayer === 'A' ? 'B' : 'A';
      const offline = activePlayer;

      // The willShow player already has the right clip (preloaded last tick),
      // so we DO NOT replace its source here — that would force a re-buffer
      // and produce a black flash during the fade-in.

      // Crossfade first.
      Animated.parallel([
        Animated.timing(willShow === 'A' ? opacityA : opacityB, {
          toValue: 1, duration: CROSSFADE_MS, useNativeDriver: true,
        }),
        Animated.timing(offline === 'A' ? opacityA : opacityB, {
          toValue: 0, duration: CROSSFADE_MS, useNativeDriver: true,
        }),
      ]).start();

      setActivePlayer(willShow);

      // Once the old player is hidden, swap its source to the clip
      // it'll need to show next time it becomes visible (= 2 clips ahead).
      const futureUrl = clips[(indexRef.current + 1) % clips.length];
      setTimeout(() => {
        try {
          if (offline === 'A') playerA.replace(futureUrl);
          else playerB.replace(futureUrl);
        } catch { /* ignore */ }
      }, CROSSFADE_MS + 100);
    }, clipDurationMs);

    return () => clearInterval(interval);
    // We intentionally don't list `activePlayer` to keep the interval steady.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clips, clipDurationMs]);

  if (Platform.OS === 'web' || clips.length === 0) {
    // expo-video doesn't render on web in dev — return a transparent shell so
    // the surrounding card layout (brackets, timecode) keeps its dimensions.
    return <View style={StyleSheet.absoluteFill} />;
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: opacityA }]}>
        <VideoView
          player={playerA}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
        />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: opacityB }]}>
        <VideoView
          player={playerB}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
        />
      </Animated.View>
    </View>
  );
}
