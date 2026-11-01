import { i as __toESM } from "../_runtime.mjs";
import { a as BufferGeometry, c as require_jsx_runtime, i as BufferAttribute, l as require_react, n as useFrame, o as Object3D, s as Vector3, t as Canvas } from "../_libs/@react-three/fiber+[...].mjs";
import { a as sparks, c as readInput, i as sim, l as engine, n as PILLARS, o as step, r as pokeHud, s as installProbe } from "./routes-BP_VOS_w.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Arena-DRKe1KLe.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var palette = {
	ink: "#07090e",
	panel: "#141a24",
	stone: "#1b2430",
	hull: "#243140",
	cliff: "#10161e",
	cream: "#efe7d6",
	mist: "#9aa3b5",
	tide: "#2ee6c7",
	amber: "#f4a261"
};
var STEP = 1 / 60;
var TRAIL = 14;
var look = new Vector3();
var desired = new Vector3();
function mulberry32(seed) {
	let s = seed;
	return () => {
		s = s + 1831565813 | 0;
		let t = Math.imul(s ^ s >>> 15, 1 | s);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function Starfield() {
	const geo = (0, import_react.useMemo)(() => {
		const g = new BufferGeometry();
		const arr = /* @__PURE__ */ new Float32Array(780);
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
	(0, import_react.useEffect)(() => () => geo.dispose(), [geo]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("points", {
		geometry: geo,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointsMaterial", {
			color: palette.cream,
			size: .16,
			sizeAttenuation: true,
			depthWrite: false
		})
	});
}
function Disc() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				-.45,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
				22,
				19.2,
				.9,
				72
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: palette.cliff,
				roughness: 1,
				metalness: .04
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circleGeometry", { args: [22, 80] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: palette.stone,
				roughness: .96,
				metalness: .08
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			position: [
				0,
				.02,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ringGeometry", { args: [
				20.7,
				22,
				72
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
				color: palette.tide,
				transparent: true,
				opacity: .55
			})]
		}),
		[
			4.5,
			8.5,
			12.5,
			16.5
		].map((radius) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			position: [
				0,
				.03,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("torusGeometry", { args: [
				radius,
				.028,
				6,
				90
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
				color: palette.tide,
				transparent: true,
				opacity: .32
			})]
		}, radius)),
		Array.from({ length: 4 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			rotation: [
				0,
				i * Math.PI / 4,
				0
			],
			position: [
				0,
				.03,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				.03,
				.015,
				40
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
				color: palette.tide,
				transparent: true,
				opacity: .16
			})]
		}, i)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			position: [
				0,
				12,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("torusGeometry", { args: [
				32,
				.07,
				8,
				100
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
				color: palette.tide,
				transparent: true,
				opacity: .35
			})]
		})
	] });
}
function Horizon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { children: [
		{
			x: 36,
			z: 8,
			h: 7,
			r: 3.2
		},
		{
			x: 22,
			z: 34,
			h: 5.5,
			r: 2.6
		},
		{
			x: -18,
			z: 38,
			h: 8,
			r: 3.4
		},
		{
			x: -38,
			z: 6,
			h: 6,
			r: 2.8
		},
		{
			x: -28,
			z: -30,
			h: 7.5,
			r: 3.1
		},
		{
			x: 10,
			z: -40,
			h: 5,
			r: 2.4
		},
		{
			x: 40,
			z: -18,
			h: 6.5,
			r: 2.9
		}
	].map((cone) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			cone.x,
			cone.h / 2 - 1.2,
			cone.z
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [
			cone.r,
			cone.h,
			5
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: palette.cliff,
			roughness: 1
		})]
	}, `${cone.x}:${cone.z}`)) });
}
function Pillars() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { children: PILLARS.map((pillar) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position: [
			pillar.x,
			0,
			pillar.z
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				pillar.h / 2,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
				pillar.r * .92,
				pillar.r,
				pillar.h,
				6
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: palette.hull,
				roughness: .78,
				metalness: .18
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				pillar.h * .72,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
				pillar.r + .05,
				pillar.r + .05,
				.1,
				6
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: palette.tide,
				emissive: palette.tide,
				emissiveIntensity: .7,
				roughness: .4
			})]
		})]
	}, `${pillar.x}:${pillar.z}`)) });
}
function hideInstance(mesh, index, scratch) {
	scratch.position.set(0, -20, 0);
	scratch.scale.setScalar(.001);
	scratch.rotation.set(0, 0, 0);
	scratch.updateMatrix();
	mesh.setMatrixAt(index, scratch.matrix);
}
function Stage() {
	const craft = (0, import_react.useRef)(null);
	const body = (0, import_react.useRef)(null);
	const wisp = (0, import_react.useRef)(null);
	const shadow = (0, import_react.useRef)(null);
	const moteRefs = (0, import_react.useRef)([]);
	const sparksRef = (0, import_react.useRef)(null);
	const trailRef = (0, import_react.useRef)(null);
	const rig = (0, import_react.useRef)(new Vector3(0, 8.2, 18));
	const acc = (0, import_react.useRef)(0);
	const clock = (0, import_react.useRef)(0);
	const lastPoke = (0, import_react.useRef)(0);
	const lastPhase = (0, import_react.useRef)(sim.phase);
	const scratch = (0, import_react.useMemo)(() => new Object3D(), []);
	const trail = (0, import_react.useRef)(Array.from({ length: TRAIL }, () => new Vector3(0, -20, 0)));
	const trailCursor = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		const sparkMesh = sparksRef.current;
		const trailMesh = trailRef.current;
		if (sparkMesh) {
			for (let i = 0; i < 40; i += 1) hideInstance(sparkMesh, i, scratch);
			sparkMesh.instanceMatrix.needsUpdate = true;
		}
		if (trailMesh) {
			for (let i = 0; i < TRAIL; i += 1) hideInstance(trailMesh, i, scratch);
			trailMesh.instanceMatrix.needsUpdate = true;
		}
	}, [scratch]);
	useFrame((state, delta) => {
		const frameDt = Math.min(delta, .1);
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
		const hover = .72 + Math.sin(t * 2.3) * .06;
		if (craft.current) {
			craft.current.position.set(sim.x, hover, sim.z);
			craft.current.lookAt(sim.x + fx, hover, sim.z + fz);
			craft.current.rotateZ(sim.bank);
			craft.current.visible = sim.phase === "menu" || sim.invuln <= 0 || Math.sin(t * 16) > 0;
		}
		if (body.current) {
			const stretch = 1 + Math.min(.16, Math.abs(sim.speed) * .01);
			const lateral = 1 / Math.sqrt(stretch);
			body.current.scale.set(lateral, lateral, stretch);
		}
		if (shadow.current) shadow.current.position.set(sim.x, .05, sim.z);
		sim.motes.forEach((mote, index) => {
			const mesh = moteRefs.current[index];
			if (!mesh) return;
			mesh.position.set(mote.x, 1.05 + Math.sin(t * 2 + mote.phase) * .22, mote.z);
			mesh.rotation.y = t * 1.3 + mote.phase;
		});
		if (wisp.current) {
			if (sim.phase === "menu") wisp.current.position.set(Math.sin(t * .35) * 14, 1.25, Math.cos(t * .35) * 14);
			else wisp.current.position.set(sim.wispX, 1.15 + Math.sin(t * 3) * .12, sim.wispZ);
			wisp.current.rotation.y = t * .9;
			wisp.current.scale.setScalar(1 + Math.sin(t * 4) * .06);
		}
		const trailMesh = trailRef.current;
		if (trailMesh) {
			if (sim.phase === "playing") {
				trail.current[trailCursor.current].set(sim.x - fx * .9, .55, sim.z - fz * .9);
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
				scratch.scale.setScalar(Math.max(.05, .24 * (1 - age / TRAIL)));
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
				scratch.scale.setScalar(Math.max(.03, spark.life * .3));
				scratch.rotation.set(0, 0, 0);
				scratch.updateMatrix();
				sparkMesh.setMatrixAt(index, scratch.matrix);
			});
			sparkMesh.instanceMatrix.needsUpdate = true;
		}
		if (sim.phase === "menu") {
			desired.set(Math.sin(t * .18) * 18, 8.2, Math.cos(t * .18) * 18);
			look.set(0, .8, 0);
		} else {
			desired.set(sim.x - fx * 10.2, 5.1, sim.z - fz * 10.2);
			look.set(sim.x + fx * 3.4, .85, sim.z + fz * 3.4);
		}
		rig.current.lerp(desired, 1 - Math.exp(-4.2 * frameDt));
		const shake = sim.shake ? sim.trauma * sim.trauma : 0;
		state.camera.position.set(rig.current.x + Math.sin(t * 41) * .26 * shake, rig.current.y + Math.sin(t * 29) * .14 * shake, rig.current.z + Math.cos(t * 33) * .26 * shake);
		state.camera.lookAt(look);
		if (sim.phase !== lastPhase.current || clock.current - lastPoke.current > .1) {
			lastPhase.current = sim.phase;
			lastPoke.current = clock.current;
			pokeHud();
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Starfield, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Horizon, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Disc, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pillars, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
			ref: craft,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
				ref: body,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
						.86,
						.18,
						1.28
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: palette.hull,
						metalness: .72,
						roughness: .28
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							0,
							.92
						],
						rotation: [
							Math.PI / 2,
							0,
							0
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [
							.26,
							.68,
							5
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							color: palette.tide,
							emissive: palette.tide,
							emissiveIntensity: .65,
							metalness: .35,
							roughness: .28
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.02,
							-.02
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
							2.15,
							.055,
							.4
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							color: palette.hull,
							metalness: .62,
							roughness: .32
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							1.08,
							.02,
							-.02
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
							.12,
							.1,
							.48
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							color: palette.tide,
							emissive: palette.tide,
							emissiveIntensity: .85
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							-1.08,
							.02,
							-.02
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
							.12,
							.1,
							.48
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							color: palette.tide,
							emissive: palette.tide,
							emissiveIntensity: .85
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.2,
							-.5
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
							.06,
							.32,
							.28
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							color: palette.hull,
							metalness: .5,
							roughness: .4
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.16,
							.16
						],
						scale: [
							1,
							.72,
							1
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
							.22,
							16,
							12
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							color: palette.cream,
							emissive: palette.tide,
							emissiveIntensity: .18,
							roughness: .08,
							metalness: .15
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.02,
							-.78
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
							.15,
							12,
							10
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", { color: palette.amber })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
						position: [
							0,
							.2,
							0
						],
						color: palette.tide,
						intensity: 2.2,
						distance: 9
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
						position: [
							0,
							0,
							-.9
						],
						color: palette.amber,
						intensity: 1.4,
						distance: 5
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			ref: shadow,
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			position: [
				0,
				.05,
				10
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circleGeometry", { args: [1.05, 20] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
				color: palette.ink,
				transparent: true,
				opacity: .4
			})]
		}),
		sim.motes.map((mote, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			ref: (node) => {
				moteRefs.current[index] = node;
			},
			position: [
				mote.x,
				1,
				mote.z
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("icosahedronGeometry", { args: [.38, 0] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: palette.amber,
				emissive: palette.amber,
				emissiveIntensity: 1.15,
				roughness: .28,
				metalness: .15
			})]
		}, mote.id)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
			ref: wisp,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("icosahedronGeometry", { args: [.62, 0] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: palette.ink,
					emissive: palette.cream,
					emissiveIntensity: 1.35,
					roughness: .35
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("icosahedronGeometry", { args: [.98, 0] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					color: palette.cream,
					wireframe: true,
					transparent: true,
					opacity: .55
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
					color: palette.cream,
					intensity: 2.4,
					distance: 8
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
			ref: trailRef,
			args: [
				void 0,
				void 0,
				TRAIL
			],
			frustumCulled: false,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
				1,
				6,
				6
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
				color: palette.tide,
				transparent: true,
				opacity: .75
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
			ref: sparksRef,
			args: [
				void 0,
				void 0,
				40
			],
			frustumCulled: false,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
				1,
				5,
				5
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", { color: palette.amber })]
		})
	] });
}
function Arena() {
	(0, import_react.useEffect)(() => {
		installProbe({
			getYaw: () => sim.yaw,
			getSpeed: () => sim.speed
		});
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Canvas, {
		dpr: [1, 1.5],
		camera: {
			position: [
				0,
				8.2,
				18
			],
			fov: 48,
			near: .1,
			far: 140
		},
		gl: {
			antialias: true,
			powerPreference: "high-performance"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("color", {
				attach: "background",
				args: [palette.ink]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("fog", {
				attach: "fog",
				args: [
					palette.ink,
					22,
					68
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", { intensity: .38 }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", { args: [
				palette.tide,
				palette.ink,
				.28
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
				position: [
					10,
					16,
					6
				],
				intensity: 1.25,
				color: palette.cream
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stage, {})
		]
	});
}
//#endregion
export { Arena as default };
