import {
  Edges,
  Line,
  RoundedBox,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import {
  MathUtils,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
} from "three";
import oakFloorTextureUrl from "../../assets/virtualhome/oak-floor-texture.jpg";
import darkSlateTextureUrl from "../../assets/virtualhome/dark-slate-texture.jpg";
import greyBoucleTextureUrl from "../../assets/virtualhome/grey-boucle-texture.jpg";
import lightQuartzTextureUrl from "../../assets/virtualhome/light-quartz-texture.jpg";
import oiledCedarTextureUrl from "../../assets/virtualhome/oiled-cedar-texture.jpg";
import outdoorTextileTextureUrl from "../../assets/virtualhome/outdoor-textile-texture.jpg";
import warmClayPlasterTextureUrl from "../../assets/virtualhome/warm-clay-plaster-texture.jpg";
import wovenRugTextureUrl from "../../assets/virtualhome/woven-rug-texture.jpg";
import wovenSeatTextureUrl from "../../assets/virtualhome/woven-seat-texture.jpg";

const colors = {
  accent: "#c5ff3d",
  charcoal: "#101719",
  concrete: "#8b8981",
  darkMetal: "#1a2223",
  foliage: "#465c30",
  glass: "#4d686b",
  plaster: "#c9c2b8",
  roof: "#171f20",
  stone: "#66645e",
  warmLight: "#ffbd72",
  wood: "#5f4332",
  woodDark: "#382a23",
};

const oakFloorTexture = new TextureLoader().load(oakFloorTextureUrl);
oakFloorTexture.wrapS = RepeatWrapping;
oakFloorTexture.wrapT = RepeatWrapping;
oakFloorTexture.repeat.set(2.8, 2.4);
oakFloorTexture.colorSpace = SRGBColorSpace;

const walnutFurnitureTexture = oakFloorTexture.clone();
walnutFurnitureTexture.wrapS = RepeatWrapping;
walnutFurnitureTexture.wrapT = RepeatWrapping;
walnutFurnitureTexture.repeat.set(1.35, 0.9);
walnutFurnitureTexture.colorSpace = SRGBColorSpace;
walnutFurnitureTexture.needsUpdate = true;

const darkSlateTexture = new TextureLoader().load(darkSlateTextureUrl);
darkSlateTexture.wrapS = RepeatWrapping;
darkSlateTexture.wrapT = RepeatWrapping;
darkSlateTexture.repeat.set(2.6, 3.2);
darkSlateTexture.colorSpace = SRGBColorSpace;

const greyBoucleTexture = new TextureLoader().load(greyBoucleTextureUrl);
greyBoucleTexture.wrapS = RepeatWrapping;
greyBoucleTexture.wrapT = RepeatWrapping;
greyBoucleTexture.repeat.set(2.25, 2.25);
greyBoucleTexture.colorSpace = SRGBColorSpace;

const lightQuartzTexture = new TextureLoader().load(lightQuartzTextureUrl);
lightQuartzTexture.wrapS = RepeatWrapping;
lightQuartzTexture.wrapT = RepeatWrapping;
lightQuartzTexture.repeat.set(1.35, 1.05);
lightQuartzTexture.colorSpace = SRGBColorSpace;

const oiledCedarTexture = new TextureLoader().load(oiledCedarTextureUrl);
oiledCedarTexture.wrapS = RepeatWrapping;
oiledCedarTexture.wrapT = RepeatWrapping;
oiledCedarTexture.repeat.set(2.8, 1.1);
oiledCedarTexture.colorSpace = SRGBColorSpace;

const outdoorTextileTexture = new TextureLoader().load(outdoorTextileTextureUrl);
outdoorTextileTexture.wrapS = RepeatWrapping;
outdoorTextileTexture.wrapT = RepeatWrapping;
outdoorTextileTexture.repeat.set(2.4, 2.4);
outdoorTextileTexture.colorSpace = SRGBColorSpace;

const warmClayPlasterTexture = new TextureLoader().load(warmClayPlasterTextureUrl);
warmClayPlasterTexture.wrapS = RepeatWrapping;
warmClayPlasterTexture.wrapT = RepeatWrapping;
warmClayPlasterTexture.repeat.set(1.8, 1.8);
warmClayPlasterTexture.colorSpace = SRGBColorSpace;

const wovenRugTexture = new TextureLoader().load(wovenRugTextureUrl);
wovenRugTexture.wrapS = RepeatWrapping;
wovenRugTexture.wrapT = RepeatWrapping;
wovenRugTexture.repeat.set(2.4, 1.8);
wovenRugTexture.colorSpace = SRGBColorSpace;

const wovenSeatTexture = new TextureLoader().load(wovenSeatTextureUrl);
wovenSeatTexture.wrapS = RepeatWrapping;
wovenSeatTexture.wrapT = RepeatWrapping;
wovenSeatTexture.repeat.set(2.1, 2.1);
wovenSeatTexture.colorSpace = SRGBColorSpace;

const phase = (value, start, end) => (
  MathUtils.smoothstep(MathUtils.clamp(value, start, end), start, end)
);

function setGroupMaterialState(group, progress, targetOpacity, wireframe = false) {
  if (!group) return;

  group.traverse((object) => {
    if (!object.isMesh || !object.material) return;

    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      if (material.userData.virtualHomeBaseOpacity === undefined) {
        material.userData.virtualHomeBaseOpacity = material.opacity;
      }

      const baseOpacity = material.userData.virtualHomeBaseOpacity;
      material.opacity = MathUtils.lerp(baseOpacity, Math.min(baseOpacity, targetOpacity), progress);
      material.transparent = material.opacity < 0.999;
      material.depthWrite = material.opacity > 0.34;
      material.wireframe = wireframe && progress > 0.44;
    });
  });
}

function Box({
  children,
  color = colors.plaster,
  edgeColor,
  emissive,
  emissiveIntensity,
  metalness = 0,
  map,
  opacity = 1,
  position,
  rotation,
  roughness = 0.72,
  scale,
}) {
  const surfaceMap = map ?? (
    color === colors.plaster ? warmClayPlasterTexture : undefined
  );

  return (
    <mesh castShadow receiveShadow position={position} rotation={rotation} scale={scale}>
      <boxGeometry />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        map={surfaceMap}
        metalness={metalness}
        opacity={opacity}
        roughness={roughness}
        transparent={opacity < 1}
      />
      {edgeColor ? <Edges color={edgeColor} opacity={0.56} transparent /> : null}
      {children}
    </mesh>
  );
}

function WarmWindow({ position, rotation = [0, 0, 0], scale = [1.4, 1.2, 1] }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Box
        color={colors.glass}
        emissive={colors.warmLight}
        emissiveIntensity={0.58}
        metalness={0.16}
        position={[0, 0, -0.03]}
        roughness={0.18}
        scale={[0.96, 0.96, 0.05]}
      />
      {[-0.52, 0.52].map((x) => (
        <Box
          color={colors.darkMetal}
          edgeColor="#697573"
          key={x}
          position={[x, 0, 0.02]}
          scale={[0.085, 1.12, 0.12]}
        />
      ))}
      {[-0.52, 0.52].map((y) => (
        <Box
          color={colors.darkMetal}
          edgeColor="#697573"
          key={y}
          position={[0, y, 0.02]}
          scale={[1.12, 0.085, 0.12]}
        />
      ))}
      <Box color={colors.darkMetal} position={[0, 0, 0.02]} scale={[0.055, 0.98, 0.09]} />
      <Box color={colors.darkMetal} position={[0, 0, 0.02]} scale={[0.98, 0.055, 0.09]} />
    </group>
  );
}

function FrontDoor({ position }) {
  return (
    <group position={position}>
      <Box color={colors.darkMetal} scale={[1.2, 2.18, 0.13]} />
      <Box
        color="#3b4847"
        edgeColor="#7b8580"
        position={[0, 0, -0.08]}
        scale={[1.02, 2.02, 0.06]}
      />
      <Box
        color={colors.glass}
        emissive={colors.warmLight}
        emissiveIntensity={0.3}
        position={[0, 0.38, -0.13]}
        roughness={0.18}
        scale={[0.7, 0.86, 0.035]}
      />
      <mesh castShadow position={[0.36, -0.22, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.18, 12]} />
        <meshStandardMaterial color="#d0b57b" metalness={0.7} roughness={0.24} />
      </mesh>
    </group>
  );
}

function Plant({ position, scale = 1, tall = false }) {
  const leaves = tall
    ? [[0, 0.72, 0], [0.16, 0.88, 0.03], [-0.15, 1.03, -0.04], [0.08, 1.18, 0]]
    : [[0, 0.46, 0], [0.14, 0.52, 0.08], [-0.13, 0.58, -0.05], [0.04, 0.68, 0]];

  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.19, 0.15, 0.36, 12]} />
        <meshStandardMaterial color="#6b4b35" roughness={0.86} />
      </mesh>
      <mesh castShadow position={[0, tall ? 0.7 : 0.48, 0]}>
        <cylinderGeometry args={[0.025, 0.035, tall ? 0.9 : 0.48, 8]} />
        <meshStandardMaterial color="#3f512c" roughness={0.9} />
      </mesh>
      {leaves.map(([x, y, z], index) => (
        <mesh
          castShadow
          key={`${x}-${y}-${z}`}
          position={[x, y, z]}
          rotation={[0.15 * index, 0.6 * index, index % 2 ? -0.45 : 0.45]}
          scale={[0.17, tall ? 0.45 : 0.28, 0.11]}
        >
          <sphereGeometry args={[1, 12, 8]} />
          <meshStandardMaterial
            color={index % 2 ? "#607c3e" : colors.foliage}
            roughness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

function Hedge({ count = 10, position, rotation = [0, 0, 0], spacing = 0.46 }) {
  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: count }, (_, index) => (
        <mesh
          castShadow
          key={index}
          position={[(index - (count - 1) / 2) * spacing, 0.34, 0]}
          scale={[0.32, 0.48 + (index % 3) * 0.06, 0.32]}
        >
          <dodecahedronGeometry args={[0.64, 0]} />
          <meshStandardMaterial
            color={index % 2 ? "#405529" : "#536b35"}
            roughness={0.96}
          />
        </mesh>
      ))}
    </group>
  );
}

