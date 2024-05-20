import * as THREE from "three";
import { fabric } from "fabric";

// 普通房间
export class LivingRoom implements MyTypes.Room {
  id: string;
  x: number;
  z: number;
  width: number; // 开间，x轴方向尺寸，cm
  depth: number; // 进深，z轴方向尺寸，cm
  type = "普通房间";

  floorMat: THREE.Material;
  wallMat: THREE.Material;

  constructor(id: string, x: number, z: number, width: number, depth: number) {
    this.id = id;
    this.x = x;
    this.z = z;
    this.width = width;
    this.depth = depth;

    this.floorMat = new THREE.MeshLambertMaterial({
      color: "#dddddd",
    });
    this.wallMat = new THREE.MeshLambertMaterial({
      color: "#eeeeee",
    });
  }

  // 三维建造
  build = (height: number, wallThick: number, floorThick: number) => {
    const group = new THREE.Group();
    group.name = "ROOM";

    const mesh = this.buildFloor(floorThick);
    mesh.name = "FLOOR";
    group.add(mesh);

    const walls = this.buildWalls(height, wallThick);
    walls.name = "WALL";
    group.add(walls);

    // 偏移调整
    group.position.x = this.x + 0.5 * this.width;
    group.position.z = -this.z - 0.5 * this.depth;

    return group;
  };

  // 建造地板
  private buildFloor = (floorThick: number) => {
    const geo = new THREE.BoxGeometry(this.width, floorThick, this.depth);
    const mesh = new THREE.Mesh(geo, this.floorMat);
    mesh.position.y = 0.5 * floorThick;
    return mesh;
  };

  // 建造墙
  private buildWalls = (height: number, wallThick: number) => {
    const group = new THREE.Group();

    // 左侧墙（-x）
    {
      const geo = new THREE.BoxGeometry(wallThick, height, this.depth);
      const mesh = new THREE.Mesh(geo, this.wallMat);

      mesh.position.x = -0.5 * this.width;
      mesh.position.y = 0.5 * height;

      group.add(mesh);
    }

    // 右侧墙（+x）
    {
      const geo = new THREE.BoxGeometry(wallThick, height, this.depth);
      const mesh = new THREE.Mesh(geo, this.wallMat);

      mesh.position.x = 0.5 * this.width;
      mesh.position.y = 0.5 * height;

      group.add(mesh);
    }

    // 上侧墙（-z）
    {
      const geo = new THREE.BoxGeometry(this.width, height, wallThick);
      const mesh = new THREE.Mesh(geo, this.wallMat);

      mesh.position.z = -0.5 * this.depth;
      mesh.position.y = 0.5 * height;

      group.add(mesh);
    }

    // 下侧墙（+z）
    {
      const geo = new THREE.BoxGeometry(this.width, height, wallThick);
      const mesh = new THREE.Mesh(geo, this.wallMat);

      mesh.position.z = 0.5 * this.depth;
      mesh.position.y = 0.5 * height;

      group.add(mesh);
    }

    return group;
  };

  // 二维绘制
  draw = () => {
    const rect = new fabric.Rect({
      left: this.x,
      top: -this.z,
      width: this.width,
      height: -this.depth,
      stroke: "#000000",
      strokeWidth: 1,
      fill: "#cccccc",
    });

    const group = new fabric.Group([rect]);

    group.name = this.id;
    group.hasControls = false;

    return group;

    return rect;
  };
}

// 楼梯间
export class StairCase implements MyTypes.Room {
  id: string;
  x: number;
  z: number;
  width: number; // 开间，x轴方向尺寸，cm
  depth: number; // 进深，z轴方向尺寸，cm
  type = "楼梯间";

  floorMat: THREE.Material;
  wallMat: THREE.Material;

  constructor(id: string, x: number, z: number, width: number, depth: number) {
    this.id = id;
    this.x = x;
    this.z = z;
    this.width = width;
    this.depth = depth;

    this.floorMat = new THREE.MeshLambertMaterial({
      color: "#87CEEB",
    });
    this.wallMat = new THREE.MeshLambertMaterial({
      color: "#eeeeee",
    });
  }

  // 三维建造
  build = (height: number, wallThick: number, floorThick: number) => {
    const group = new THREE.Group();
    group.name = "ROOM";

    const mesh = this.buildFloor(floorThick);
    mesh.name = "FLOOR";
    group.add(mesh);

    const walls = this.buildWalls(height, wallThick);
    walls.name = "WALL";
    group.add(walls);

    // 偏移调整
    group.position.x = this.x + 0.5 * this.width;
    group.position.z = -this.z - 0.5 * this.depth;

    return group;
  };

  // 建造地板
  private buildFloor = (floorThick: number) => {
    const geo = new THREE.BoxGeometry(this.width, floorThick, this.depth);
    const mesh = new THREE.Mesh(geo, this.floorMat);
    mesh.position.y = 0.5 * floorThick;
    return mesh;
  };

  // 建造墙
  private buildWalls = (height: number, wallThick: number) => {
    const group = new THREE.Group();

    // 左侧墙（-x）
    {
      const geo = new THREE.BoxGeometry(wallThick, height, this.depth);
      const mesh = new THREE.Mesh(geo, this.wallMat);

      mesh.position.x = -0.5 * this.width;
      mesh.position.y = 0.5 * height;

      group.add(mesh);
    }

    // 右侧墙（+x）
    {
      const geo = new THREE.BoxGeometry(wallThick, height, this.depth);
      const mesh = new THREE.Mesh(geo, this.wallMat);

      mesh.position.x = 0.5 * this.width;
      mesh.position.y = 0.5 * height;

      group.add(mesh);
    }

    // 上侧墙（-z）
    {
      const geo = new THREE.BoxGeometry(this.width, height, wallThick);
      const mesh = new THREE.Mesh(geo, this.wallMat);

      mesh.position.z = -0.5 * this.depth;
      mesh.position.y = 0.5 * height;

      group.add(mesh);
    }

    // 下侧墙（+z）
    {
      const geo = new THREE.BoxGeometry(this.width, height, wallThick);
      const mesh = new THREE.Mesh(geo, this.wallMat);

      mesh.position.z = 0.5 * this.depth;
      mesh.position.y = 0.5 * height;

      group.add(mesh);
    }

    return group;
  };

  // 二维绘制
  draw = () => {
    const rect = new fabric.Rect({
      left: this.x,
      top: -this.z,
      width: this.width,
      height: -this.depth,
      stroke: "#000000",
      strokeWidth: 1,
      fill: "#3CB371",
    });
    const line1 = new fabric.Line(
      [this.x, -this.z, this.x + this.width, -this.z - this.depth],
      {
        strokeWidth: 5,
        stroke: "#006400",
      }
    );
    const line2 = new fabric.Line(
      [this.x + this.width, -this.z, this.x, -this.z - this.depth],
      {
        strokeWidth: 5,
        stroke: "#006400",
      }
    );
    const group = new fabric.Group([rect, line1, line2]);

    group.name = this.id;
    group.hasControls = false;

    return group;
  };
}
