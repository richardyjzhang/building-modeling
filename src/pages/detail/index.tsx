import React, { useEffect, useState, useContext } from "react";
import {
  Button,
  Card,
  Divider,
  Form,
  FloatButton,
  Modal,
  Input,
  InputNumber,
  ConfigProvider,
  Popconfirm,
  Select,
  message,
} from "antd";
import { ReloadOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { fabric } from "fabric";
import {
  initAxis,
  initAligningGuidelines,
  autoFitZoom,
  initZoomPan,
} from "./fabric-util";
import { LivingRoom, StairCase } from "@/@types/room";
import init from "./init";
import buildModel from "./build";
import { ProjectContext } from "@/layouts/index";
import styles from "./index.less";

// 参数化建模详情页面

// 三维相关初始化
const { scene, camera, renderer, orbitControl } = init();

const createId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 初始楼层信息
const initFloors: MyTypes.FloorInfo[] = [
  {
    num: 4,
    height: 330,
    rooms: [
      new LivingRoom(createId(), 0, 0, 500, 400),
      new LivingRoom(createId(), 500, 0, 500, 400),
      new LivingRoom(createId(), 1000, 0, 500, 400),
      new StairCase(createId(), 1500, 0, 1000, 400),

      new LivingRoom(createId(), 0, 600, 500, 400),
      new LivingRoom(createId(), 500, 600, 500, 400),
      new LivingRoom(createId(), 1000, 600, 500, 400),
      new LivingRoom(createId(), 1500, 600, 500, 400),
      new LivingRoom(createId(), 2000, 600, 500, 400),
    ],
  },
  {
    num: 3,
    height: 330,
    rooms: [
      new LivingRoom(createId(), 0, 0, 500, 400),
      new LivingRoom(createId(), 500, 0, 500, 400),
      new LivingRoom(createId(), 1000, 0, 500, 400),
      new StairCase(createId(), 1500, 0, 1000, 400),

      new LivingRoom(createId(), 0, 600, 500, 400),
      new LivingRoom(createId(), 500, 600, 500, 400),
      new LivingRoom(createId(), 1000, 600, 500, 400),
      new LivingRoom(createId(), 1500, 600, 500, 400),
      new LivingRoom(createId(), 2000, 600, 500, 400),
    ],
  },
  {
    num: 2,
    height: 350,
    rooms: [
      new LivingRoom(createId(), 0, 0, 500, 400),
      new LivingRoom(createId(), 500, 0, 500, 400),
      new LivingRoom(createId(), 1000, 0, 500, 400),
      new StairCase(createId(), 1500, 0, 1000, 400),

      new LivingRoom(createId(), 0, 600, 500, 400),
      new LivingRoom(createId(), 500, 600, 500, 400),
      new LivingRoom(createId(), 1000, 600, 500, 400),
      new LivingRoom(createId(), 1500, 600, 500, 400),
      new LivingRoom(createId(), 2000, 600, 500, 400),
    ],
  },
  {
    num: 1,
    height: 450,
    rooms: [
      new LivingRoom(createId(), 0, 0, 500, 400),
      new LivingRoom(createId(), 500, 0, 500, 400),
      new LivingRoom(createId(), 1000, 0, 500, 400),
      new StairCase(createId(), 1500, 0, 1000, 400),

      new LivingRoom(createId(), 0, 600, 500, 400),
      new LivingRoom(createId(), 500, 600, 500, 400),
      new LivingRoom(createId(), 1000, 600, 500, 400),
      new LivingRoom(createId(), 1500, 600, 500, 400),
      new LivingRoom(createId(), 2000, 600, 500, 400),
    ],
  },
];

// 初始项目参数
const initParams: MyTypes.ProjectParams = {
  wallThick: 30,
  floorThick: 40,
};

const DetailPage: React.FC = () => {
  // 三维div
  const divRef = React.createRef<HTMLDivElement>();

  // 动画ID
  let idAnimateFrame = 0;

  // 逐帧渲染
  const animate = () => {
    idAnimateFrame = requestAnimationFrame(animate);
    orbitControl.update();
    renderer.render(scene, camera);
  };

  const { curProject } = useContext(ProjectContext);

  const [floors, setFloors] = useState<MyTypes.FloorInfo[]>(initFloors);
  const [curFloor, setCurFloor] = useState<MyTypes.FloorInfo | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [projectParams, setProjectParams] =
    useState<MyTypes.ProjectParams>(initParams);

  // 单层信息编辑弹窗
  const FloorInfoModal = () => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const wrapperRef = React.createRef<HTMLDivElement>();
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [thisFloor, setThisFloor] = useState<MyTypes.FloorInfo | null>(null);

    // 选定的房间
    const [curRoom, setCurRoom] = useState<MyTypes.Room | null>(null);

    useEffect(() => {
      if (!wrapperRef.current || !curFloor) {
        return;
      }

      setThisFloor(curFloor);

      const fabricRef = new fabric.Canvas(canvasRef.current, {
        width: 0.8 * wrapperRef.current.clientWidth,
        height: wrapperRef.current.clientHeight,
      });
      fabricRef.selection = false;
      initAligningGuidelines(fabricRef);
      initZoomPan(fabricRef);

      setCanvas(fabricRef);

      return () => {
        console.log("DIPOSE");
        fabricRef?.dispose();
      };
    }, []);

    useEffect(() => {
      if (!thisFloor || !canvas) {
        return;
      }

      // 点击事件，选定当前房间
      canvas.on("selection:created", (opt) => {
        if (opt.selected && opt.selected.length > 0) {
          const obj = opt.selected[0];
          const room = thisFloor.rooms.find((r) => r.id === obj.name);
          if (room !== undefined) {
            setCurRoom(room);
          }
        }
      });
      canvas.on("selection:updated", (opt) => {
        if (opt.selected && opt.selected.length > 0) {
          const obj = opt.selected[0];
          const room = thisFloor.rooms.find((r) => r.id === obj.name);
          if (room !== undefined) {
            setCurRoom(room);
          }
        }
      });
      canvas.on("selection:cleared", () => {
        setCurRoom(null);
      });
      canvas.on("mouse:up", (opt) => {
        if (opt.isClick && opt.transform && opt.target && opt.target.name) {
          const name = opt.target.name;
          const room = thisFloor?.rooms.find((r) => r.id === name);
          if (room) {
            const rect = opt.target.getBoundingRect(true);
            if (room.type === "普通房间" && room instanceof LivingRoom) {
              setCurRoom(
                new LivingRoom(
                  room.id,
                  Math.round(rect.left),
                  Math.round(-rect.top - rect.height),
                  room.width,
                  room.depth
                )
              );
            }
            if (room.type === "楼梯间" && room instanceof StairCase) {
              setCurRoom(
                new StairCase(
                  room.id,
                  Math.round(rect.left),
                  Math.round(-rect.top - rect.height),
                  room.width,
                  room.depth
                )
              );
            }
          }
        }
      });

      canvas.clear();

      // 遍历添加房间
      thisFloor.rooms.forEach((room) => {
        const rect = room.draw();
        canvas.add(rect);
      });

      // 添加轴线
      initAxis(canvas);
      // 自动居中展示
      autoFitZoom(canvas);
    }, [thisFloor, canvas]);

    // 房间详情
    const RoomInfo = () => {
      if (!thisFloor) {
        return null;
      }

      if (!curRoom) {
        return (
          <div>
            <Form
              layout="vertical"
              onFinish={(newFloor: MyTypes.FloorInfo) => {
                message.success("楼层信息已更新");
                setThisFloor({
                  ...newFloor,
                  rooms: [...thisFloor.rooms],
                });
              }}
            >
              <Form.Item
                name="num"
                label="当前楼层"
                rules={[{ required: true }]}
                initialValue={thisFloor.num}
              >
                <Input placeholder="楼层编号" disabled />
              </Form.Item>
              <Form.Item
                name="height"
                label="当前层高(cm)"
                rules={[{ required: true }]}
                initialValue={thisFloor.height}
              >
                <InputNumber style={{ width: "100%" }} placeholder="当前层高" />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className={styles.modalInfoButton}
              >
                更新楼层信息
              </Button>
            </Form>
            <Divider />
            <Form
              layout="vertical"
              onFinish={(room: {
                type: string;
                width: number;
                depth: number;
              }) => {
                message.success("房间已添加");
                const rooms = thisFloor.rooms;
                if (room.type === "普通房间") {
                  const newRoom = new LivingRoom(
                    createId(),
                    -0.5 * room.width,
                    -0.5 * room.depth,
                    room.width,
                    room.depth
                  );
                  rooms.push(newRoom);
                } else if (room.type === "楼梯间") {
                  const newRoom = new StairCase(
                    createId(),
                    -0.5 * room.width,
                    -0.5 * room.depth,
                    room.width,
                    room.depth
                  );
                  rooms.push(newRoom);
                }
                setThisFloor({
                  ...thisFloor,
                  rooms: [...rooms],
                });
              }}
            >
              <Form.Item
                name="type"
                label="房间类型"
                rules={[{ required: true }]}
                initialValue={"普通房间"}
              >
                <Select
                  options={[
                    {
                      value: "普通房间",
                    },
                    {
                      value: "楼梯间",
                    },
                  ]}
                />
              </Form.Item>
              <Form.Item
                name="width"
                label="开间尺寸(cm)"
                rules={[{ required: true }]}
                initialValue={500}
              >
                <InputNumber style={{ width: "100%" }} placeholder="开间尺寸" />
              </Form.Item>
              <Form.Item
                name="depth"
                label="进深尺寸(cm)"
                rules={[{ required: true }]}
                initialValue={400}
              >
                <InputNumber style={{ width: "100%" }} placeholder="进深尺寸" />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className={styles.modalInfoButton}
              >
                添加房间
              </Button>
            </Form>
          </div>
        );
      } else {
        return (
          <Form
            layout="vertical"
            onFinish={(newRoom: MyTypes.Room) => {
              message.success("房间信息已更新");

              const newFloor = {
                ...thisFloor,
                rooms: thisFloor.rooms.map((r) => {
                  if (r.id === newRoom.id) {
                    if (newRoom.type === "普通房间") {
                      const livingRoom = newRoom as LivingRoom;
                      return new LivingRoom(
                        livingRoom.id,
                        livingRoom.x,
                        livingRoom.z,
                        livingRoom.width,
                        livingRoom.depth
                      );
                    }
                    if (newRoom.type === "楼梯间") {
                      const stairCase = newRoom as StairCase;
                      return new StairCase(
                        stairCase.id,
                        stairCase.x,
                        stairCase.z,
                        stairCase.width,
                        stairCase.depth
                      );
                    }
                  }
                  return r;
                }),
              };
              setThisFloor(newFloor);
            }}
          >
            <Form.Item name="id" label="房间编号" initialValue={curRoom.id}>
              <Input placeholder="房间编号" disabled />
            </Form.Item>
            <Form.Item name="type" label="房间类型" initialValue={curRoom.type}>
              <Input placeholder="房间类型" disabled />
            </Form.Item>
            <Form.Item
              name="x"
              label="x向偏移(cm)"
              rules={[{ required: true }]}
              initialValue={curRoom.x}
            >
              <InputNumber placeholder="x向偏移" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="z"
              label="y向偏移(cm)"
              rules={[{ required: true }]}
              initialValue={curRoom.z}
            >
              <InputNumber placeholder="y向偏移" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="width"
              label="房间开间(cm)"
              rules={[{ required: true }]}
              initialValue={
                curRoom instanceof LivingRoom || curRoom instanceof StairCase
                  ? curRoom.width
                  : 0
              }
            >
              <InputNumber placeholder="房间开间" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="depth"
              label="房间进深(cm)"
              rules={[{ required: true }]}
              initialValue={
                curRoom instanceof LivingRoom || curRoom instanceof StairCase
                  ? curRoom.depth
                  : 0
              }
            >
              <InputNumber placeholder="房间进深" style={{ width: "100%" }} />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className={styles.modalInfoButton}
            >
              确认
            </Button>
            <Popconfirm
              icon={<QuestionCircleOutlined style={{ color: "red" }} />}
              title="确定删除？"
              okText="确定"
              cancelText="取消"
              onConfirm={() => {
                setThisFloor({
                  ...thisFloor,
                  rooms: [
                    ...thisFloor.rooms.filter((r) => r.id !== curRoom.id),
                  ],
                });
              }}
            >
              <Button className={styles.modalInfoButton} danger>
                删除房间
              </Button>
            </Popconfirm>
          </Form>
        );
      }
    };

    return (
      <ConfigProvider
        theme={{
          components: {
            Modal: {
              headerBg: "#B3200A",
              titleColor: "#FFFFFF",
              titleLineHeight: 3,
            },
          },
        }}
      >
        <Modal
          className={styles.modal}
          open={openModal}
          title={`单层信息设置 - 第${curFloor?.num}层`}
          centered
          footer={null}
          width={"90%"}
          onCancel={() => {
            setOpenModal(false);
            if (thisFloor) {
              const newFloors = floors.map((f) => {
                if (f.num === thisFloor.num) {
                  return thisFloor;
                }
                return f;
              });
              setFloors(newFloors);
            }
          }}
        >
          <div ref={wrapperRef} className={styles.modalMain}>
            <div className={styles.modalCanvas}>
              <canvas ref={canvasRef} />
            </div>
            <div className={styles.modalInfo}>
              <div className={styles.modalInfoTitle}>
                {curRoom ? "房间详情" : "楼层详情"}
              </div>
              <RoomInfo />
            </div>
          </div>
        </Modal>
      </ConfigProvider>
    );
  };

  useEffect(() => {
    if (!divRef.current) return;

    renderer.setSize(divRef.current.clientWidth, divRef.current.clientHeight);
    animate();
    const canvas = divRef.current.appendChild(renderer.domElement);

    return () => {
      cancelAnimationFrame(idAnimateFrame);
      divRef.current?.removeChild(canvas);
    };
  }, [divRef]);

  // 聚焦展示某一层
  const onShowOneFloor = (floor: MyTypes.FloorInfo) => {
    const model = scene.children.find((c) => c.name === "MODEL");
    if (model === undefined) {
      return;
    }

    const floorName = `FLOOR-${floor.num}`;
    model.children.forEach((c) => {
      c.visible = c.name === floorName;
    });
  };

  // 恢复默认展示
  const onReloadView = () => {
    const model = scene.children.find((c) => c.name === "MODEL");
    if (model === undefined) {
      return;
    }

    model.children.forEach((c) => {
      c.visible = true;
    });
  };

  // 重新建模
  useEffect(() => {
    const model = scene.children.find((c) => c.name === "MODEL");

    // 删除已有模型
    if (model !== undefined) {
      scene.remove(model);
    }

    // 重新建模并加入到场景
    const newModel = buildModel(projectParams, floors);
    scene.add(newModel);
  }, [projectParams, floors]);

  return (
    <div className={styles.root}>
      <div className={styles.three} ref={divRef}></div>
      <Card
        title={`${curProject.name} - ${curProject.address}`}
        className={styles.card}
      >
        <Divider orientation="left">项目参数设置</Divider>
        <Form
          className={styles.projectParams}
          size="small"
          labelCol={{ span: 12 }}
          wrapperCol={{ span: 12 }}
          onFinish={(projectParams: MyTypes.ProjectParams) => {
            setProjectParams({ ...projectParams });
          }}
        >
          <Form.Item
            name="wallThick"
            label="墙占位厚度（cm）"
            rules={[{ required: true }]}
            initialValue={40}
          >
            <InputNumber style={{ width: "75%" }} placeholder="墙占位厚度" />
          </Form.Item>
          <Form.Item
            name="floorThick"
            label="楼板占位厚（cm）"
            rules={[{ required: true }]}
            initialValue={50}
          >
            <InputNumber style={{ width: "75%" }} placeholder="楼板占位厚" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className={styles.projectParamsSubmitButton}
          >
            更新项目参数
          </Button>
        </Form>
        <Divider orientation="left">楼层参数设置</Divider>
        <div className={styles.floorsWrapper}>
          {[...floors]
            .sort((a, b) => {
              return b.num - a.num;
            })
            .map((f) => {
              return (
                <div key={f.num} className={styles.floorInfo}>
                  <div className={styles.floorInfoDisplay}>
                    <div
                      className={styles.floorInfoTitle}
                    >{`第 ${f.num} 层`}</div>
                    <div
                      className={styles.floorInfoText}
                    >{`层高: ${f.height} cm`}</div>
                  </div>
                  <div className={styles.floorInfoViewButton}>
                    <div
                      className={styles.floorInfoViewButtonText}
                      onClick={() => {
                        onShowOneFloor(f);
                      }}
                    >
                      聚焦显示
                    </div>
                    <div className={styles.floorInfoSpace} />
                  </div>
                  <div className={styles.floorInfoSettingButton}>
                    <div
                      className={styles.floorInfoSettingButtonText}
                      onClick={() => {
                        setCurFloor({ ...f });
                        setOpenModal(true);
                      }}
                    >
                      单层设置
                    </div>
                    <div className={styles.floorInfoSpace} />
                  </div>
                </div>
              );
            })}
        </div>

        <div className={styles.floorAddButtonWrapper}>
          <Button
            type="primary"
            size="small"
            className={styles.floorAddButton}
            onClick={() => {
              const nextNum = Math.max(...floors.map((f) => f.num)) + 1;
              setFloors([
                ...floors,
                {
                  height: 300,
                  rooms: [],
                  num: nextNum,
                },
              ]);
            }}
          >
            添加楼层
          </Button>
        </div>
      </Card>
      <FloatButton
        icon={<ReloadOutlined />}
        type="primary"
        onClick={onReloadView}
      />
      <FloorInfoModal />
    </div>
  );
};

export default DetailPage;