function Tree({ position }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 1.45, 0]}>
        <cylinderGeometry args={[0.11, 0.18, 2.9, 10]} />
        <meshStandardMaterial color="#594333" roughness={0.95} />
      </mesh>
      {[
        [-0.45, 2.55, 0.08, 0.74],
        [0.35, 2.65, 0.1, 0.8],
        [0.05, 3.15, -0.05, 0.76],
        [-0.25, 3.35, 0.18, 0.58],
      ].map(([x, y, z, scale], index) => (
        <mesh castShadow key={index} position={[x, y, z]} scale={scale}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={index % 2 ? "#42592f" : "#556d38"}
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  );
}

function OutdoorChair({ position, rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Box
        color="#5b3a29"
        map={oiledCedarTexture}
        position={[0, 0.25, 0]}
        scale={[0.54, 0.08, 0.48]}
      />
      <Box
        color="#a69b8d"
        map={outdoorTextileTexture}
        position={[0, 0.31, -0.01]}
        roughness={0.95}
        scale={[0.46, 0.08, 0.4]}
      />
      <Box
        color="#5b3a29"
        map={oiledCedarTexture}
        position={[0, 0.68, 0.21]}
        rotation={[-0.08, 0, 0]}
        scale={[0.56, 0.78, 0.08]}
      />
      <Box
        color="#a69b8d"
        map={outdoorTextileTexture}
        position={[0, 0.68, 0.16]}
        rotation={[-0.08, 0, 0]}
        roughness={0.95}
        scale={[0.46, 0.55, 0.075]}
      />
      {[-0.22, 0.22].flatMap((legX) => [-0.17, 0.17].map((legZ) => (
        <Box
          color="#2a2d2b"
          key={`${legX}-${legZ}`}
          metalness={0.2}
          position={[legX, 0.04, legZ]}
          scale={[0.045, 0.42, 0.045]}
        />
      )))}
      {[-0.31, 0.31].map((x) => (
        <Box
          color="#5b3a29"
          key={x}
          map={oiledCedarTexture}
          position={[x, 0.47, 0.02]}
          scale={[0.055, 0.07, 0.45]}
        />
      ))}
    </group>
  );
}

function OutdoorTable({ position }) {
  const chairPositions = [
    [-1.04, 0, 0, -Math.PI / 2],
    [1.04, 0, 0, Math.PI / 2],
    [0, 0, -1.04, Math.PI],
    [0, 0, 1.04, 0],
  ];

  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 0.58, 0]}>
        <cylinderGeometry args={[0.72, 0.72, 0.1, 36]} />
        <meshStandardMaterial
          color="#5b3a29"
          map={oiledCedarTexture}
          roughness={0.72}
        />
      </mesh>
      <mesh castShadow position={[0, 0.31, 0]}>
        <cylinderGeometry args={[0.09, 0.11, 0.5, 16]} />
        <meshStandardMaterial color="#222827" metalness={0.28} roughness={0.52} />
      </mesh>
      {[0, Math.PI / 2].map((rotation) => (
        <Box
          color="#222827"
          key={rotation}
          metalness={0.28}
          position={[0, 0.08, 0]}
          rotation={[0, rotation, 0]}
          scale={[0.92, 0.05, 0.08]}
        />
      ))}
      {chairPositions.map(([x, y, z, rotation], index) => (
        <OutdoorChair key={index} position={[x, y, z]} rotation={rotation} />
      ))}
      <mesh castShadow position={[0, 0.68, 0]}>
        <cylinderGeometry args={[0.16, 0.13, 0.18, 16]} />
        <meshStandardMaterial color="#4d473b" roughness={0.9} />
      </mesh>
      {[0, 1.57, 3.14, 4.71].map((angle) => (
        <mesh
          castShadow
          key={angle}
          position={[Math.sin(angle) * 0.09, 0.82, Math.cos(angle) * 0.09]}
          rotation={[0.25, angle, 0.55]}
          scale={[0.08, 0.24, 0.055]}
        >
          <sphereGeometry args={[1, 10, 7]} />
          <meshStandardMaterial color="#647545" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

function GardenShrub({ position, scale = 1, tone = 0 }) {
  const palette = ["#314623", "#3c5429", "#4a6030"];

  return (
    <group position={position} scale={scale}>
      {[
        [-0.18, 0.2, 0.03, 0.32],
        [0.17, 0.24, -0.06, 0.36],
        [0, 0.34, 0.08, 0.42],
      ].map(([x, y, z, size], index) => (
        <mesh castShadow key={index} position={[x, y, z]} scale={size}>
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={palette[(index + tone) % palette.length]} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function GardenGrass({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {Array.from({ length: 7 }, (_, index) => {
        const angle = (index / 7) * Math.PI * 2;
        return (
          <mesh
            castShadow
            key={index}
            position={[Math.sin(angle) * 0.09, 0.24, Math.cos(angle) * 0.09]}
            rotation={[0.2, angle, Math.sin(angle) * 0.58]}
            scale={[0.075, 0.34 + (index % 3) * 0.06, 0.045]}
          >
            <sphereGeometry args={[1, 10, 7]} />
            <meshStandardMaterial
              color={index % 2 ? "#5b6d3a" : "#3d542d"}
              roughness={1}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function GardenFence({ length = 5.4, position, rotation = [0, 0, 0] }) {
  const postPositions = [-length / 2, 0, length / 2];

  return (
    <group position={position} rotation={rotation}>
      {postPositions.map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <Box
            color="#272d2b"
            position={[0, 0.08, 0]}
            scale={[0.22, 0.16, 0.22]}
          />
          <Box
            color="#4d3023"
            map={oiledCedarTexture}
            position={[0, 0.76, 0]}
            scale={[0.11, 1.38, 0.13]}
          />
        </group>
      ))}
      {[0.36, 0.72, 1.08].map((y) => (
        <Box
          color="#4d3023"
          key={y}
          map={oiledCedarTexture}
          position={[0, y, 0]}
          roughness={0.74}
          scale={[length - 0.18, 0.25, 0.1]}
        />
      ))}
    </group>
  );
}

function GardenLight({ position }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.56, 16]} />
        <meshStandardMaterial color="#202625" metalness={0.3} roughness={0.48} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.11, 0.1, 0.28, 16]} />
        <meshStandardMaterial
          color="#cba777"
          emissive={colors.warmLight}
          emissiveIntensity={2.2}
          opacity={0.86}
          roughness={0.2}
          transparent
        />
      </mesh>
      <mesh position={[0, 0.79, 0]}>
        <cylinderGeometry args={[0.14, 0.12, 0.06, 16]} />
        <meshStandardMaterial color="#202625" metalness={0.3} roughness={0.48} />
      </mesh>
      <pointLight color={colors.warmLight} distance={3} intensity={3.2} position={[0, 0.58, 0]} />
    </group>
  );
}

function EntrySteps({ position }) {
  return (
    <group position={position}>
      <Box
        color="#3a3d3c"
        map={darkSlateTexture}
        position={[0, 0.03, 0]}
        roughness={0.9}
        scale={[1.55, 0.18, 0.62]}
      />
      <Box
        color="#3a3d3c"
        map={darkSlateTexture}
        position={[0, -0.05, 0.48]}
        roughness={0.9}
        scale={[1.85, 0.16, 0.42]}
      />
      <Box
        color="#3a3d3c"
        map={darkSlateTexture}
        position={[0, -0.12, 0.84]}
        roughness={0.9}
        scale={[2.15, 0.14, 0.38]}
      />
      <Box
        color="#827566"
        map={outdoorTextileTexture}
        position={[0, 0.135, -0.04]}
        roughness={0.98}
        scale={[0.82, 0.025, 0.38]}
      />
    </group>
  );
}

function EntryWallLight({ position }) {
  return (
    <group position={position}>
      <Box color="#202625" position={[0, 0, 0]} scale={[0.2, 0.52, 0.12]} />
      <Box
        color="#d3aa72"
        emissive={colors.warmLight}
        emissiveIntensity={2.4}
        opacity={0.9}
        position={[0, 0, 0.08]}
        roughness={0.18}
        scale={[0.1, 0.33, 0.08]}
      />
      <pointLight color={colors.warmLight} distance={2.8} intensity={3.4} position={[0, 0, 0.3]} />
    </group>
  );
}

function BoucleMaterial({ color = "#aaa49a" }) {
  return (
    <meshStandardMaterial
      color={color}
      map={greyBoucleTexture}
      roughness={1}
    />
  );
}

function WalnutMaterial({ color = "#5b3f2f", roughness = 0.68 }) {
  return (
    <meshStandardMaterial
      color={color}
      map={walnutFurnitureTexture}
      roughness={roughness}
    />
  );
}

function Sofa({
  cushionCount = 3,
  hasThrow = false,
  position,
  rotation = [0, 0, 0],
  width = 2.35,
}) {
  const innerWidth = width - 0.42;
  const cushionWidth = innerWidth / cushionCount;
  const cushionPositions = Array.from(
    { length: cushionCount },
    (_, index) => -innerWidth / 2 + cushionWidth / 2 + index * cushionWidth,
  );
  const edgeColor = "#bdb5aa";

  return (
    <group position={position} rotation={rotation}>
      <RoundedBox
        castShadow
        args={[width + 0.08, 0.1, 0.82]}
        position={[0, 0.13, 0]}
        radius={0.025}
      >
        <WalnutMaterial color="#493124" roughness={0.62} />
      </RoundedBox>
      <RoundedBox
        castShadow
        args={[width, 0.3, 0.82]}
        position={[0, 0.31, 0]}
        radius={0.07}
      >
        <BoucleMaterial color="#c0bdb7" />
        <Edges color={edgeColor} opacity={0.34} threshold={24} transparent />
      </RoundedBox>
      <RoundedBox
        castShadow
        args={[width - 0.18, 0.62, 0.18]}
        position={[0, 0.67, 0.31]}
        radius={0.055}
      >
        <BoucleMaterial color="#b7b4ae" />
        <Edges color={edgeColor} opacity={0.3} threshold={24} transparent />
      </RoundedBox>
      {cushionPositions.map((x) => (
        <RoundedBox
          castShadow
          args={[cushionWidth - 0.045, 0.15, 0.64]}
          key={x}
          position={[x, 0.5, -0.045]}
          radius={0.052}
        >
          <BoucleMaterial color="#dedad2" />
          <Edges color="#d0c8bc" opacity={0.42} threshold={20} transparent />
        </RoundedBox>
      ))}
      {cushionPositions.map((x) => (
        <RoundedBox
          castShadow
          args={[cushionWidth - 0.055, 0.43, 0.14]}
          key={`back-${x}`}
          position={[x, 0.77, 0.16]}
          radius={0.06}
        >
          <BoucleMaterial color="#d0ccc5" />
          <Edges color="#c9c1b6" opacity={0.4} threshold={20} transparent />
        </RoundedBox>
      ))}
      {[-width / 2, width / 2].map((x) => (
        <RoundedBox
          castShadow
          args={[0.18, 0.5, 0.86]}
          key={x}
          position={[x, 0.39, 0]}
          radius={0.05}
        >
          <BoucleMaterial color="#bdbab4" />
          <Edges color={edgeColor} opacity={0.36} threshold={22} transparent />
        </RoundedBox>
      ))}
      <RoundedBox
        castShadow
        args={[0.38, 0.34, 0.12]}
        position={[-innerWidth * 0.36, 0.79, -0.03]}
        rotation={[0.08, -0.16, 0.12]}
        radius={0.06}
      >
        <BoucleMaterial color="#6e6256" />
        <Edges color="#998c7d" opacity={0.42} threshold={20} transparent />
      </RoundedBox>
      <RoundedBox
        castShadow
        args={[0.35, 0.31, 0.12]}
        position={[innerWidth * 0.36, 0.77, -0.04]}
        rotation={[-0.04, 0.18, -0.1]}
        radius={0.06}
      >
        <BoucleMaterial color="#c0b6a6" />
        <Edges color="#ded3c3" opacity={0.4} threshold={20} transparent />
      </RoundedBox>
      {hasThrow ? (
        <group position={[innerWidth * 0.18, 0, 0]}>
          <RoundedBox
            castShadow
            args={[0.42, 0.46, 0.045]}
            position={[0, 0.77, 0.245]}
            rotation={[0.02, 0, -0.08]}
            radius={0.035}
          >
            <meshStandardMaterial
              color="#84766d"
              map={wovenRugTexture}
              roughness={1}
            />
          </RoundedBox>
          <RoundedBox
            castShadow
            args={[0.42, 0.04, 0.45]}
            position={[0, 0.585, 0.02]}
            rotation={[0, 0, -0.08]}
            radius={0.025}
          >
            <meshStandardMaterial
              color="#84766d"
              map={wovenRugTexture}
              roughness={1}
            />
          </RoundedBox>
          {[-0.16, -0.08, 0, 0.08, 0.16].map((x) => (
            <Box
              color="#c0b2a2"
              key={`fringe-${x}`}
              position={[x, 0.56, -0.21]}
              scale={[0.012, 0.04, 0.035]}
            />
          ))}
        </group>
      ) : null}
      {[-width / 2 + 0.23, width / 2 - 0.23].flatMap((x) => [-0.27, 0.27].map((z) => (
        <Box
          color="#493124"
          key={`leg-${x}-${z}`}
          map={walnutFurnitureTexture}
          position={[x, 0.055, z]}
          scale={[0.075, 0.11, 0.075]}
        />
      )))}
    </group>
  );
}

function CoffeeTable({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox castShadow args={[1.78, 0.11, 0.76]} position={[0, 0.34, 0]} radius={0.035}>
        <WalnutMaterial color="#573a2a" roughness={0.6} />
      </RoundedBox>
      <RoundedBox castShadow args={[1.48, 0.065, 0.54]} position={[0, 0.14, 0]} radius={0.02}>
        <WalnutMaterial color="#493226" roughness={0.7} />
      </RoundedBox>
      {[-0.72, 0.72].flatMap((x) => [-0.26, 0.26].map((z) => (
        <Box
          color="#252b2a"
          key={`${x}-${z}`}
          metalness={0.46}
          position={[x, 0.17, z]}
          roughness={0.38}
          scale={[0.055, 0.34, 0.055]}
        />
      )))}
      <mesh castShadow position={[-0.35, 0.425, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.035, 24]} />
        <meshStandardMaterial color="#565a56" metalness={0.24} roughness={0.48} />
      </mesh>
      <Box color="#b5a38d" position={[0.3, 0.425, 0.08]} scale={[0.42, 0.03, 0.26]} />
      <Box color="#5b493c" position={[0.31, 0.455, 0.08]} scale={[0.32, 0.025, 0.21]} />
      <mesh castShadow position={[-0.02, 0.465, -0.2]}>
        <cylinderGeometry args={[0.075, 0.065, 0.13, 18]} />
        <meshStandardMaterial color="#c0b9ab" roughness={0.52} />
      </mesh>
      <mesh castShadow position={[0.58, 0.46, -0.12]}>
        <cylinderGeometry args={[0.09, 0.075, 0.13, 18]} />
        <meshStandardMaterial color="#6f6657" roughness={0.75} />
      </mesh>
      {[-0.055, 0, 0.055].map((x) => (
        <mesh
          castShadow
          key={`coffee-plant-${x}`}
          position={[0.58 + x, 0.58, -0.12]}
          rotation={[0, 0, x * 2.5]}
        >
          <sphereGeometry args={[0.065, 10, 8]} />
          <meshStandardMaterial color="#52633c" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function AreaRug({ color = "#9b8a78", position, scale = [3.2, 0.025, 2.35] }) {
  return (
    <group position={position}>
      <RoundedBox
        receiveShadow
        args={scale}
        radius={0.06}
        smoothness={3}
      >
        <meshStandardMaterial color={color} roughness={1} />
      </RoundedBox>
      <mesh
        receiveShadow
        position={[0, scale[1] / 2 + 0.008, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[scale[0] - 0.09, scale[2] - 0.09]} />
        <meshStandardMaterial
          color="#f0e5d7"
          map={wovenRugTexture}
          roughness={1}
        />
      </mesh>
    </group>
  );
}

function FloorLamp({ position }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.08, 20]} />
        <meshStandardMaterial color="#282d2c" metalness={0.35} roughness={0.45} />
      </mesh>
      <mesh castShadow position={[0, 0.88, 0]}>
        <cylinderGeometry args={[0.026, 0.032, 1.62, 10]} />
        <meshStandardMaterial color="#353a38" metalness={0.45} roughness={0.36} />
      </mesh>
      <mesh castShadow position={[0, 1.62, 0]}>
        <cylinderGeometry args={[0.19, 0.3, 0.42, 18]} />
        <meshStandardMaterial
          color="#f0ddbd"
          emissive={colors.warmLight}
          emissiveIntensity={0.48}
          map={wovenRugTexture}
          roughness={0.92}
        />
      </mesh>
      <mesh position={[0, 1.58, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.23, 16]} />
        <meshStandardMaterial
          color="#fff2d1"
          emissive={colors.warmLight}
          emissiveIntensity={2.2}
        />
      </mesh>
      <pointLight color={colors.warmLight} distance={4.8} intensity={6.2} position={[0, 1.48, 0]} />
    </group>
  );
}

function MediaWall({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox castShadow args={[2.88, 0.4, 0.5]} position={[0, 0.27, 0]} radius={0.035}>
        <WalnutMaterial color="#53382a" roughness={0.66} />
      </RoundedBox>
      {[-0.78, 0, 0.78].map((x) => (
        <group key={x}>
          <Box
            color="#604233"
            edgeColor="#8e6a52"
            map={walnutFurnitureTexture}
            position={[x, 0.27, 0.27]}
            scale={[0.72, 0.26, 0.035]}
          />
          <Box
            color="#252b2a"
            metalness={0.62}
            position={[x, 0.27, 0.31]}
            roughness={0.32}
            scale={[0.18, 0.022, 0.022]}
          />
        </group>
      ))}
      <RoundedBox castShadow args={[2.68, 1.36, 0.1]} position={[0, 1.34, 0]} radius={0.035}>
        <meshStandardMaterial color="#151b1c" metalness={0.12} roughness={0.25} />
      </RoundedBox>
      <Box
        color="#0b1113"
        emissive="#264244"
        emissiveIntensity={0.46}
        position={[0, 1.35, 0.07]}
        scale={[2.46, 1.15, 0.025]}
      />
      <Box color="#0b1011" position={[0, 0.72, 0.055]} scale={[0.18, 0.22, 0.035]} />
      <RoundedBox castShadow args={[1.38, 0.11, 0.11]} position={[0, 0.61, 0.18]} radius={0.03}>
        <meshStandardMaterial color="#202728" metalness={0.25} roughness={0.36} />
      </RoundedBox>
      <Box color="#493124" map={walnutFurnitureTexture} position={[-1.18, 0.07, 0]} scale={[0.08, 0.14, 0.08]} />
      <Box color="#493124" map={walnutFurnitureTexture} position={[1.18, 0.07, 0]} scale={[0.08, 0.14, 0.08]} />
      <Box color="#8c7159" position={[0.92, 0.55, 0]} scale={[0.3, 0.05, 0.24]} />
      <Plant position={[-0.96, 0.5, 0]} scale={0.28} />
    </group>
  );
}

function SideTable({ position }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.43, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.08, 28]} />
        <WalnutMaterial color="#5a3d2d" roughness={0.62} />
      </mesh>
      <mesh castShadow position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.055, 0.07, 0.42, 14]} />
        <meshStandardMaterial color="#242b2a" metalness={0.5} roughness={0.38} />
      </mesh>
      <mesh castShadow position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.045, 24]} />
        <meshStandardMaterial color="#242b2a" metalness={0.42} roughness={0.42} />
      </mesh>
      <mesh castShadow position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.085, 0.07, 0.14, 18]} />
        <meshStandardMaterial color="#746b5e" roughness={0.82} />
      </mesh>
      {[-0.055, 0, 0.055].map((x) => (
        <mesh castShadow key={x} position={[x, 0.64, 0]}>
          <sphereGeometry args={[0.065, 10, 8]} />
          <meshStandardMaterial color="#50613a" roughness={0.92} />
        </mesh>
      ))}
    </group>
  );
}

function WarmGlassPendant({ position }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.84, 10]} />
        <meshStandardMaterial color="#202625" metalness={0.52} roughness={0.34} />
      </mesh>
      <mesh castShadow>
        <sphereGeometry args={[0.25, 24, 16]} />
        <meshPhysicalMaterial
          color="#c48a52"
          opacity={0.48}
          roughness={0.18}
          thickness={0.08}
          transparent
          transmission={0.25}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.065, 14, 10]} />
        <meshStandardMaterial
          color="#fff0c5"
          emissive={colors.warmLight}
          emissiveIntensity={3}
        />
      </mesh>
      <Box
        color="#202625"
        metalness={0.5}
        position={[0, 0.24, 0]}
        roughness={0.32}
        scale={[0.07, 0.08, 0.07]}
      />
      <pointLight color={colors.warmLight} distance={4.4} intensity={5.4} />
    </group>
  );
}

