import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
// import { OrbitControls } from "three"
import { ThreeRaycaster } from "./ThreeRaycaster"
import Line from "./Line"
import Model from "./Model"

type ExtendedShape = (Line | Model) & {
  originHex: number
}

type UsedMeterial = THREE.MeshPhongMaterial | THREE.LineBasicMaterial

export class ThreeScene {
  public scene!: THREE.Scene
  public camera!: THREE.PerspectiveCamera
  public renderer!: THREE.WebGLRenderer
  public controls!: OrbitControls
  public raycaster!: ThreeRaycaster
  public obj!: THREE.Group

  public highlightedObj: ExtendedShape | null = null
  public highlightedId: string | undefined

  constructor() {
    this.init()
    this.raycaster = new ThreeRaycaster(this.camera)
    this.bindEventListeners()
  }

  private init() {
    this.initScene()
    this.initRenderer()
    this.initCamera()
    this.initLight()
    this.initControls()
    window.addEventListener("resize", this.onWindowResize, false)
    this.animate()
    //this.setCamera();
  }
  private onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
  /**
   * 场景
   */
  private initScene() {
    this.scene = new THREE.Scene()
    //背景颜色
    //this.scene.background = new THREE.Color(0x222222);
    this.scene.background = new THREE.Color(0xbbbbbb)
    const axes = new THREE.AxesHelper(10)
    //axes.rotation.set(Math.PI / 2.0,0,0);
    this.scene.add(axes)

    const grid: any = new THREE.GridHelper(500, 10, 0xffffff, 0xffffff)
    grid.rotation.set(Math.PI / 2.0, 0, 0)
    grid.material.opacity = 0.5
    grid.material.depthWrite = false
    grid.material.transparent = true
    this.scene.add(grid)
  }

