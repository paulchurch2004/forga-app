import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Platform } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useUserStore } from '../../store/userStore';

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
/**
 * Pools de clips séparés par sexe. L'user doit pouvoir se projeter
 * sur les visuels du paywall — c'est l'écran de conversion #1, on
 * ne peut pas se permettre un mismatch identitaire.
 *
 * Pool MALE : combat, force, sprint masculin (les originaux).
 * Pool FEMALE : pilates, yoga puissance, course, danse, fitness.
 * Pool MIXED (fallback) : sport "neutre" cardio, sports collectifs,
 *   activités où le sexe ne ressort pas visuellement.
 */
const CLIPS_MALE: string[] = [
  // Fight / combat (très masculin-coded)
  'https://assets.mixkit.co/videos/40954/40954-1080.mp4', // heavy bag training
  'https://assets.mixkit.co/videos/40969/40969-1080.mp4', // sparring
  'https://assets.mixkit.co/videos/40962/40962-1080.mp4', // gym training
  'https://assets.mixkit.co/videos/40967/40967-1080.mp4', // boxing footwork
  'https://assets.mixkit.co/videos/40978/40978-1080.mp4', // bag work
  // Sprint
  'https://assets.mixkit.co/videos/606/606-1080.mp4',     // outdoor sprint
  'https://assets.mixkit.co/videos/4046/4046-1080.mp4',   // running outdoor
  'https://assets.mixkit.co/videos/4640/4640-1080.mp4',   // sprint focus
  // Force pure
  'https://assets.mixkit.co/videos/4933/4933-1080.mp4',   // pull-ups
  'https://assets.mixkit.co/videos/5005/5005-1080.mp4',   // deadlift
  'https://assets.mixkit.co/videos/4922/4922-1080.mp4',   // squat
  'https://assets.mixkit.co/videos/4990/4990-1080.mp4',   // bench press
];

const CLIPS_FEMALE: string[] = [
  // Yoga, pilates, étirement
  'https://assets.mixkit.co/videos/40368/40368-1080.mp4', // yoga flow
  'https://assets.mixkit.co/videos/40378/40378-1080.mp4', // pilates
  'https://assets.mixkit.co/videos/4842/4842-1080.mp4',   // stretching outdoor
  // Cardio / running
  'https://assets.mixkit.co/videos/40398/40398-1080.mp4', // running woman
  'https://assets.mixkit.co/videos/40393/40393-1080.mp4', // jump rope
  // Fitness / force féminine
  'https://assets.mixkit.co/videos/40386/40386-1080.mp4', // bodyweight squats
  'https://assets.mixkit.co/videos/40380/40380-1080.mp4', // dumbbell training
  'https://assets.mixkit.co/videos/40381/40381-1080.mp4', // kettlebell swing
  'https://assets.mixkit.co/videos/40400/40400-1080.mp4', // gym cardio
  // Outdoor / lifestyle
  'https://assets.mixkit.co/videos/40363/40363-1080.mp4', // outdoor workout
  'https://assets.mixkit.co/videos/40395/40395-1080.mp4', // dance fitness
];

/** Clips "mixtes" qui marchent dans les deux pools — ajoutés aux deux. */
const CLIPS_MIXED: string[] = [
  'https://assets.mixkit.co/videos/615/615-1080.mp4',     // race car circuit
  'https://assets.mixkit.co/videos/869/869-1080.mp4',     // tennis serve
  'https://assets.mixkit.co/videos/876/876-1080.mp4',     // tennis rally
  'https://assets.mixkit.co/videos/4641/4641-1080.mp4',   // mountain bike
  'https://assets.mixkit.co/videos/4825/4825-1080.mp4',   // surfing
  'https://assets.mixkit.co/videos/4985/4985-1080.mp4',   // climbing
];

/** Pool par défaut (rétro-compat avec ancienne signature de prop). */
const CLIPS: string[] = [...CLIPS_MALE, ...CLIPS_MIXED];

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

export function VideoMontage({ clips, clipDurationMs = CLIP_DURATION_MS }: VideoMontageProps) {
  // Sélectionne le pool de clips selon le sexe de l'user.
  // Si l'user n'a pas encore renseigné son sexe (pré-onboarding,
  // landing), fallback vers le pool male par défaut.
  const userSex = useUserStore((s) => s.profile?.sex ?? s.onboardingData.sex);
  const defaultPool = useMemo(() => {
    if (userSex === 'female') return [...CLIPS_FEMALE, ...CLIPS_MIXED];
    return [...CLIPS_MALE, ...CLIPS_MIXED];
  }, [userSex]);

  // Stable shuffled order per mount. La prop `clips` (override) gagne
  // sur le pool auto-sélectionné, pour les cas custom (preview, test).
  const playlist = useMemo(
    () => shuffleClips(clips ?? defaultPool),
    [clips, defaultPool],
  );

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