function DiningChair({ position, rotation }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <RoundedBox castShadow args={[0.46, 0.12, 0.43]} radius={0.035}>
        <meshStandardMaterial
          color="#d5cabc"
          map={wovenSeatTexture}
          roughness={1}
        />
        <Edges color="#e2d9cd" opacity={0.34} threshold={20} transparent />
      </RoundedBox>
      <RoundedBox
        castShadow
        args={[0.4, 0.42, 0.11]}
        position={[0, 0.37, 0.18]}
        radius={0.05}
      >
        <meshStandardMaterial
          color="#c9bfb2"
          map={wovenSeatTexture}
          roughness={1}
        />
        <Edges color="#ded3c7" opacity={0.32} threshold={20} transparent />
      </RoundedBox>
      {[-0.2, 0.2].map((x) => (
        <RoundedBox
          castShadow
          args={[0.055, 0.72, 0.055]}
          key={`back-frame-${x}`}
          position={[x, 0.08, 0.2]}
          radius={0.018}
        >
          <WalnutMaterial color="#5c3f2e" roughness={0.62} />
        </RoundedBox>
      ))}
      {[-0.18, 0.18].flatMap((x) => [-0.15, 0.15].map((z) => (
        <Box
          color="#5b3e2e"
          key={`chair-leg-${x}-${z}`}
          map={walnutFurnitureTexture}
          position={[x, -0.25, z]}
          scale={[0.055, 0.5, 0.055]}
        />
      )))}
      <RoundedBox
        castShadow
        args={[0.48, 0.055, 0.055]}
        position={[0, 0.6, 0.2]}
        radius={0.018}
      >
        <WalnutMaterial color="#5b3e2e" roughness={0.62} />
      </RoundedBox>
    </group>
  );
}