  /**
   *  初始化相机
   */
  private initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      10000,
    )
    this.camera.position.set(0, -400, 530)
    this.camera.up = new THREE.Vector3(0, 0, 1)
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))
  }

  /**
   *  初始渲染器
   */
  private initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    //renderer.shadowMap.enabled = true;
    //renderer.setClearColor(0xdddddd);
    document.body.appendChild(this.renderer.domElement)
  }

  private initLight() {
    //添加环境光
    //第一个参数 Hex:光的颜色
    //第二个参数 Intensity：光源的强度，默认是1.0，如果为0.5，则强度是一半，意思是颜色会淡一些
    // this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    // //scene.add(new THREE.AmbientLight(0x5C5C5C));

    // let light = new THREE.DirectionalLight(0xffffff, 0.5);
    // light.position.set(0.5, 0, 0.866); // ~60º
    // light.castShadow = true;
    // this.scene.add(light); //追加光源到场景

    // let light2 = new THREE.DirectionalLight(0xffffff, 0.5);
    // light2.position.set(-0.5, 0, -0.866); // ~60º
    // light2.castShadow = true;
    // this.scene.add(light2); //追加光源到场景

    const light = new THREE.HemisphereLight(0xffffff, 0x444444)
    light.position.set(0, 200, 0)
    const light2 = new THREE.DirectionalLight(0xbbbbbb)
    light2.position.set(6, 50, -12)
    light2.castShadow = true
    light2.shadow.camera.top = 200
    light2.shadow.camera.bottom = -200
    light2.shadow.camera.left = -200
    light2.shadow.camera.right = 200
    //this.light2.shadow.radius        =  32;
    light2.shadow.mapSize.width = 128
    light2.shadow.mapSize.height = 128
  }

  /**
   * 控制器
   */
  private initControls() {
    //初始化轨迹球控件
    //this.controls = new TrackballControls(this.camera, this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    // 使动画循环使用时阻尼或自转 意思是否有惯性
    this.controls.enableDamping = true
    //动态阻尼系数 就是鼠标拖拽旋转灵敏度
    this.controls.dampingFactor = 0.5
    //是否可以缩放
    this.controls.enableZoom = true
    //是否自动旋转
    this.controls.autoRotate = false
    //设置相机距离原点的最近距离
    //controls.minDistance = 50;
    //设置相机距离原点的最远距离
    //controls.maxDistance = 200;
    //是否开启右键拖拽
    //this.controls.enablePan = true;
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.DOLLY,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.ROTATE,
    }
  }

  /**
   * 渲染
   */
  private render() {
    //设置主场景视区大小
    this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight)
    this.renderer.render(this.scene, this.camera)
  }

  private animate = () => {
    requestAnimationFrame(this.animate)
    this.render()
    this.controls.update()
  }

  /**
   * //设置模型到适合观察的大小
   */
  public setCamera() {
    try {
      //计算包围盒
      const boxHelper = new THREE.BoxHelper(this.scene)
      boxHelper.geometry.computeBoundingBox()
      const radius = (boxHelper.geometry.boundingSphere as THREE.Sphere).radius
      //计算相机位置
      const box = boxHelper.geometry.boundingBox as THREE.Box3
      const center = new THREE.Vector3(
        (box.max.x + box.min.x) / 2,
        (box.max.y + box.min.y) / 2,
        (box.max.z + box.min.z) / 2,
      )
      const cameraPos = new THREE.Vector3(
        center.x,
        center.y - radius,
        center.z + (box.max.z - box.min.z),
      )
      this.camera.lookAt(center)
      this.camera.position.copy(cameraPos)
      this.controls.target = center
    } catch {}
    this.controls.update()
  }

  public getIntersect(event: any): THREE.Vector3 {
    return this.raycaster.getIntersect(event)
  }

  public bindEventListeners() {
    this.renderer.domElement.addEventListener(
      "mousemove",
      this.ListenerMouseMove,
    )
  }

  private ListenerMouseMove = (event: any) => {
    const mouse = new THREE.Vector2()

    mouse.x = (event.offsetX / window.innerWidth) * 2 - 1
    mouse.y = -(event.offsetY / window.innerHeight) * 2 + 1

    const obj = this.obj

    if (obj) {
      this.raycaster.raycaster.setFromCamera(mouse, this.camera)
      const intersects = this.raycaster.raycaster.intersectObjects(obj.children)
      if (intersects.length > 0) {
        const isLine = intersects[0].object.type === "LineSegments"

        const intersectsObject: any = intersects[0].object
        const newDetectedId: string = isLine
          ? intersectsObject.edgeIds[intersects[0].index as number]
          : intersectsObject.faceIds[intersects[0].face?.a as number]
        if (
          this.highlightedObj != intersects[0].object ||
          this.highlightedId !== newDetectedId
        ) {
          if (this.highlightedObj) {
            ;(this.highlightedObj.material as UsedMeterial).color.setHex(
              this.highlightedObj.originHex,
            )
            if (this.highlightedObj && this.highlightedObj.clearHighlights) {
              this.highlightedObj.clearHighlights()
            }
          }
          this.highlightedObj = intersects[0].object as ExtendedShape
          this.highlightedObj.originHex = (
            this.highlightedObj.material as UsedMeterial
          ).color.getHex()
          // this.highlightedObj.material.color.setHex(0xffffff);
          this.highlightedId = newDetectedId
          if (isLine) {
            ;(this.highlightedObj as Line).highlightEdgeAtLineIndex(
              newDetectedId,
            )
            return
          } else {
            ;(this.highlightedObj as Model).highlightFaceAtFaceIndex(
              newDetectedId,
            )
            return
          }
        }

        console.log(
          (isLine ? "Edge" : "Face") + " Index: " + this.highlightedId,
        )
      } else {
        if (this.highlightedObj) {
          ;(this.highlightedObj.material as UsedMeterial).color.setHex(
            this.highlightedObj.originHex,
          )
          if (this.highlightedObj.clearHighlights) {
            this.highlightedObj.clearHighlights()
          }
        }
        this.highlightedObj = null
      }
    }
  }
}
