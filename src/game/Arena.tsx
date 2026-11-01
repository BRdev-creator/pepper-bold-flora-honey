import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group, InstancedMesh, Mesh, Object3D } from "three";
import { BufferAttribute, BufferGeometry, Object3D as Object3DCtor, Vector3 } from "three";
import { engine } from "@/game/audio";
import { installProbe, readInput } from "@/game/input";
import { palette } from "@/game/palette";
import { PILLARS, SPARK_COUNT, pokeHud, sim, sparks, step } from "@/game/sim";

const STEP = 1 / 60;
const TRAIL = 14;
const look = new Vector3();
const desired = new Vector3();

function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Starfield() {
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    const arr = new Float32Array(260 * 3);
    const rng = mulberry32(11);
    for (let i = 0; i < 260; i += 1) {
      const radius = 48 + rng() * 36;
      const theta = rng() * Math.PI * 2;
      arr[i * 3] = Math.cos(theta) * radius;
      arr[i * 3 + 1] = 4 + rng() * 28;
      arr[i * 3 + 2] = Math.sin(theta) * radius;
    }
    g.setAttribute("position", new BufferAttribute(arr, 3));
    return g;
  }, []);

  useEffect(() => () => geo.dispose(), [geo]);

  return (
    <points geometry={geo}>
      <pointsMaterial color={palette.cream} size={0.16} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Disc() {
  const rings = [4.5, 8.5, 12.5, 16.5];
  return (
    <group>
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[22, 19.2, 0.9, 72]} />
        <meshStandardMaterial color={palette.cliff} roughness={1} metalness={0.04} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[22, 80]} />
        <meshStandardMaterial color={palette.stone} roughness={0.96} metalness={0.08} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[20.7, 22, 72]} />
        <meshBasicMaterial color={palette.tide} transparent opacity={0.55} />
      </mesh>
      {rings.map((radius) => (
        <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <torusGeometry args={[radius, 0.028, 6, 90]} />
          <meshBasicMaterial color={palette.tide} transparent opacity={0.32} />
        </mesh>
      ))}
      {Array.from({ length: 4 }, (_, i) => (
        <mesh key={i} rotation={[0, (i * Math.PI) / 4, 0]} position={[0, 0.03, 0]}>
          <boxGeometry args={[0.03, 0.015, 40]} />
          <meshBasicMaterial color={palette.tide} transparent opacity={0.16} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 12, 0]}>
        <torusGeometry args={[32, 0.07, 8, 100]} />
        <meshBasicMaterial color={palette.tide} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function Horizon() {
  const cones = [
    { x: 36, z: 8, h: 7, r: 3.2 },
    { x: 22, z: 34, h: 5.5, r: 2.6 },
    { x: -18, z: 38, h: 8, r: 3.4 },
    { x: -38, z: 6, h: 6, r: 2.8 },
    { x: -28, z: -30, h: 7.5, r: 3.1 },
    { x: 10, z: -40, h: 5, r: 2.4 },
    { x: 40, z: -18, h: 6.5, r: 2.9 },
  ];
  return (
    <group>
      {cones.map((cone) => (
        <mesh key={`${cone.x}:${cone.z}`} position={[cone.x, cone.h / 2 - 1.2, cone.z]}>
          <coneGeometry args={[cone.r, cone.h, 5]} />
          <meshStandardMaterial color={palette.cliff} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Pillars() {
  return (
    <group>
      {PILLARS.map((pillar) => (
        <group key={`${pillar.x}:${pillar.z}`} position={[pillar.x, 0, pillar.z]}>
          <mesh position={[0, pillar.h / 2, 0]}>
            <cylinderGeometry args={[pillar.r * 0.92, pillar.r, pillar.h, 6]} />
            <meshStandardMaterial color={palette.hull} roughness={0.78} metalness={0.18} />
          </mesh>
          <mesh position={[0, pillar.h * 0.72, 0]}>
            <cylinderGeometry args={[pillar.r + 0.05, pillar.r + 0.05, 0.1, 6]} />
            <meshStandardMaterial
              color={palette.tide}
              emissive={palette.tide}
              emissiveIntensity={0.7}
              roughness={0.4}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function hideInstance(mesh: InstancedMesh, index: number, scratch: Object3D) {
  scratch.position.set(0, -20, 0);
  scratch.scale.setScalar(0.001);
  scratch.rotation.set(0, 0, 0);
  scratch.updateMatrix();
  mesh.setMatrixAt(index, scratch.matrix);
}

function Stage() {
  const craft = useRef<Group>(null);
  const body = useRef<Group>(null);
  const wisp = useRef<Group>(null);
  const shadow = useRef<Mesh>(null);
  const moteRefs = useRef<(Mesh | null)[]>([]);
  const sparksRef = useRef<InstancedMesh>(null);
  const trailRef = useRef<InstancedMesh>(null);
  const rig = useRef(new Vector3(0, 8.2, 18));
  const acc = useRef(0);
  const clock = useRef(0);
  const lastPoke = useRef(0);
  const lastPhase = useRef(sim.phase);
  const scratch = useMemo(() => new Object3DCtor(), []);
  const trail = useRef(Array.from({ length: TRAIL }, () => new Vector3(0, -20, 0)));
  const trailCursor = useRef(0);

  useEffect(() => {
    const sparkMesh = sparksRef.current;
    const trailMesh = trailRef.current;
    if (sparkMesh) {
      for (let i = 0; i < SPARK_COUNT; i += 1) hideInstance(sparkMesh, i, scratch);
      sparkMesh.instanceMatrix.needsUpdate = true;
    }
    if (trailMesh) {
      for (let i = 0; i < TRAIL; i += 1) hideInstance(trailMesh, i, scratch);
      trailMesh.instanceMatrix.needsUpdate = true;
    }
  }, [scratch]);

  useFrame((state, delta) => {
    const frameDt = Math.min(delta, 0.1);
    clock.current += frameDt;

    if (sim.phase === "playing") {
      acc.current += frameDt;
      const input = readInput();
      let guard = 0;
      while (acc.current >= STEP && guard < 5) {
        step(STEP, input);
        acc.current -= STEP;
        guard += 1;
      }
      engine(sim.speed, true);
    } else {
      acc.current = 0;
      engine(0, false);
    }

    const t = clock.current;
    const fx = -Math.sin(sim.yaw);
    const fz = -Math.cos(sim.yaw);
    const hover = 0.72 + Math.sin(t * 2.3) * 0.06;

    if (craft.current) {
      craft.current.position.set(sim.x, hover, sim.z);
      craft.current.lookAt(sim.x + fx, hover, sim.z + fz);
      craft.current.rotateZ(sim.bank);
      craft.current.visible = sim.phase === "menu" || sim.invuln <= 0 || Math.sin(t * 16) > 0;
    }
    if (body.current) {
      const stretch = 1 + Math.min(0.16, Math.abs(sim.speed) * 0.01);
      const lateral = 1 / Math.sqrt(stretch);
      body.current.scale.set(lateral, lateral, stretch);
    }
    if (shadow.current) shadow.current.position.set(sim.x, 0.05, sim.z);

    sim.motes.forEach((mote, index) => {
      const mesh = moteRefs.current[index];
      if (!mesh) return;
      mesh.position.set(mote.x, 1.05 + Math.sin(t * 2 + mote.phase) * 0.22, mote.z);
      mesh.rotation.y = t * 1.3 + mote.phase;
    });

    if (wisp.current) {
      if (sim.phase === "menu") {
        wisp.current.position.set(Math.sin(t * 0.35) * 14, 1.25, Math.cos(t * 0.35) * 14);
      } else {
        wisp.current.position.set(sim.wispX, 1.15 + Math.sin(t * 3) * 0.12, sim.wispZ);
      }
      wisp.current.rotation.y = t * 0.9;
      wisp.current.scale.setScalar(1 + Math.sin(t * 4) * 0.06);
    }

    const trailMesh = trailRef.current;
    if (trailMesh) {
      if (sim.phase === "playing") {
        trail.current[trailCursor.current].set(sim.x - fx * 0.9, 0.55, sim.z - fz * 0.9);
        trailCursor.current = (trailCursor.current + 1) % TRAIL;
      }
      for (let index = 0; index < TRAIL; index += 1) {
        const age = (index + TRAIL - trailCursor.current) % TRAIL;
        const point = trail.current[index];
        if (sim.phase !== "playing" || point.y < -5) {
          hideInstance(trailMesh, index, scratch);
          continue;
        }
        scratch.position.copy(point);
        scratch.scale.setScalar(Math.max(0.05, 0.24 * (1 - age / TRAIL)));
        scratch.rotation.set(0, 0, 0);
        scratch.updateMatrix();
        trailMesh.setMatrixAt(index, scratch.matrix);
      }
      trailMesh.instanceMatrix.needsUpdate = true;
    }

    const sparkMesh = sparksRef.current;
    if (sparkMesh) {
      sparks.forEach((spark, index) => {
        if (spark.life <= 0) {
          hideInstance(sparkMesh, index, scratch);
          return;
        }
        scratch.position.set(spark.x, spark.y, spark.z);
        scratch.scale.setScalar(Math.max(0.03, spark.life * 0.3));
        scratch.rotation.set(0, 0, 0);
        scratch.updateMatrix();
        sparkMesh.setMatrixAt(index, scratch.matrix);
      });
      sparkMesh.instanceMatrix.needsUpdate = true;
    }

    if (sim.phase === "menu") {
      desired.set(Math.sin(t * 0.18) * 18, 8.2, Math.cos(t * 0.18) * 18);
      look.set(0, 0.8, 0);
    } else {
      desired.set(sim.x - fx * 10.2, 5.1, sim.z - fz * 10.2);
      look.set(sim.x + fx * 3.4, 0.85, sim.z + fz * 3.4);
    }
    rig.current.lerp(desired, 1 - Math.exp(-4.2 * frameDt));

    const shake = sim.shake ? sim.trauma * sim.trauma : 0;
    state.camera.position.set(
      rig.current.x + Math.sin(t * 41) * 0.26 * shake,
      rig.current.y + Math.sin(t * 29) * 0.14 * shake,
      rig.current.z + Math.cos(t * 33) * 0.26 * shake,
    );
    state.camera.lookAt(look);

    if (sim.phase !== lastPhase.current || clock.current - lastPoke.current > 0.1) {
      lastPhase.current = sim.phase;
      lastPoke.current = clock.current;
      pokeHud();
    }
  });

  return (
    <group>
      <Starfield />
      <Horizon />
      <Disc />
      <Pillars />
      <group ref={craft}>
        <group ref={body}>
          <mesh>
            <boxGeometry args={[0.86, 0.18, 1.28]} />
            <meshStandardMaterial color={palette.hull} metalness={0.72} roughness={0.28} />
          </mesh>
          <mesh position={[0, 0, 0.92]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.26, 0.68, 5]} />
            <meshStandardMaterial
              color={palette.tide}
              emissive={palette.tide}
              emissiveIntensity={0.65}
              metalness={0.35}
              roughness={0.28}
            />
          </mesh>
          <mesh position={[0, 0.02, -0.02]}>
            <boxGeometry args={[2.15, 0.055, 0.4]} />
            <meshStandardMaterial color={palette.hull} metalness={0.62} roughness={0.32} />
          </mesh>
          <mesh position={[1.08, 0.02, -0.02]}>
            <boxGeometry args={[0.12, 0.1, 0.48]} />
            <meshStandardMaterial color={palette.tide} emissive={palette.tide} emissiveIntensity={0.85} />
          </mesh>
          <mesh position={[-1.08, 0.02, -0.02]}>
            <boxGeometry args={[0.12, 0.1, 0.48]} />
            <meshStandardMaterial color={palette.tide} emissive={palette.tide} emissiveIntensity={0.85} />
          </mesh>
          <mesh position={[0, 0.2, -0.5]}>
            <boxGeometry args={[0.06, 0.32, 0.28]} />
            <meshStandardMaterial color={palette.hull} metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.16, 0.16]} scale={[1, 0.72, 1]}>
            <sphereGeometry args={[0.22, 16, 12]} />
            <meshStandardMaterial
              color={palette.cream}
              emissive={palette.tide}
              emissiveIntensity={0.18}
              roughness={0.08}
              metalness={0.15}
            />
          </mesh>
          <mesh position={[0, 0.02, -0.78]}>
            <sphereGeometry args={[0.15, 12, 10]} />
            <meshBasicMaterial color={palette.amber} />
          </mesh>
          <pointLight position={[0, 0.2, 0]} color={palette.tide} intensity={2.2} distance={9} />
          <pointLight position={[0, 0, -0.9]} color={palette.amber} intensity={1.4} distance={5} />
        </group>
      </group>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 10]}>
        <circleGeometry args={[1.05, 20]} />
        <meshBasicMaterial color={palette.ink} transparent opacity={0.4} />
      </mesh>
      {sim.motes.map((mote, index) => (
        <mesh
          key={mote.id}
          ref={(node) => {
            moteRefs.current[index] = node;
          }}
          position={[mote.x, 1, mote.z]}
        >
          <icosahedronGeometry args={[0.38, 0]} />
          <meshStandardMaterial
            color={palette.amber}
            emissive={palette.amber}
            emissiveIntensity={1.15}
            roughness={0.28}
            metalness={0.15}
          />
        </mesh>
      ))}
      <group ref={wisp}>
        <mesh>
          <icosahedronGeometry args={[0.62, 0]} />
          <meshStandardMaterial
            color={palette.ink}
            emissive={palette.cream}
            emissiveIntensity={1.35}
            roughness={0.35}
          />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[0.98, 0]} />
          <meshBasicMaterial color={palette.cream} wireframe transparent opacity={0.55} />
        </mesh>
        <pointLight color={palette.cream} intensity={2.4} distance={8} />
      </group>
      <instancedMesh ref={trailRef} args={[undefined, undefined, TRAIL]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial color={palette.tide} transparent opacity={0.75} />
      </instancedMesh>
      <instancedMesh ref={sparksRef} args={[undefined, undefined, SPARK_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[1, 5, 5]} />
        <meshBasicMaterial color={palette.amber} />
      </instancedMesh>
    </group>
  );
}

export default function Arena() {
  useEffect(() => {
    installProbe({
      getYaw: () => sim.yaw,
      getSpeed: () => sim.speed,
    });
  }, []);

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 8.2, 18], fov: 48, near: 0.1, far: 140 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={[palette.ink]} />
      <fog attach="fog" args={[palette.ink, 22, 68]} />
      <ambientLight intensity={0.38} />
      <hemisphereLight args={[palette.tide, palette.ink, 0.28]} />
      <directionalLight position={[10, 16, 6]} intensity={1.25} color={palette.cream} />
      <Stage />
    </Canvas>
  );
}
