import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { ThreeRaycaster } from "./threeRaycaster"
import { ExtendedShape } from "@/types/Extended"

import store from "@/app/store"

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

  public setSizeFromDomElement(e: HTMLElement) {
    this.renderer.setSize(e.clientWidth, e.clientHeight, false)
    this.camera.aspect = e.clientWidth / e.clientHeight
    this.camera.updateProjectionMatrix()
  }

  private init() {
    this.initScene()
    this.initRenderer()
    this.initCamera()
    this.initLight()
    this.initControls()
    window.addEventListener("resize", this.onWindowResize)
    this.animate()
    //this.setCamera();
  }
  private onWindowResize = () => {
    console.log("onWindowResize")
    const width =
      this.renderer.domElement.parentElement?.clientWidth ?? window.innerWidth
    const height =
      this.renderer.domElement.parentElement?.clientHeight ?? window.innerHeight
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height, false)
  }
  // 用于在父级元素大小变化时，更新渲染器大小
  public onParentDomResize = () => {
    console.log("onParentDomResize")
    const width =
      this.renderer.domElement.parentElement?.clientWidth ?? window.innerWidth
    const height =
      this.renderer.domElement.parentElement?.clientHeight ?? window.innerHeight
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height, false)
  }
  /**
   * 场景
   */
  private initScene() {
    this.scene = new THREE.Scene()
    //背景颜色
    //this.scene.background = new THREE.Color(0x222222);
    this.scene.background = new THREE.Color(0xbbbbbb)

    const grid: any = new THREE.GridHelper(10000, 1000, 0xffffff, 0xffffff)
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
      this.renderer.domElement.clientWidth /
        this.renderer.domElement.clientHeight ?? 1,
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
  }

  private initLight() {
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
    this.renderer.setViewport(
      0,
      0,
      this.renderer.domElement.clientWidth ?? window.innerWidth,
      this.renderer.domElement.clientHeight ?? window.innerHeight,
    )
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
    this.renderer.domElement.addEventListener(
      "mousedown",
      this.ListenerMousedown,
    )
  }

  private dispatchChooseEvent(choosedId: string, type: string) {
    store.dispatch({
      type: "model/setChoosedInfo",
      payload: {
        index: 0,
        id: choosedId,
        type: type,
      },
    })
  }

  private dispatchUnchooseEvent(choosedId: string) {
    store.dispatch({
      type: "model/unchoose",
      payload: {
        id: choosedId,
      },
    })
  }

  private dispatchClearChoosedInfoEvent() {
    store.dispatch({
      type: "model/clearChoosedInfo",
    })
  }
  
  private highlightSolid(solidId: string) {
    // 通过 solidIdFaceIdMap 和 solidIdEdgeIdMap 来找到对应的 faceId 和 edgeId
    const obj = this.obj
    if (obj) {
      const faceId = store.getState().model.solidIdFaceIdMap[solidId]
      const edgeId = store.getState().model.solidIdEdgeIdMap[solidId]
      obj.children.forEach((child: any) => {
        if (child.type === "LineSegments") {
          child.toggleChoosedHighlightAtIndex(edgeId)
        } else {
          child.toggleChoosedHighlightAtIndex(faceId)
        }
      })
    }
  }

  // 鼠标滑过某个对象，黄色高亮
  private ListenerMouseMove = (event: any) => {
    const mouse = new THREE.Vector2()
    const width = this.renderer.domElement.clientWidth ?? window.innerWidth
    const height = this.renderer.domElement.clientHeight ?? window.innerHeight

    mouse.x = (event.offsetX / width) * 2 - 1
    mouse.y = -(event.offsetY / height) * 2 + 1

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
            this.highlightedObj.clearHighlights()
          }
          this.highlightedObj = intersects[0].object as ExtendedShape
          this.highlightedId = newDetectedId
          this.highlightedObj.highlightAtIndex(newDetectedId)
        }
      } else {
        if (this.highlightedObj) {
          this.highlightedObj.clearHighlights()
        }
        this.highlightedObj = null
      }
    }
  }

  // 选择某个对象，红色高亮
  // TODO: 目前函数只支持单选，可以在 redux 里面新增一个 多选模式，这样的话就开启多选逻辑
  private ListenerMousedown = (event: any) => {
    // 仅响应左键
    if (event.button !== 0) return

    const mouse = new THREE.Vector2()
    const width = this.renderer.domElement.clientWidth ?? window.innerWidth
    const height = this.renderer.domElement.clientHeight ?? window.innerHeight

    mouse.x = (event.offsetX / width) * 2 - 1
    mouse.y = -(event.offsetY / height) * 2 + 1

    const obj = this.obj

    if (obj) {
      const children = obj.children
      this.raycaster.raycaster.setFromCamera(mouse, this.camera)
      const intersects = this.raycaster.raycaster.intersectObjects(children)
      if (intersects.length > 0) {
        const type =
          intersects[0].object.type === "LineSegments" ? "edge" : "face"

        const intersectsObject: any = intersects[0].object
        const newDetectedId: string =
          type === "edge"
            ? intersectsObject.edgeIds[intersects[0].index as number]
            : intersectsObject.faceIds[intersects[0].face?.a as number]

        // 单选情况下的特殊代码: 此时 choosedIdList 里面只有一个元素
        // 选择前先将之前选择的置回原色
        const choosedIdList = store.getState().model.choosedIdList
        const lastId = choosedIdList[0]
        if (lastId) {
          children.forEach((child: any) => {
            child.toggleChoosedHighlightAtIndex(choosedIdList[0])
          })
        }

        // 反转当前选择的选择高亮色, 高亮变不亮，不亮变高亮
        children.forEach((child: any) => {
          child.toggleChoosedHighlightAtIndex(newDetectedId)
        })
        console.log(type + " Index: " + newDetectedId + " clicked.")
        // 更新 store
        // 查看是否已经被选择了，因为二次点击是取消选择
        const hasChoosed = choosedIdList.includes(newDetectedId)
        if (hasChoosed) {
          this.dispatchUnchooseEvent(newDetectedId)
        } else {
          this.dispatchChooseEvent(newDetectedId, type)
        }
      }
    }
  }

  public clearScene() {
    this.scene.remove(this.obj)
  }
}
