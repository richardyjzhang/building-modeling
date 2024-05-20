// 建模逻辑
import * as THREE from "three";

export default function buildModel(
  params: MyTypes.ProjectParams,
  floors: MyTypes.FloorInfo[]
) {
  const model = new THREE.Group();
  model.name = "MODEL";

  // 添加各层
  // 首先按楼层号从下到上排序
  const newFloors = [...floors].sort((a, b) => {
    return a.num - b.num;
  });

  // 累计层高
  let sumHeight = 0.0;

  // 遍历添加各层
  for (let i = 0; i < newFloors.length; ++i) {
    const floor = newFloors[i];

    const group = buildOneFloor(params, floor);
    group.position.y = sumHeight;
    sumHeight = sumHeight + floor.height;

    model.add(group);
  }

  return model;
}

// 构造一层
function buildOneFloor(
  params: MyTypes.ProjectParams,
  floor: MyTypes.FloorInfo
) {
  const group = new THREE.Group();
  group.name = `FLOOR-${floor.num}`;

  // 依次建造各房间
  for (let i = 0; i < floor.rooms.length; ++i) {
    const room = floor.rooms[i];
    const roomGroup = room.build(
      floor.height,
      params.wallThick,
      params.floorThick
    );
    group.add(roomGroup);
  }

  // 加入外轮廓
  buildOneFloorWrap(params, floor, group);

  return group;
}

// 建造本层的包络
function buildOneFloorWrap(
  params: MyTypes.ProjectParams,
  floor: MyTypes.FloorInfo,
  group: THREE.Group
) {
  const wrap = new THREE.Group();
  wrap.name = "WRAP";

  // 计算包络正方体
  const box = new THREE.Box3();
  box.expandByObject(group);

  // 包络尺寸
  const size = new THREE.Vector3();
  box.getSize(size);

  // 包络位置
  const pos = new THREE.Vector3();
  box.getCenter(pos);

  const mat = new THREE.MeshLambertMaterial({
    color: "#008000",
  });
  // 某一层的地板
  {
    const geo = new THREE.BoxGeometry(
      size.x + 2,
      params.floorThick,
      size.z + 2
    );
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(pos.x - 1, -0.5 * params.floorThick, pos.z - 1);
    group.add(mesh);
  }

  // 包络墙尺寸
  const wallThick = params.wallThick + 8;
  const wallHeight = floor.height + 4;

  // 左侧墙（-x）
  {
    const geo = new THREE.BoxGeometry(
      wallThick,
      wallHeight,
      size.z + wallThick
    );
    const mesh = new THREE.Mesh(geo, mat);

    mesh.position.x = pos.x - 0.5 * size.x;
    mesh.position.y = 0.5 * wallHeight;
    mesh.position.z = pos.z;

    group.add(mesh);
  }

  // 右侧墙（+x）
  {
    const geo = new THREE.BoxGeometry(
      wallThick,
      wallHeight,
      size.z + wallThick
    );
    const mesh = new THREE.Mesh(geo, mat);

    mesh.position.x = pos.x + 0.5 * size.x;
    mesh.position.y = 0.5 * wallHeight;
    mesh.position.z = pos.z;

    group.add(mesh);
  }

  // 上侧墙（-z）
  {
    const geo = new THREE.BoxGeometry(
      size.x + wallThick,
      wallHeight,
      wallThick
    );
    const mesh = new THREE.Mesh(geo, mat);

    mesh.position.x = pos.x;
    mesh.position.z = pos.z - 0.5 * size.z;
    mesh.position.y = 0.5 * wallHeight;

    group.add(mesh);
  }

  // 下侧墙（+z）
  {
    const geo = new THREE.BoxGeometry(
      size.x + wallThick,
      wallHeight,
      wallThick
    );
    const mesh = new THREE.Mesh(geo, mat);

    mesh.position.x = pos.x;
    mesh.position.z = pos.z + 0.5 * size.z;
    mesh.position.y = 0.5 * wallHeight;

    group.add(mesh);
  }

  group.add(wrap);
}