function PlaceSetting({ position }) {
  return (
    <group position={position}>
      <mesh castShadow rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.025, 24]} />
        <meshStandardMaterial color="#d4cec1" roughness={0.42} />
      </mesh>
      <mesh castShadow position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.018, 24]} />
        <meshStandardMaterial color="#eee8dc" roughness={0.38} />
      </mesh>
      <Box
        color="#9ba09d"
        metalness={0.72}
        position={[-0.205, 0.035, 0]}
        roughness={0.22}
        scale={[0.018, 0.018, 0.25]}
      />
      <Box
        color="#9ba09d"
        metalness={0.72}
        position={[0.205, 0.035, 0]}
        roughness={0.22}
        scale={[0.018, 0.018, 0.25]}
      />
      <mesh castShadow position={[0.18, 0.12, -0.14]}>
        <cylinderGeometry args={[0.052, 0.045, 0.2, 18]} />
        <meshPhysicalMaterial
          color="#c6d0cb"
          opacity={0.42}
          roughness={0.12}
          transparent
          transmission={0.2}
        />
      </mesh>
    </group>
  );
}

function DiningArea({ position }) {
  const chairPositions = [
    [-1.08, 0.43, 0, -Math.PI / 2],
    [1.08, 0.43, 0, Math.PI / 2],
    [-0.35, 0.43, -0.73, Math.PI],
    [0.35, 0.43, -0.73, Math.PI],
    [-0.35, 0.43, 0.73, 0],
    [0.35, 0.43, 0.73, 0],
  ];
  const settings = [
    [-0.67, 0],
    [0.67, 0],
    [-0.35, -0.3],
    [0.35, -0.3],
    [-0.35, 0.3],
    [0.35, 0.3],
  ];

  return (
    <group position={position}>
      <RoundedBox castShadow args={[1.92, 0.12, 1.08]} position={[0, 0.75, 0]} radius={0.035}>
        <WalnutMaterial color="#634331" roughness={0.58} />
      </RoundedBox>
      {[-0.72, 0.72].flatMap((x) => [-0.34, 0.34].map((z) => (
        <Box
          color="#5a3d2d"
          key={`table-leg-${x}-${z}`}
          map={walnutFurnitureTexture}
          position={[x, 0.36, z]}
          scale={[0.09, 0.7, 0.09]}
        />
      )))}
      <Box
        color="#513829"
        map={walnutFurnitureTexture}
        position={[0, 0.67, 0]}
        scale={[1.72, 0.12, 0.88]}
      />
      {chairPositions.map(([x, y, z, rotation], index) => (
        <DiningChair
          key={`dining-chair-${index}`}
          position={[x, y, z]}
          rotation={rotation}
        />
      ))}
      <Box color="#9f8b72" position={[0, 0.82, 0]} scale={[1.62, 0.018, 0.25]} />
      {settings.map(([x, z]) => (
        <PlaceSetting key={`setting-${x}-${z}`} position={[x, 0.825, z]} />
      ))}
      <mesh castShadow position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.05, 18]} />
        <meshStandardMaterial color="#8e8779" roughness={0.6} />
      </mesh>
      <Plant position={[0, 0.83, 0]} scale={0.38} />
      <WarmGlassPendant position={[0, 2.1, 0]} />
    </group>
  );
}

function StudyArea({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox castShadow args={[1.7, 0.12, 0.72]} position={[0, 0.72, 0]} radius={0.035}>
        <meshStandardMaterial color="#594233" roughness={0.7} />
      </RoundedBox>
      {[-0.62, 0.62].map((x) => (
        <Box
          color="#282f2e"
          key={x}
          position={[x, 0.36, 0]}
          scale={[0.06, 0.7, 0.06]}
        />
      ))}
      <Box color="#171d1e" position={[0, 1.1, -0.1]} scale={[0.92, 0.58, 0.08]} />
      <Box
        color="#20383a"
        emissive="#3d777b"
        emissiveIntensity={0.48}
        position={[0, 1.1, -0.05]}
        scale={[0.78, 0.44, 0.025]}
      />
      <Box color="#303736" position={[0, 0.86, -0.1]} scale={[0.06, 0.28, 0.06]} />
      <Box color="#2d3433" position={[0, 0.81, -0.02]} scale={[0.34, 0.035, 0.18]} />
      <RoundedBox castShadow args={[0.12, 0.04, 0.17]} position={[0.36, 0.81, 0]} radius={0.025}>
        <meshStandardMaterial color="#343b3a" roughness={0.5} />
      </RoundedBox>
      <group position={[-0.5, 0.83, 0.02]} rotation={[0, 0.12, 0]}>
        <Box color="#917d65" position={[0, 0, 0]} scale={[0.35, 0.035, 0.22]} />
        <Box color="#5c493a" position={[0, 0.035, 0]} scale={[0.31, 0.025, 0.19]} />
      </group>
      <RoundedBox castShadow args={[0.42, 0.64, 0.58]} position={[-0.61, 0.34, -0.04]} radius={0.035}>
        <meshStandardMaterial color="#49433d" roughness={0.8} />
      </RoundedBox>
      {[-0.12, 0.12].map((y) => (
        <Box
          color="#575048"
          edgeColor="#70675d"
          key={y}
          position={[-0.61, 0.34 + y, 0.27]}
          scale={[0.34, 0.22, 0.025]}
        />
      ))}
      <group position={[0, 0.34, 0.75]}>
        <RoundedBox castShadow args={[0.56, 0.12, 0.52]} radius={0.035}>
          <meshStandardMaterial color="#676056" roughness={0.84} />
        </RoundedBox>
        <RoundedBox castShadow args={[0.56, 0.68, 0.12]} position={[0, 0.36, 0.22]} radius={0.035}>
          <meshStandardMaterial color="#5b554d" roughness={0.86} />
        </RoundedBox>
        <mesh castShadow position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.055, 0.065, 0.38, 10]} />
          <meshStandardMaterial color="#282f2e" metalness={0.3} roughness={0.5} />
        </mesh>
        <mesh castShadow position={[0, -0.39, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.24, 0.025, 8, 20]} />
          <meshStandardMaterial color="#282f2e" metalness={0.3} roughness={0.5} />
        </mesh>
      </group>
      <FloorLamp position={[1.15, 0, -0.2]} />
    </group>
  );
}

