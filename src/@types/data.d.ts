declare namespace MyTypes {
  type Project = {
    id: number;
    name: string;
    floors: number;
    address: string;
    buildingType: string;
    description: string;
  };

  type ProjectParams = {
    wallThick: number; // 墙体厚度，cm
    floorThick: number; // 楼板厚度，cm
  };

  type FloorInfo = {
    num: number;
    height: number;
    rooms: Room[];
  };

  // 各式各样的房间
  interface Room {
    id: string; // 主键，用于交互定位
    x: number; // x轴定位原点，cm
    z: number; // z轴定位原点，cm
    type: string; // 房间类型

    // 绘制一个房间
    build: (
      height: number,
      wallThick: number,
      floorThick: number
    ) => THREE.Group;

    // 二维绘制房间
    draw: () => fabric.Object;
  }
}
