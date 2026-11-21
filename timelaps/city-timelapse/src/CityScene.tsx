import React, { useMemo, useRef } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import type { Building, Bounds } from "./types";

const GROUND_SIZE = 4200;

function geoToLocal(
  lat: number,
  lon: number,
  centerLat: number,
  centerLon: number
): [number, number] {
  const R = 6378137;
  const x = ((lon - centerLon) * Math.PI * R * Math.cos((centerLat * Math.PI) / 180)) / 180;
  const z = -((lat - centerLat) * Math.PI * R) / 180;
  return [x, z];
}

// Ease-out back overshoot (building pops up with a little bounce).
function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// Timeline holds (pause) at landmark years.
const PAUSES: { year: number }[] = [{ year: 1970 }, { year: 1995 }];

// Era-based color palette: early cream/sandstone, brick, concrete, glass.
function eraColor(year: number): THREE.Color {
  const c = new THREE.Color();
  if (year < 1200) c.setHSL(0.14, 0.30, 0.72); // cream/sandstone
  else if (year < 1750) c.setHSL(0.02, 0.45, 0.55); // brick
  else if (year < 1960) c.setHSL(0.0, 0.0, 0.60); // concrete/gray
  else c.setHSL(0.58, 0.10, 0.65); // glass/blue-gray
  return c;
}

interface InstProps {
  buildings: Building[];
  bounds: Bounds;
}

// Instanced building field that grows over the timeline.
const Buildings: React.FC<InstProps> = ({ buildings, bounds }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  const data = useMemo(() => {
    return buildings.map((b) => {
      const [cx, cz] = geoToLocal(b.lat, b.lon, bounds.centerLat, bounds.centerLon);
      const w = Math.max(6, Math.min(b.width ?? 20, 120));
      const d = Math.max(6, Math.min(b.depth ?? 20, 120));
      const h = Math.max(4, Math.min(b.height ?? 12, 320));
      return { cx, cz, w, d, h, year: b.builtYear ?? 2000, name: b.name };
    });
  }, [buildings, bounds]);

  // Compute current year with pauses.
  const currentYear = useMemo(() => {
    const t = frame / durationInFrames;
    let y = interpolate(t, [0, 1], [1968, 2026], {
      easing: Easing.inOut(Easing.cubic),
    });
    for (const p of PAUSES) {
      const d = Math.abs(y - p.year);
      if (d < 6) {
        y = y - Math.sign(y - p.year) * (6 - d) * 0.15;
      }
    }
    return Math.round(y);
  }, [frame, durationInFrames]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < data.length; i++) {
      const b = data[i];
      const raw = (currentYear - b.year) / 2.5;
      const clamped = THREE.MathUtils.clamp(raw, 0, 1);
      // easeOutBack overshoot on appearance
      const grow = raw <= 0 ? 0 : raw >= 1 ? 1 : easeOutBack(clamped);
      const g = grow * grow * (3 - 2 * grow);
      const h = Math.max(0.0001, b.h * g);
      dummy.position.set(b.cx, h / 2, b.cz);
      dummy.scale.set(b.w, h, b.d);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, eraColor(b.year));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, data.length]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.85} metalness={0.05} vertexColors />
    </instancedMesh>
  );
};

// A glowing label pinned to a building.
const LandmarkLabel: React.FC<{
  lat: number;
  lon: number;
  bounds: Bounds;
  year: number;
  name: string;
  height: number;
}> = ({ lat, lon, bounds, year, name, height }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const [cx, cz] = geoToLocal(lat, lon, bounds.centerLat, bounds.centerLon);
  const t = frame / durationInFrames;
  const y = interpolate(t, [0, 1], [1968, 2026]);
  const visible = y >= year - 1;
  const opacity = visible
    ? interpolate(y, [year - 1, year + 1], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  if (opacity <= 0.01) return null;
  return (
    <Html
      position={[cx, height + 40, cz]}
      center
      distanceFactor={2600}
      style={{ pointerEvents: "none", opacity }}
    >
      <div
        style={{
          color: "#fff",
          background: "rgba(11,16,33,0.82)",
          border: "1px solid rgba(120,180,255,0.7)",
          borderRadius: 8,
          padding: "6px 12px",
          fontFamily: "'Malgun Gothic','맑은 고딕',sans-serif",
          fontSize: 26,
          whiteSpace: "nowrap",
          boxShadow: "0 4px 18px rgba(0,0,0,0.5)",
        }}
      >
        <b>{name}</b>
        <span style={{ marginLeft: 10, color: "#8fd0ff" }}>{year}</span>
      </div>
    </Html>
  );
};

const CameraRig: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  // Landmark-lock: stay in southern quadrant, slow orbit, tiny dolly in.
  const u = Easing.inOut(Easing.cubic)(t);
  const angle = -0.48 + u * 0.30;
  const radius = 2800 - u * 200;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  return (
    <OrbitControls
      enablePan={false}
      minDistance={1200}
      maxDistance={5000}
      maxPolarAngle={Math.PI / 2.15}
      target={[0, 40, 0]}
      key="rig"
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
      ref={(ctrl) => {
        if (ctrl) {
          ctrl.object.position.set(x, 1600, z);
          ctrl.object.lookAt(0, 60, 0);
          ctrl.update();
        }
      }}
    />
  );
};

const CityScene: React.FC<{ buildings: Building[]; bounds: Bounds }> = ({
  buildings,
  bounds,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const year = Math.round(
    interpolate(t, [0, 1], [1968, 2026], { easing: Easing.inOut(Easing.cubic) })
  );

  const samil = { lat: 37.5709, lon: 126.9707, year: 1970, name: "삼일빌딩", height: 96 };

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1021" }}>
      <Canvas
        shadows
        camera={{ position: [1800, 1600, 1800], fov: 42, near: 1, far: 20000 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#0b1021"]} />
        <fog attach="fog" args={["#0b1021", 3000, 7000]} />
        <ambientLight intensity={0.55} />
        <hemisphereLight args={["#9db8ff", "#1a2238", 0.5]} />
        <directionalLight
          position={[1500, 2600, 1000]}
          intensity={1.25}
          color="#fff2e0"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-3000}
          shadow-camera-right={3000}
          shadow-camera-top={3000}
          shadow-camera-bottom={-3000}
        />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
          <meshStandardMaterial color="#161d33" roughness={1} />
        </mesh>
        <gridHelper
          args={[GROUND_SIZE, 40, "#243055", "#1a2238"]}
          position={[0, 0.5, 0]}
        />

        <Buildings buildings={buildings} bounds={bounds} />

        <LandmarkLabel
          lat={samil.lat}
          lon={samil.lon}
          bounds={bounds}
          year={samil.year}
          name={samil.name}
          height={samil.height}
        />

        <CameraRig />
      </Canvas>

      {/* Year HUD */}
      <div
        style={{
          position: "absolute",
          top: 64,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "'Malgun Gothic','맑은 고딕',sans-serif",
          color: "#eaf2ff",
          textShadow: "0 2px 18px rgba(0,0,0,0.7)",
          pointerEvents: "none",
        }}
      >
        <div style={{ fontSize: 110, fontWeight: 800, letterSpacing: 6 }}>
          {year}
        </div>
        <div style={{ fontSize: 30, opacity: 0.85 }}>서울 도심의 성장</div>
      </div>

      {/* Attribution */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          right: 28,
          fontFamily: "sans-serif",
          fontSize: 18,
          color: "rgba(234,242,255,0.6)",
          pointerEvents: "none",
        }}
      >
        © OpenStreetMap contributors
      </div>
    </AbsoluteFill>
  );
};

export { CityScene };
