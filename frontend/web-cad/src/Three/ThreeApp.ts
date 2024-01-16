import { ThreeScene } from "./threeScene"

export class ThreeApp {
  public static threeScene: ThreeScene

  constructor() {}

  static getScene() {
    if (!ThreeApp.threeScene) {
      ThreeApp.threeScene = new ThreeScene()
    }
    return ThreeApp.threeScene
  }
}