function Wardrobe({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <Box color="#403a35" position={[0, 2.16, 0]} scale={[1.86, 0.12, 0.72]} />
      <Box color="#3c3732" position={[0, 0.06, 0]} scale={[1.86, 0.12, 0.72]} />
      {[-0.58, 0, 0.58].map((x) => (
        <group key={x}>
          <Box color="#4f4942" position={[x, 1.05, 0]} scale={[0.54, 2.1, 0.62]} />
          <Box
            color="#5d554c"
            edgeColor="#72685d"
            position={[x, 1.05, 0.33]}
            scale={[0.49, 2.02, 0.035]}
          />
          {x === 0 && (
            <Box
              color="#717b78"
              edgeColor="#8f9995"
              metalness={0.48}
              position={[x, 1.12, 0.375]}
              roughness={0.22}
              scale={[0.38, 1.65, 0.018]}
            />
          )}
          <Box
            color="#b1a483"
            metalness={0.46}
            position={[x + 0.16, 1.05, 0.37]}
            scale={[0.025, 0.28, 0.025]}
          />
        </group>
      ))}
    </group>
  );
}

function InteriorDoor({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <Box color="#3c3029" edgeColor="#746152" scale={[0.92, 2.18, 0.11]} />
      <Box color="#46372e" position={[0, 0, 0.07]} scale={[0.78, 2, 0.04]} />
      <mesh castShadow position={[0.28, -0.08, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.16, 12]} />
        <meshStandardMaterial color="#b79b68" metalness={0.62} roughness={0.3} />
      </mesh>
    </group>
  );
}

function CabinetFront({
  position,
  pull = "horizontal",
  scale,
}) {
  const pullScale = pull === "vertical"
    ? [0.025, Math.min(0.3, scale[1] * 0.42), 0.022]
    : [Math.min(0.28, scale[0] * 0.42), 0.025, 0.022];

  return (
    <group>
      <Box
        color="#776d64"
        edgeColor="#9b8f83"
        position={position}
        roughness={0.76}
        scale={scale}
      />
      <Box
        color="#252b2a"
        metalness={0.62}
        position={[position[0], position[1], position[2] + scale[2] / 2 + 0.025]}
        roughness={0.3}
        scale={pullScale}
      />
    </group>
  );
}

function BarStool({ position }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.1, 24]} />
        <WalnutMaterial color="#624431" roughness={0.6} />
      </mesh>
      {[-0.14, 0.14].flatMap((x) => [-0.14, 0.14].map((z) => (
        <Box
          color="#242a29"
          key={`stool-leg-${x}-${z}`}
          metalness={0.48}
          position={[x, 0.27, z]}
          roughness={0.36}
          scale={[0.035, 0.5, 0.035]}
        />
      )))}
      <mesh castShadow position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.02, 8, 24]} />
        <meshStandardMaterial color="#242a29" metalness={0.48} roughness={0.36} />
      </mesh>
    </group>
  );
}

function Kitchen({ position }) {
  return (
    <group position={position}>
      <Box color="#6b645e" position={[0.42, 0.5, -0.57]} scale={[2.12, 0.98, 0.64]} />
      <CabinetFront position={[-0.42, 0.52, -0.225]} pull="vertical" scale={[0.48, 0.84, 0.055]} />
      <CabinetFront position={[0.55, 0.36, -0.225]} scale={[0.48, 0.24, 0.055]} />
      <CabinetFront position={[0.55, 0.64, -0.225]} scale={[0.48, 0.24, 0.055]} />
      <CabinetFront position={[1.09, 0.52, -0.225]} pull="vertical" scale={[0.5, 0.84, 0.055]} />
      <Box
        color="#f4eee4"
        map={lightQuartzTexture}
        position={[0.42, 1.035, -0.56]}
        roughness={0.48}
        scale={[2.26, 0.11, 0.76]}
      />
      <Box
        color="#d7cfc4"
        emissive={colors.warmLight}
        emissiveIntensity={0.12}
        map={lightQuartzTexture}
        position={[0.42, 1.38, -0.905]}
        roughness={0.68}
        scale={[2.24, 0.58, 0.045]}
      />

      {[-0.48, 0.22, 0.92].map((x) => (
        <group key={`upper-${x}`}>
          <Box color="#6e665f" position={[x, 1.96, -0.69]} scale={[0.62, 0.72, 0.48]} />
          <CabinetFront
            position={[x, 1.96, -0.425]}
            pull="vertical"
            scale={[0.56, 0.64, 0.045]}
          />
        </group>
      ))}
      <Box color="#6e665f" position={[-1.16, 2.25, -0.69]} scale={[0.72, 0.42, 0.48]} />
      <CabinetFront
        position={[-1.16, 2.25, -0.425]}
        scale={[0.64, 0.34, 0.045]}
      />

      <Box
        color="#f0b96e"
        emissive={colors.warmLight}
        emissiveIntensity={2.2}
        position={[0.46, 1.62, -0.43]}
        scale={[2.1, 0.025, 0.035]}
      />

      <Box
        color="#747d7b"
        edgeColor="#aeb5b1"
        metalness={0.62}
        position={[-1.16, 1.12, -0.57]}
        roughness={0.24}
        scale={[0.72, 2.22, 0.72]}
      />
      <Box
        color="#87908d"
        edgeColor="#b7c0bc"
        metalness={0.64}
        position={[-1.33, 1.18, -0.185]}
        roughness={0.22}
        scale={[0.33, 2.02, 0.035]}
      />
      <Box
        color="#87908d"
        edgeColor="#b7c0bc"
        metalness={0.64}
        position={[-0.99, 1.18, -0.185]}
        roughness={0.22}
        scale={[0.33, 2.02, 0.035]}
      />
      <Box color="#b9c2be" metalness={0.72} position={[-1.05, 1.18, -0.14]} roughness={0.2} scale={[0.025, 0.72, 0.035]} />
      <Box color="#b9c2be" metalness={0.72} position={[-1.27, 1.18, -0.14]} roughness={0.2} scale={[0.025, 0.72, 0.035]} />
      <Box color="#303736" position={[-1.16, 0.9, -0.13]} scale={[0.22, 0.28, 0.035]} />
      <Box color="#0f1415" position={[-1.16, 1.23, -0.13]} scale={[0.34, 0.018, 0.02]} />

      <group position={[0.03, 0, 0]}>
        <Box color="#303535" position={[0, 0.52, -0.19]} scale={[0.66, 0.84, 0.12]} />
        <Box
          color="#111718"
          edgeColor="#69716f"
          position={[0, 0.54, -0.12]}
          scale={[0.54, 0.52, 0.035]}
        />
        <Box color="#89908d" metalness={0.56} position={[0, 0.86, -0.12]} roughness={0.25} scale={[0.5, 0.12, 0.035]} />
        {[-0.19, -0.06, 0.06, 0.19].map((x) => (
          <mesh castShadow key={`oven-control-${x}`} position={[x, 0.86, -0.08]}>
            <cylinderGeometry args={[0.035, 0.035, 0.04, 14]} />
            <meshStandardMaterial color="#b3bbb7" metalness={0.65} roughness={0.22} />
          </mesh>
        ))}
        <Box color="#202626" position={[0, 1.075, -0.54]} scale={[0.68, 0.035, 0.48]} />
        {[-0.18, 0.18].flatMap((x) => [-0.13, 0.13].map((z) => (
          <mesh
            castShadow
            key={`range-burner-${x}-${z}`}
            position={[x, 1.1, -0.54 + z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[0.1, 0.014, 8, 20]} />
            <meshStandardMaterial color="#69716f" metalness={0.4} roughness={0.38} />
          </mesh>
        )))}
        <Box color="#54504b" position={[0, 2.02, -0.68]} scale={[0.76, 0.14, 0.5]} />
        <Box color="#323838" position={[0, 1.88, -0.47]} scale={[0.62, 0.16, 0.06]} />
        {[-0.22, -0.11, 0, 0.11, 0.22].map((x) => (
          <Box
            color="#151a1b"
            key={`hood-slat-${x}`}
            position={[x, 1.88, -0.43]}
            scale={[0.055, 0.1, 0.018]}
          />
        ))}
      </group>

      <RoundedBox
        castShadow
        args={[0.46, 0.045, 0.34]}
        position={[0.98, 1.095, -0.54]}
        radius={0.02}
      >
        <meshStandardMaterial color="#242b2a" metalness={0.48} roughness={0.3} />
      </RoundedBox>
      <mesh castShadow position={[0.98, 1.18, -0.54]}>
        <torusGeometry args={[0.18, 0.035, 8, 18, Math.PI]} />
        <meshStandardMaterial color="#b9c2be" metalness={0.72} roughness={0.2} />
      </mesh>
      <mesh castShadow position={[1.16, 1.32, -0.54]}>
        <cylinderGeometry args={[0.025, 0.025, 0.28, 12]} />
        <meshStandardMaterial color="#242b2a" metalness={0.5} roughness={0.28} />
      </mesh>

      <RoundedBox castShadow args={[2.12, 0.88, 1.02]} position={[0.38, 0.5, 1.04]} radius={0.045}>
        <meshStandardMaterial color="#70675f" roughness={0.72} />
      </RoundedBox>
      <Box
        color="#f5efe5"
        map={lightQuartzTexture}
        position={[0.38, 0.99, 1.04]}
        roughness={0.45}
        scale={[2.24, 0.11, 1.12]}
      />
      {[-0.23, 0.37, 0.97].map((x) => (
        <CabinetFront
          key={`island-front-${x}`}
          position={[x, 0.5, 1.575]}
          pull="vertical"
          scale={[0.5, 0.72, 0.05]}
        />
      ))}

      <mesh castShadow position={[-0.28, 1.1, 1.05]}>
        <cylinderGeometry args={[0.16, 0.14, 0.06, 24]} />
        <meshStandardMaterial color="#817a6d" roughness={0.62} />
      </mesh>
      {[
        [-0.34, "#6c7c3a"],
        [-0.26, "#809145"],
        [-0.2, "#687638"],
      ].map(([x, color]) => (
        <mesh castShadow key={`fruit-${x}`} position={[x, 1.2, 1.05]}>
          <sphereGeometry args={[0.085, 12, 10]} />
          <meshStandardMaterial color={color} roughness={0.86} />
        </mesh>
      ))}
      <Plant position={[0.75, 1.05, 1.02]} scale={0.28} />
      <mesh castShadow position={[0.18, 1.11, 0.82]}>
        <cylinderGeometry args={[0.075, 0.065, 0.12, 18]} />
        <meshStandardMaterial color="#d1c8b8" roughness={0.52} />
      </mesh>

      <BarStool position={[-0.18, 0.04, 1.84]} />
      <BarStool position={[0.72, 0.04, 1.84]} />
      <WarmGlassPendant position={[-0.16, 2.34, 1.02]} />
      <WarmGlassPendant position={[0.7, 2.34, 1.02]} />
    </group>
  );
}

function Bed({ position }) {
  return (
    <group position={position}>
      <RoundedBox castShadow args={[2.15, 0.48, 2.55]} position={[0, 0.35, 0]} radius={0.07}>
        <meshStandardMaterial color="#5d5953" roughness={0.96} />
      </RoundedBox>
      <RoundedBox castShadow args={[2.02, 0.26, 2.35]} position={[0, 0.66, -0.02]} radius={0.05}>
        <meshStandardMaterial color="#a8a297" roughness={1} />
      </RoundedBox>
      <RoundedBox castShadow args={[1.96, 0.12, 1.42]} position={[0, 0.83, -0.3]} radius={0.06}>
        <meshStandardMaterial color="#8c857a" roughness={1} />
      </RoundedBox>
      <RoundedBox castShadow args={[1.96, 0.1, 0.48]} position={[0, 0.87, -0.92]} radius={0.05}>
        <meshStandardMaterial color="#5f554b" roughness={1} />
      </RoundedBox>
      <RoundedBox castShadow args={[2.18, 1.05, 0.18]} position={[0, 0.86, 1.16]} radius={0.04}>
        <meshStandardMaterial color="#4d4945" roughness={0.92} />
      </RoundedBox>
      {[-0.69, 0, 0.69].map((x) => (
        <Box
          color="#5b5550"
          edgeColor="#716a63"
          key={`headboard-${x}`}
          position={[x, 0.9, 1.27]}
          scale={[0.58, 0.82, 0.025]}
        />
      ))}
      {[-0.52, 0.52].map((x) => (
        <RoundedBox
          castShadow
          args={[0.85, 0.18, 0.48]}
          key={x}
          position={[x, 0.86, 0.7]}
          radius={0.08}
        >
          <meshStandardMaterial color="#d0cbc0" roughness={1} />
        </RoundedBox>
      ))}
      {[-1.35, 1.35].map((x) => (
        <group key={x} position={[x, 0.3, 0.76]}>
          <Box color={colors.woodDark} position={[0, 0.12, 0]} scale={[0.48, 0.24, 0.45]} />
          <mesh castShadow position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.16, 0.23, 0.35, 14]} />
            <meshStandardMaterial
              color="#ae9978"
              emissive={colors.warmLight}
              emissiveIntensity={0.32}
            />
          </mesh>
        </group>
      ))}
      {[-0.88, 0.88].flatMap((x) => [-0.9, 0.9].map((z) => (
        <Box
          color="#352e29"
          key={`bed-leg-${x}-${z}`}
          position={[x, 0.08, z]}
          scale={[0.07, 0.16, 0.07]}
        />
      )))}
    </group>
  );
}

