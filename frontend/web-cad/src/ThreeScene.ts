import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
// import { OrbitControls } from "three"
import { ThreeRaycaster } from "./ThreeRaycaster"
import { BrCAD, BrCADEdge } from "./types/BrCAD"
import { EdgeMetaData, FaceMetaData } from "./types/Metadata"

export class ThreeScene {
  public scene!: THREE.Scene
  public camera!: THREE.PerspectiveCamera
  public renderer!: THREE.WebGLRenderer
  public controls!: OrbitControls
  public raycaster!: ThreeRaycaster
  public mainObject: THREE.Group = new THREE.Group()

  constructor() {
    this.init()
    this.raycaster = new ThreeRaycaster(this.camera)
  }

  // 权宜之计，material 之后要额外处理
  private static _modelMaterial: THREE.MeshPhongMaterial = null as any
  /**
   * 模型材质
   */
  public static get modelMaterial(): THREE.MeshPhongMaterial {
    if (this._modelMaterial == null) {
      const loader = new THREE.TextureLoader()
      loader.setCrossOrigin("")
      const matcap = loader.load("./dullFrontLitMetal.png")
      const m: any = new THREE.MeshMatcapMaterial({
        // color: new THREE.Color(0xf5f5f5),
        vertexColors: true,
        matcap: matcap,
        polygonOffset: true, // Push the mesh back for line drawing
        polygonOffsetFactor: 2.0,
        polygonOffsetUnits: 1.0,
      })
      this._modelMaterial = m
    }
    return this._modelMaterial
  }

  private static _lineMaterial: THREE.LineBasicMaterial = null as any

