import { ThreeScene } from "./ThreeScene"

export class ThreeApp {
  public static threeScene: ThreeScene

  constructor() {
    ThreeApp.threeScene = new ThreeScene()
  }
}