function WoodFloor({ position, scale = [8.8, 0.2, 6.25] }) {
  return (
    <group position={position}>
      <Box color={colors.woodDark} edgeColor="#846a55" scale={scale} />
      <mesh
        receiveShadow
        position={[0, scale[1] / 2 + 0.014, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[scale[0] - 0.05, scale[2] - 0.05]} />
        <meshStandardMaterial map={oakFloorTexture} metalness={0.02} roughness={0.66} />
      </mesh>
    </group>
  );
}

function Resident({ color = "#8ca4a0", position, rotation = 0, scale = 1 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh castShadow position={[0, 0.86, 0]}>
        <capsuleGeometry args={[0.14, 0.62, 6, 12]} />
        <meshStandardMaterial color={color} roughness={0.82} />
      </mesh>
      <mesh castShadow position={[0, 1.38, 0]}>
        <sphereGeometry args={[0.19, 18, 12]} />
        <meshStandardMaterial color="#b98968" roughness={0.82} />
      </mesh>
      {[-0.1, 0.1].map((x) => (
        <mesh castShadow key={x} position={[x, 0.33, 0]} rotation={[0, 0, x * 0.65]}>
          <capsuleGeometry args={[0.055, 0.5, 4, 8]} />
          <meshStandardMaterial color="#303838" roughness={0.86} />
        </mesh>
      ))}
    </group>
  );
}

function Pet({ position }) {
  return (
    <group position={position} scale={0.72}>
      <mesh castShadow position={[0, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.18, 0.5, 5, 10]} />
        <meshStandardMaterial color="#b7a68d" roughness={0.92} />
      </mesh>
      <mesh castShadow position={[0.36, 0.38, 0]}>
        <sphereGeometry args={[0.2, 14, 10]} />
        <meshStandardMaterial color="#c2af91" roughness={0.92} />
      </mesh>
      {[-0.09, 0.13].map((z) => (
        <mesh castShadow key={z} position={[0.46, 0.58, z]} rotation={[0, 0, -0.2]}>
          <coneGeometry args={[0.08, 0.18, 8]} />
          <meshStandardMaterial color="#8f7e68" roughness={0.95} />
        </mesh>
      ))}
      <mesh castShadow position={[-0.45, 0.4, 0]} rotation={[0, 0, -0.65]}>
        <capsuleGeometry args={[0.045, 0.34, 4, 8]} />
        <meshStandardMaterial color="#b7a68d" roughness={0.92} />
      </mesh>
    </group>
  );
}

function SensorBeacon({ delay = 0, position }) {
  const pulseRef = useRef(null);

  useFrame(({ clock }) => {
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.4 + delay) * 0.14;
    pulseRef.current?.scale.setScalar(pulse);
  });

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.028, 8, 28]} />
        <meshBasicMaterial color="#3ce8eb" transparent opacity={0.92} />
      </mesh>
      <mesh ref={pulseRef} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.33, 0.014, 8, 28]} />
        <meshBasicMaterial color="#3ce8eb" transparent opacity={0.32} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.07, 12, 8]} />
        <meshBasicMaterial color="#b9ffff" />
      </mesh>
      <pointLight color="#3ce8eb" distance={2.4} intensity={2.6} />
    </group>
  );
}

function LivingSignals({ dynamicsRef, residentsRef, sensorsRef }) {
  return (
    <>
      <group ref={residentsRef}>
        <Resident color="#859894" position={[-0.55, 0.1, 1.35]} rotation={-0.55} />
        <Resident color="#ad876f" position={[2.55, 0.1, -0.55]} rotation={0.25} scale={0.94} />
        <Pet position={[-0.55, 0.08, 2.25]} />
      </group>
      <group ref={sensorsRef}>
        <SensorBeacon delay={0} position={[-2.95, 0.22, 1.9]} />
        <SensorBeacon delay={1.6} position={[-0.3, 0.22, -0.35]} />
        <SensorBeacon delay={3.1} position={[2.75, 0.22, -1.18]} />
        <SensorBeacon delay={4.2} position={[3.55, 0.22, 2.15]} />
      </group>
      <group ref={dynamicsRef}>
        <Line
          color="#3ce8eb"
          dashed
          dashScale={2.2}
          dashSize={0.18}
          gapSize={0.12}
          lineWidth={1}
          points={[[-2.95, 0.28, 1.9], [-0.3, 0.28, -0.35], [2.75, 0.28, -1.18]]}
          transparent
          opacity={0.54}
        />
        <Line
          color={colors.accent}
          dashed
          dashScale={2}
          dashSize={0.15}
          gapSize={0.12}
          lineWidth={1}
          points={[[-0.3, 0.3, -0.35], [1.1, 0.3, 0.75], [3.55, 0.3, 2.15]]}
          transparent
          opacity={0.42}
        />
      </group>
    </>
  );
}