  public static get lineMaterial(): THREE.LineBasicMaterial {
    if (this._lineMaterial == null) {
      this._lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 1.5,
        vertexColors: true,
      })
    }
    return this._lineMaterial
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

  public addBrCADToScene(brCAD: BrCAD) {
    const faceList = brCAD.faces
    const edgeList = brCAD.edges

    if (faceList && faceList.length > 0) {
      const vertices: number[] = [],
        normals: number[] = [],
        triangles: number[] = [],
        uvs: number[] = [],
        colors: number[] = []
      const globalFaceMetadata: Record<string, FaceMetaData> = {}
      let vInd = 0
      faceList.forEach((face) => {
        // Copy Vertices into three.js Vector3 List
        vertices.push(...face.vertexCoordinates)
        normals.push(...face.normalCoordinates)
        uvs.push(...face.uvCoordinates)

        // Sort Triangles into a three.js Face List
        for (let i = 0; i < face.triangleIndexes.length; i += 3) {
          triangles.push(
            face.triangleIndexes[i + 0] + vInd,
            face.triangleIndexes[i + 1] + vInd,
            face.triangleIndexes[i + 2] + vInd,
          )
        }
        // Use Vertex Color to label this face's indices for raycast picking
        const faceMetaData = {
          id: face.id,
          colorIndexStart: colors.length,
        }
        for (let i = 0; i < face.vertexCoordinates.length; i += 3) {
          colors.push(1, 1, 1)
        }
        globalFaceMetadata[faceMetaData.id] = faceMetaData
        vInd += face.vertexCoordinates.length / 3
      })
      // Compile the connected vertices and faces into a model
      // And add to the scene
      const geometry = new THREE.BufferGeometry()
      geometry.setIndex(triangles)
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3),
      )
      geometry.setAttribute(
        "normal",
        new THREE.Float32BufferAttribute(normals, 3),
      )
      geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 3),
      )
      geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
      geometry.setAttribute("uv2", new THREE.Float32BufferAttribute(uvs, 2))
      geometry.computeBoundingSphere()
      geometry.computeBoundingBox()
      const model: any = new THREE.Mesh(geometry, ThreeScene.modelMaterial)
      model.castShadow = true
      model.name = "Model Faces"
      model.faceColors = colors
      model.globalFaceMetadata = globalFaceMetadata
      model.highlightFaceAtFaceIndex = function (id: string) {
        const startIndex = this.globalFaceMetadata[id].colorIndexStart
        this.faceColors[startIndex + 2] = 0
        this.geometry.setAttribute(
          "color",
          new THREE.Float32BufferAttribute(this.faceColors, 3),
        )
        this.geometry.colorsNeedUpdate = true
      }.bind(model)
      model.clearHighlights = function () {
        // 将 color 全部置为 1
        for (let i = 0; i < this.faceColors.length; i++) {
          this.faceColors[i] = 1
        }
        this.geometry.setAttribute(
          "color",
          new THREE.Float32BufferAttribute(this.faceColors, 3),
        )
        this.geometry.colorsNeedUpdate = true
      }.bind(model)

      this.mainObject.add(model)
    }

    if (edgeList && edgeList.length > 0) {
      // 以下代码将使用 LineSegment, 其两两一组分割来绘制线段
      // 一个 edge 可能不止两个 point
      const lineVertices: THREE.Vector3[] = []
      const globalEdgeMetadata: Record<string, EdgeMetaData> = {}

      // 用于记录每个 edge 的起始和结束 index
      let colorIndexCounter = 0
      edgeList.forEach((edge: BrCADEdge) => {
        const edgeMetaData = {} as EdgeMetaData
        edgeMetaData.id = edge.id
        edgeMetaData.colorIndexStart = colorIndexCounter
        // 根据 LineSegment 的构造风格，一个 edge 中每两个点构成一条线段
        for (let i = 0; i < edge.vertexCoordinates.length - 3; i += 3) {
          lineVertices.push(
            new THREE.Vector3(
              edge.vertexCoordinates[i],
              edge.vertexCoordinates[i + 1],
              edge.vertexCoordinates[i + 2],
            ),
          )

          lineVertices.push(
            new THREE.Vector3(
              edge.vertexCoordinates[i + 3],
              edge.vertexCoordinates[i + 1 + 3],
              edge.vertexCoordinates[i + 2 + 3],
            ),
          )
          colorIndexCounter += 2 * 3
        }
        edgeMetaData.colorIndexEnd = colorIndexCounter
        globalEdgeMetadata[edgeMetaData.id] = edgeMetaData
      })

      const lineGeometry = new THREE.BufferGeometry().setFromPoints(
        lineVertices,
      )
      const lineColors = []
      for (let i = 0; i < lineVertices.length; i++) {
        lineColors.push(0, 0, 0)
      }
      lineGeometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(lineColors, 3),
      )
      const line: {
        name?: string
        lineColors?: number[]
        globalEdgeMetadata?: Record<string, EdgeMetaData>
        highlightEdgeAtLineIndex?: (lineIndex: string) => void
        getEdgeMetadataAtLineIndex?: (lineIndex: string) => EdgeMetaData
        clearHighlights?: () => void
      } = new THREE.LineSegments(lineGeometry, ThreeScene.lineMaterial)
      line.name = "Model Edges"
      line.lineColors = lineColors
      line.globalEdgeMetadata = globalEdgeMetadata
      line.highlightEdgeAtLineIndex = function (id: string) {
        const startIndex = this.globalEdgeMetadata[id].colorIndexStart
        const endIndex = this.globalEdgeMetadata[id].colorIndexEnd
        for (let i = startIndex; i < endIndex; i++) {
          this.lineColors[i] = 1
        }
        this.geometry.setAttribute(
          "color",
          new THREE.Float32BufferAttribute(this.lineColors, 3),
        )
        this.geometry.colorsNeedUpdate = true
      }.bind(line)
      line.clearHighlights = function () {
        for (let i = 0; i < this.lineColors.length; i++) {
          this.lineColors[i] = 0
        }
        this.geometry.setAttribute(
          "color",
          new THREE.Float32BufferAttribute(this.lineColors, 3),
        )
        this.geometry.colorsNeedUpdate = true
      }.bind(line)
      this.mainObject.add(line as any)
    }
    this.scene.add(this.mainObject)
  }
}
