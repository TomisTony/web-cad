import { ThreeScene } from "./threeScene"

export class ThreeApp {
  public static threeScene: ThreeScene

  constructor() {}

  static getInstance() {
    if (!ThreeApp.threeScene) {
      ThreeApp.threeScene = new ThreeScene()
    }
    return ThreeApp.threeScene
  }
}
