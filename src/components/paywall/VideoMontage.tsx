import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Platform } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

/**
 * Curated list of short sports / extreme effort clips, looped at 1s each.
 * Mix of men + women in training, base jump, boxing, F1, tennis.
 *
 * Sources: Pexels free stock video CDN (no auth required).
 * If any URL 404s, swap it from https://www.pexels.com/search/videos/<keyword>/
 * by clicking a video and copying its "Free Download" MP4 link.
 */
const CLIPS: string[] = [
  // Male workout — heavy lifting
  'https://videos.pexels.com/video-files/4754155/4754155-hd_1080_1920_30fps.mp4',
  // Female workout — push-ups / functional
  'https://videos.pexels.com/video-files/4761711/4761711-hd_1080_1920_30fps.mp4',
  // Boxing
  'https://videos.pexels.com/video-files/4045334/4045334-hd_1080_1920_30fps.mp4',
  // Formula 1 / race car
  'https://videos.pexels.com/video-files/1409899/1409899-hd_1920_1080_24fps.mp4',
  // Tennis
  'https://videos.pexels.com/video-files/5275061/5275061-hd_1920_1080_25fps.mp4',
  // Base jump / skydive
  'https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_30fps.mp4',
  // Female athlete running
  'https://videos.pexels.com/video-files/4754059/4754059-hd_1080_1920_30fps.mp4',
  // Male bodyweight / pull-ups
  'https://videos.pexels.com/video-files/4761350/4761350-hd_1080_1920_30fps.mp4',
  // Sport car drift
  'https://videos.pexels.com/video-files/855971/855971-hd_1920_1080_24fps.mp4',
  // Boxing female
  'https://videos.pexels.com/video-files/4623891/4623891-hd_1080_1920_30fps.mp4',
];

const CLIP_DURATION_MS = 1000;
const CROSSFADE_MS = 180;

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
      const nextUrl = clips[indexRef.current];

      const willShow = activePlayer === 'A' ? 'B' : 'A';
      const offline = activePlayer; // the one we'll fade out

      // Tell the about-to-show player its source (was the next-next clip)
      // and let it pre-buffer briefly before swapping. We just point it at
      // the url two ahead so the rotation stays seamless.
      try {
        const nextNextUrl = clips[(indexRef.current + 1) % clips.length];
        if (willShow === 'B') {
          playerB.replace(nextUrl);
        } else {
          playerA.replace(nextUrl);
        }
        // Pre-warm the about-to-be-hidden player with the clip after next
        setTimeout(() => {
          try {
            if (offline === 'A') playerA.replace(nextNextUrl);
            else playerB.replace(nextNextUrl);
          } catch { /* ignore */ }
        }, CROSSFADE_MS + 50);
      } catch {
        /* swap source can fail mid-transition, ignore */
      }

      // Crossfade
      Animated.parallel([
        Animated.timing(willShow === 'A' ? opacityA : opacityB, {
          toValue: 1, duration: CROSSFADE_MS, useNativeDriver: true,
        }),
        Animated.timing(offline === 'A' ? opacityA : opacityB, {
          toValue: 0, duration: CROSSFADE_MS, useNativeDriver: true,
        }),
      ]).start();

      setActivePlayer(willShow);
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