function GroundFloor({ dynamicsRef, residentsRef, sensorsRef, shellRef }) {
  return (
    <group name="GroundFloor">
      <WoodFloor position={[0, 0, 0]} />
      <Box position={[-4.36, 1.35, 0]} scale={[0.18, 2.7, 6.25]} />
      <Box position={[0, 1.35, -3.04]} scale={[8.8, 2.7, 0.18]} />
      <Box color="#c1b8aa" position={[-4.22, 2.67, 0]} scale={[0.08, 0.09, 6.05]} />
      <Box color="#c1b8aa" position={[0, 2.67, -2.9]} scale={[8.58, 0.09, 0.08]} />

      <group name="GroundCutawayShell" ref={shellRef}>
        <Box position={[-3.7, 1.35, 3.04]} scale={[1.32, 2.7, 0.18]} />
        <Box position={[-1.6, 2.24, 3.04]} scale={[2.88, 0.92, 0.18]} />
        <Box position={[0.03, 1.35, 3.04]} scale={[0.38, 2.7, 0.18]} />
        <Box position={[1.22, 2.24, 3.04]} scale={[2, 0.92, 0.18]} />
        <Box position={[2.85, 1.35, 3.04]} scale={[1.28, 2.7, 0.18]} />
        <Box position={[4.08, 2.24, 3.04]} scale={[0.56, 0.92, 0.18]} />

        <Box position={[4.36, 1.35, -2.35]} scale={[0.18, 2.7, 1.55]} />
        <Box position={[4.36, 2.24, -1.02]} scale={[0.18, 0.92, 1.1]} />
        <Box position={[4.36, 1.35, -0.04]} scale={[0.18, 2.7, 0.65]} />
        <Box position={[4.36, 2.24, 1.3]} scale={[0.18, 0.92, 2.05]} />
        <Box position={[4.36, 1.35, 2.55]} scale={[0.18, 2.7, 0.82]} />

        <Box color={colors.charcoal} position={[0, 2.7, 3.06]} scale={[8.95, 0.18, 0.22]} />
        <Box color={colors.charcoal} position={[4.38, 2.7, 0]} scale={[0.22, 0.18, 6.35]} />

        <WarmWindow position={[-1.55, 1.35, 3.18]} scale={[1.3, 0.84, 1]} />
        <FrontDoor position={[1.2, 1.08, 3.18]} />
        <WarmWindow position={[3.55, 1.35, 3.18]} scale={[0.94, 0.84, 1]} />
        <WarmWindow
          position={[4.48, 1.35, -1.02]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[0.85, 0.84, 1]}
        />
        <WarmWindow
          position={[4.48, 1.35, 1.3]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[1.25, 0.84, 1]}
        />
      </group>

      <AreaRug color="#9a8875" position={[-2.85, 0.13, 0.5]} scale={[2.35, 0.035, 3.25]} />
      <Sofa
        position={[-1.62, 0.14, 0.48]}
        rotation={[0, Math.PI / 2, 0]}
        width={2.62}
      />
      <Sofa
        cushionCount={2}
        hasThrow
        position={[-2.72, 0.14, -1.72]}
        rotation={[0, Math.PI, 0]}
        width={1.92}
      />
      <CoffeeTable
        position={[-2.83, 0.08, 0.48]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <MediaWall
        position={[-4.12, 0.08, 0.48]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <FloorLamp position={[-3.82, 0.08, -2.25]} />
      <SideTable position={[-1.56, 0.08, -1.72]} />
      <Plant position={[-3.65, 0.08, 2.48]} tall />

      <Kitchen position={[2.35, 0.05, -1.86]} />
      <DiningArea position={[2.62, 0.06, 1.75]} />
      <Plant position={[3.85, 0.08, 2.48]} />
      <LivingSignals
        dynamicsRef={dynamicsRef}
        residentsRef={residentsRef}
        sensorsRef={sensorsRef}
      />

      <pointLight color={colors.warmLight} distance={7} intensity={9} position={[-2.2, 2, 1]} />
      <pointLight color={colors.warmLight} distance={6} intensity={7} position={[2.4, 2, -1.3]} />
    </group>
  );
}

function UpperFloor({ shellRef }) {
  return (
    <group name="UpperFloor" position={[0, 2.78, 0]}>
      <WoodFloor position={[0, 0, 0]} />
      <Box position={[-4.36, 1.35, 0]} scale={[0.18, 2.7, 6.25]} />
      <Box position={[0, 1.35, -3.04]} scale={[8.8, 2.7, 0.18]} />

      <group name="UpperCutawayShell" ref={shellRef}>
        <Box position={[-3.65, 1.35, 3.04]} scale={[1.42, 2.7, 0.18]} />
        <Box position={[-2.08, 2.24, 3.04]} scale={[1.7, 0.92, 0.18]} />
        <Box position={[-0.52, 1.35, 3.04]} scale={[1.4, 2.7, 0.18]} />
        <Box position={[1.28, 2.24, 3.04]} scale={[2.2, 0.92, 0.18]} />
        <Box position={[3.12, 1.35, 3.04]} scale={[1.48, 2.7, 0.18]} />
        <Box position={[4.15, 2.24, 3.04]} scale={[0.54, 0.92, 0.18]} />

        <Box position={[4.36, 1.35, -2.3]} scale={[0.18, 2.7, 1.62]} />
        <Box position={[4.36, 2.24, -0.92]} scale={[0.18, 0.92, 1.2]} />
        <Box position={[4.36, 1.35, 0.04]} scale={[0.18, 2.7, 0.72]} />
        <Box position={[4.36, 2.24, 1.48]} scale={[0.18, 0.92, 2.16]} />
        <Box position={[4.36, 1.35, 2.7]} scale={[0.18, 2.7, 0.65]} />

        <WarmWindow position={[-2.1, 1.35, 3.18]} scale={[0.92, 0.84, 1]} />
        <WarmWindow position={[1.25, 1.35, 3.18]} scale={[1.42, 0.84, 1]} />
        <WarmWindow
          position={[4.48, 1.35, -0.92]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[0.9, 0.84, 1]}
        />
        <WarmWindow
          position={[4.48, 1.35, 1.48]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[1.3, 0.84, 1]}
        />
      </group>

      <Box
        color="#b9b2a8"
        map={warmClayPlasterTexture}
        position={[0.12, 1.25, -0.35]}
        scale={[0.15, 2.5, 5.4]}
      />
      <Box
        color="#b9b2a8"
        map={warmClayPlasterTexture}
        position={[-2.15, 1.25, 0.05]}
        scale={[4.4, 2.5, 0.14]}
      />
      <Box
        color="#b9b2a8"
        map={warmClayPlasterTexture}
        position={[2.18, 1.25, 0.55]}
        scale={[4.2, 2.5, 0.14]}
      />
      <Box color="#beb3a3" position={[0.12, 2.48, -0.35]} scale={[0.08, 0.08, 5.22]} />
      <Box color="#beb3a3" position={[-2.15, 2.48, 0.05]} scale={[4.2, 0.08, 0.08]} />
      <Box color="#beb3a3" position={[2.18, 2.48, 0.55]} scale={[4, 0.08, 0.08]} />

      <Bed position={[-2.1, 0.05, 1.4]} />
      <AreaRug color="#8f8175" position={[-2.1, 0.13, 1.36]} scale={[3.3, 0.03, 2.75]} />
      <Wardrobe position={[-3.2, 0.05, -2.55]} />
      <StudyArea position={[2.3, 0.05, 1.65]} rotation={[0, Math.PI, 0]} />
      <DiningArea position={[2.35, 0.05, -1.55]} />
      <InteriorDoor position={[-0.02, 1.08, 1.3]} rotation={[0, Math.PI / 2, 0]} />
      <Plant position={[3.65, 0.08, -2.25]} tall />
      <pointLight color={colors.warmLight} distance={6} intensity={8} position={[-2.1, 2, 1.3]} />
      <pointLight color={colors.warmLight} distance={5} intensity={5} position={[2.2, 2, 1.2]} />
    </group>
  );
}

function RoofTiles({ side }) {
  const slope = 0.53;
  const z = side * 1.55;

  return (
    <group>
      <Box
        color={colors.roof}
        edgeColor="#6b7774"
        metalness={0.08}
        position={[0, 6.22, z]}
        rotation={[side * slope, 0, 0]}
        roughness={0.82}
        scale={[9.4, 0.18, 3.85]}
      />
      {Array.from({ length: 13 }, (_, index) => (
        <Box
          color="#4b5654"
          key={index}
          opacity={0.76}
          position={[-4.3 + index * 0.72, 6.33, z]}
          rotation={[side * slope, 0, 0]}
          scale={[0.018, 0.035, 3.75]}
        />
      ))}
      {Array.from({ length: 8 }, (_, index) => {
        const localZ = -1.55 + index * 0.44;
        return (
          <Box
            color="#596360"
            key={index}
            opacity={0.62}
            position={[
              0,
              6.22 - side * localZ * Math.sin(slope),
              z + localZ * Math.cos(slope),
            ]}
            rotation={[side * slope, 0, 0]}
            scale={[9.2, 0.028, 0.025]}
          />
        );
      })}
    </group>
  );
}

function Roof() {
  return (
    <group name="Roof">
      <RoofTiles side={1} />
      <RoofTiles side={-1} />
      <Box color="#6e7774" position={[0, 7.07, 0]} scale={[9.48, 0.12, 0.16]} />
      <Box
        color="#333d3b"
        edgeColor="#707a77"
        position={[2.7, 6.7, -0.65]}
        scale={[0.65, 1.45, 0.65]}
      />
      <Box color="#242c2b" position={[2.7, 7.47, -0.65]} scale={[0.78, 0.16, 0.78]} />
      <group position={[-1.9, 6.58, 1.1]} rotation={[0.53, 0, 0]}>
        <Box color={colors.darkMetal} scale={[1.18, 0.08, 0.75]} />
        <Box
          color="#29464c"
          emissive="#43717a"
          emissiveIntensity={0.25}
          position={[0, -0.06, 0]}
          scale={[1.02, 0.04, 0.59]}
        />
      </group>
    </group>
  );
}

function Site() {
  const patioX = 5.18;
  const patioZ = 1.72;

  return (
    <group name="Site">
      <RoundedBox receiveShadow args={[13.8, 0.38, 10.8]} position={[0.5, -0.34, 0.45]} radius={0.18}>
        <meshStandardMaterial color="#1e2823" roughness={1} />
      </RoundedBox>

      <Box
        color="#303635"
        map={darkSlateTexture}
        position={[1.2, -0.1, 4.75]}
        roughness={0.94}
        scale={[2.25, 0.1, 3.35]}
      />
      {Array.from({ length: 5 }, (_, row) => (
        <Box
          color="#1f2625"
          key={row}
          position={[1.2, -0.035, 3.6 + row * 0.63]}
          scale={[2.18, 0.018, 0.025]}
        />
      ))}
      <Box
        color="#111817"
        metalness={0.36}
        position={[1.2, -0.005, 4.18]}
        scale={[2.28, 0.035, 0.11]}
      />
      {Array.from({ length: 8 }, (_, index) => (
        <Box
          color="#4d5552"
          key={index}
          metalness={0.32}
          position={[0.26 + index * 0.27, 0.017, 4.18]}
          scale={[0.035, 0.02, 0.12]}
        />
      ))}
      <EntrySteps position={[1.2, 0, 3.43]} />
      <EntryWallLight position={[0.43, 1.62, 3.33]} />

      <Box
        color="#303635"
        map={darkSlateTexture}
        position={[patioX, -0.08, patioZ]}
        roughness={0.94}
        scale={[3.25, 0.1, 3.55]}
      />
      {[-1.1, -0.36, 0.38, 1.12].map((x) => (
        <Box
          color="#1f2625"
          key={`patio-x-${x}`}
          position={[patioX + x, -0.016, patioZ]}
          scale={[0.025, 0.018, 3.46]}
        />
      ))}
      {[-1.35, -0.68, 0, 0.68, 1.35].map((z) => (
        <Box
          color="#1f2625"
          key={`patio-z-${z}`}
          position={[patioX, -0.016, patioZ + z]}
          scale={[3.17, 0.018, 0.025]}
        />
      ))}
      <OutdoorTable position={[patioX, 0, patioZ]} />

      <Box color="#30281f" position={[4.9, -0.1, 3.72]} scale={[4.15, 0.12, 0.58]} />
      <Box color="#30281f" position={[6.55, -0.1, 1.45]} scale={[0.62, 0.12, 4.25]} />
      <Box color="#696b65" position={[4.9, -0.01, 3.43]} scale={[4.25, 0.12, 0.11]} />
      <Box color="#696b65" position={[6.25, -0.01, 1.45]} scale={[0.11, 0.12, 4.3]} />

      {[-1.55, -0.8, 0, 0.8, 1.55].map((offset, index) => (
        <GardenShrub
          key={`back-${offset}`}
          position={[4.9 + offset, -0.02, 3.68]}
          scale={index % 2 ? 0.86 : 1.04}
          tone={index}
        />
      ))}
      {[-1.38, -0.64, 0.1, 0.84].map((offset, index) => (
        <GardenShrub
          key={`side-${offset}`}
          position={[6.56, -0.02, 1.35 + offset]}
          scale={index % 2 ? 0.8 : 0.96}
          tone={index + 1}
        />
      ))}
      <GardenGrass position={[3.72, -0.02, 3.69]} scale={0.9} />
      <GardenGrass position={[5.32, -0.02, 3.68]} scale={1.08} />
      <GardenGrass position={[6.56, -0.02, 0.36]} scale={0.92} />
      <GardenGrass position={[6.56, -0.02, 2.5]} scale={1.04} />

      <GardenFence length={4.6} position={[4.85, 0, -3.92]} />
      <Hedge count={12} position={[-1.9, 0, 4.25]} />
      <Tree position={[5.75, -0.12, -2.35]} />
      <Plant position={[-5.05, -0.05, 2.8]} scale={1.2} tall />
      <GardenLight position={[3.15, 0, 3.35]} />
      <GardenLight position={[6.08, 0, 3.3]} />
      <GardenLight position={[6.12, 0, -0.45]} />
      <GardenLight position={[0.05, 0, 5.82]} />
    </group>
  );
}

function AnimatedHouse({ progressRef, staticProgress }) {
  const houseRef = useRef(null);
  const siteRef = useRef(null);
  const groundRef = useRef(null);
  const upperRef = useRef(null);
  const upperShellRef = useRef(null);
  const roofRef = useRef(null);
  const shellRef = useRef(null);
  const residentsRef = useRef(null);
  const sensorsRef = useRef(null);
  const dynamicsRef = useRef(null);

  useFrame(({ camera, clock }) => {
    const progress = progressRef?.current ?? staticProgress;
    const enter = phase(progress, 0, 0.13);
    const explode = phase(progress, 0.13, 0.34);
    const xray = phase(progress, 0.32, 0.5);
    const focus = phase(progress, 0.48, 0.68);
    const activate = phase(progress, 0.66, 0.84);
    const sensors = phase(progress, 0.72, 0.86);
    const dynamics = phase(progress, 0.82, 0.98);

    const scale = MathUtils.lerp(0.72, 0.92, enter) + focus * 0.08;
    houseRef.current.scale.setScalar(scale);
    houseRef.current.position.set(
      MathUtils.lerp(1.8, -0.2, enter) + focus * 0.3,
      MathUtils.lerp(-0.55, 0.15, enter) - focus * 0.04,
      MathUtils.lerp(-0.8, 0, enter),
    );
    houseRef.current.rotation.y = MathUtils.lerp(-0.78, -0.56, enter) + focus * 0.08;

    roofRef.current.position.set(
      explode * 0.25 + focus * 0.8,
      explode * 5.8 + focus * 4.8,
      -explode * 0.25,
    );
    roofRef.current.rotation.y = -xray * 0.04;

    upperRef.current.position.set(
      -explode * 0.2 - focus * 0.55,
      explode * 2.8 + focus * 3.65,
      explode * 0.08,
    );
    upperRef.current.rotation.y = xray * 0.035;
    upperShellRef.current.position.y = -explode * 1.7;

    groundRef.current.position.set(focus * 0.22, focus * 0.08, focus * 0.14);
    siteRef.current.position.y = -focus * 0.04;
    shellRef.current.position.y = -Math.max(explode * 1.35, focus * 1.72);

    setGroupMaterialState(
      roofRef.current,
      Math.max(xray, focus),
      MathUtils.lerp(0.04, 0.008, focus),
      true,
    );
    setGroupMaterialState(
      upperRef.current,
      Math.max(xray, focus),
      MathUtils.lerp(0.055, 0.012, focus),
      true,
    );
    setGroupMaterialState(shellRef.current, focus, 0.04, false);

    const activationScale = Math.max(0.001, activate);
    residentsRef.current.scale.setScalar(activationScale);
    sensorsRef.current.scale.setScalar(Math.max(0.001, sensors));
    dynamicsRef.current.scale.setScalar(Math.max(0.001, dynamics));

    residentsRef.current.position.x = Math.sin(clock.elapsedTime * 0.62) * 0.04 * dynamics;
    residentsRef.current.position.z = Math.cos(clock.elapsedTime * 0.52) * 0.035 * dynamics;
    dynamicsRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.28) * 0.012 * dynamics;

    camera.position.set(
      MathUtils.lerp(12.8, 10.2, focus),
      MathUtils.lerp(13.2 + explode * 1.8, 14.3, focus),
      MathUtils.lerp(15.4, 13.4, focus),
    );
    camera.zoom = MathUtils.lerp(56 - explode * 2, 68, focus);
    camera.lookAt(
      MathUtils.lerp(0, 0.3, focus),
      MathUtils.lerp(2.7 + explode * 1.4, 0.58, focus),
      MathUtils.lerp(0, 0.2, focus),
    );
    camera.updateProjectionMatrix();
  });

  return (
    <group ref={houseRef}>
      <group ref={siteRef}>
        <Site />
      </group>
      <group ref={groundRef}>
        <GroundFloor
          dynamicsRef={dynamicsRef}
          residentsRef={residentsRef}
          sensorsRef={sensorsRef}
          shellRef={shellRef}
        />
      </group>
      <group ref={upperRef}>
        <UpperFloor shellRef={upperShellRef} />
      </group>
      <group ref={roofRef}>
        <Roof />
      </group>
    </group>
  );
}

function Scene({ progressRef, staticProgress }) {
  return (
    <>
      <color attach="background" args={["#0b1113"]} />
      <fog attach="fog" args={["#0b1113", 17, 34]} />
      <ambientLight color="#f7dec2" intensity={0.3} />
      <hemisphereLight color="#d8c3aa" groundColor="#17130f" intensity={0.65} />
      <directionalLight
        castShadow
        color="#f1ddc3"
        intensity={1.92}
        position={[8, 13, 9]}
        shadow-bias={-0.0004}
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight color="#806b57" intensity={0.52} position={[-8, 7, -6]} />
      <AnimatedHouse progressRef={progressRef} staticProgress={staticProgress} />
    </>
  );
}

export default function VirtualHomeHouseScene({
  progressRef,
  staticProgress = 0,
}) {
  return (
    <Canvas
      aria-label="Interactive three-dimensional model of the complete VirtualHome residence"
      camera={{ far: 80, near: 0.1, position: [12.8, 13.2, 15.4], zoom: 56 }}
      dpr={[1, 1.5]}
      gl={{ alpha: false, antialias: true, powerPreference: "high-performance" }}
      orthographic
      shadows
    >
      <Scene progressRef={progressRef} staticProgress={staticProgress} />
    </Canvas>
  );
}
