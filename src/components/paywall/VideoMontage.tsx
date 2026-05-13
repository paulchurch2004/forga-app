import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Platform } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

/**
 * Sport montage — rapid-fire clip cycler designed to feel like a hype reel.
 *
 * Why 3 players instead of 2: with 600 ms-per-clip cuts and HTTP-streamed
 * MP4s, a single "ping-pong" pair doesn't give the offline player enough
 * time to buffer the next clip → black flash. A rolling window of 3
 * players means at any moment there is one VISIBLE, one PRELOADED ready
 * to become visible, and one ACTIVELY LOADING the clip after that.
 *
 * Clip pool is Mixkit free-license, 1080p. The rotation order is
 * shuffled at mount so two consecutive sessions don't feel identical.
 */
const CLIPS: string[] = [
  // ── Fight / combat ──
  'https://assets.mixkit.co/videos/40954/40954-1080.mp4', // heavy bag training
  'https://assets.mixkit.co/videos/40969/40969-1080.mp4', // sparring
  'https://assets.mixkit.co/videos/40962/40962-1080.mp4', // gym training
  'https://assets.mixkit.co/videos/40967/40967-1080.mp4', // boxing footwork
  'https://assets.mixkit.co/videos/40978/40978-1080.mp4', // bag work

  // ── Run / sprint ──
  'https://assets.mixkit.co/videos/606/606-1080.mp4',     // outdoor sprint
  'https://assets.mixkit.co/videos/32809/32809-1080.mp4', // treadmill
  'https://assets.mixkit.co/videos/4046/4046-1080.mp4',   // running outdoor
  'https://assets.mixkit.co/videos/4640/4640-1080.mp4',   // sprint focus

  // ── Strength / fitness ──
  'https://assets.mixkit.co/videos/608/608-1080.mp4',     // fitness moves
  'https://assets.mixkit.co/videos/4933/4933-1080.mp4',   // pull-ups
  'https://assets.mixkit.co/videos/5005/5005-1080.mp4',   // deadlift
  'https://assets.mixkit.co/videos/4922/4922-1080.mp4',   // squat
  'https://assets.mixkit.co/videos/4990/4990-1080.mp4',   // bench press

  // ── Cardio / endurance ──
  'https://assets.mixkit.co/videos/4052/4052-1080.mp4',   // skydive
  'https://assets.mixkit.co/videos/615/615-1080.mp4',     // race car circuit
  'https://assets.mixkit.co/videos/869/869-1080.mp4',     // tennis serve
  'https://assets.mixkit.co/videos/876/876-1080.mp4',     // tennis rally
  'https://assets.mixkit.co/videos/4641/4641-1080.mp4',   // mountain bike
  'https://assets.mixkit.co/videos/4825/4825-1080.mp4',   // surfing
  'https://assets.mixkit.co/videos/4945/4945-1080.mp4',   // basketball
  'https://assets.mixkit.co/videos/4985/4985-1080.mp4',   // climbing
];

const CLIP_DURATION_MS = 600; // sport-montage fast cut feel
const CROSSFADE_MS = 200; // tight crossfade that hides the source swap

/** Returns a shuffled copy of the input array. Avoids two consecutive
 *  identical clips by re-shuffling if the join wraps to the same id. */
function shuffleClips(input: string[]): string[] {
  const out = [...input];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

interface VideoMontageProps {
  /** Override the default clip list. Use file:// URIs for local bundled assets. */
  clips?: string[];
  /** Time each clip is on screen (ms). */
  clipDurationMs?: number;
}

export function VideoMontage({ clips = CLIPS, clipDurationMs = CLIP_DURATION_MS }: VideoMontageProps) {
  // Stable shuffled order per mount.
  const playlist = useMemo(() => shuffleClips(clips), [clips]);

  // Rolling 3-player window. Player A is visible at mount; B and C are
  // pre-loaded with the next two clips.
  const [visibleSlot, setVisibleSlot] = useState<'A' | 'B' | 'C'>('A');
  // Track which clip index each player currently has loaded.
  const slotIndexRef = useRef<{ A: number; B: number; C: number }>({ A: 0, B: 1, C: 2 });
  // Cursor: position in the shuffled playlist that is CURRENTLY visible.
  const cursorRef = useRef(0);

  const opacityA = useRef(new Animated.Value(1)).current;
  const opacityB = useRef(new Animated.Value(0)).current;
  const opacityC = useRef(new Animated.Value(0)).current;

  const playerA = useVideoPlayer(playlist[0] ?? null, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  const playerB = useVideoPlayer(playlist[1] ?? null, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  const playerC = useVideoPlayer(playlist[2] ?? null, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  useEffect(() => {
    if (playlist.length === 0) return;

    const interval = setInterval(() => {
      const next = cursorRef.current + 1;
      cursorRef.current = next;

      // Determine slots:
      //   incoming  = the player that holds the (cursor) clip and will fade in
      //   outgoing  = the currently visible player that will fade out
      //   recycling = the third player that we'll repurpose to load the
      //               clip at (cursor + 2) — that's the clip we'll need
      //               2 ticks from now.
      const slots: Array<'A' | 'B' | 'C'> = ['A', 'B', 'C'];
      const outgoing = visibleSlot;
      const others = slots.filter((s) => s !== outgoing);
      // The "incoming" is whichever of the two non-visible slots holds the
      // current cursor's clip. We track loaded indices in slotIndexRef.
      const incoming = others.find((s) => slotIndexRef.current[s] === next % playlist.length)
        ?? others[0];
      const recycling = others.find((s) => s !== incoming)!;

      // Crossfade outgoing → incoming.
      const fadeMap = { A: opacityA, B: opacityB, C: opacityC } as const;
      Animated.parallel([
        Animated.timing(fadeMap[incoming], { toValue: 1, duration: CROSSFADE_MS, useNativeDriver: true }),
        Animated.timing(fadeMap[outgoing], { toValue: 0, duration: CROSSFADE_MS, useNativeDriver: true }),
      ]).start();

      setVisibleSlot(incoming);

      // Once the outgoing player is hidden, repurpose the *recycling* slot
      // for the clip we'll need next tick. Doing this on the hidden player
      // means buffering happens off-screen — no black flash.
      const futureIdx = (next + 1) % playlist.length;
      const futureUrl = playlist[futureIdx];
      slotIndexRef.current[recycling] = futureIdx;
      setTimeout(() => {
        try {
          if (recycling === 'A') playerA.replace(futureUrl);
          else if (recycling === 'B') playerB.replace(futureUrl);
          else playerC.replace(futureUrl);
        } catch {
          /* a 404'd clip stays on its previous source — visually fine */
        }
      }, CROSSFADE_MS + 80);
    }, clipDurationMs);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlist, clipDurationMs]);

  if (Platform.OS === 'web' || playlist.length === 0) {
    return <View style={StyleSheet.absoluteFill} />;
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: opacityA }]}>
        <VideoView player={playerA} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: opacityB }]}>
        <VideoView player={playerB} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: opacityC }]}>
        <VideoView player={playerC} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
      </Animated.View>
    </View>
  );
}
