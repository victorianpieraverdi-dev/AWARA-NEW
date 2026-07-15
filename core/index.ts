// AWARA core — public barrel for the transformed (WebGL/R3F/GSAP) architecture.
//
// Quick start (renderer side):
//
//   import { StateManager, NODES, VoiceOfTruth, DimensionalMaterial, createPlayerState } from "./core"
//
//   const rig = {
//     focusNode(node, { duration, ease }) {
//       return gsap.to(camera.position, { ...anchorOf(node), duration, ease }).then()
//     },
//   }
//   const sm = new StateManager(rig, 0)
//   await sm.runIntro()          // 0 -> 1 -> 2
//   await sm.move("east")        // Lobby -> Tigel (node 5)
//
//   const voice = new VoiceOfTruth(/* optional LLMClient */)
//   let player = createPlayerState()
//   const analysis = await voice.ingestDiary(diaryText, player)
//   player = voice.apply(player, analysis)
//   material.setLight(player.light)   // UI morphs flat -> volumetric

export * from "./types"
export * from "./state/nodes"
export * from "./state/StateManager"
export * from "./ai/VoiceOfTruth"
export * from "./render/DimensionalMaterial"
export { dimensionalVertex, dimensionalFragment } from "./render/shaders/dimensional.glsl"
export * from "./render/TorusField"
export { torusFieldVertex, torusFieldFragment } from "./render/shaders/torus.glsl"
