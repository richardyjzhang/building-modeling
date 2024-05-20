import React, { useEffect, useState, useContext } from "react";
import { history } from "umi";
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Col,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { initProjects } from "@/layouts/data";
import { ProjectContext } from "@/layouts/index";
import styles from "./index.less";

// 项目管理页面

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<MyTypes.Project[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [curProject, setCurProject] = useState<MyTypes.Project | undefined>(
    undefined
  );

  const { setCurProject: setGlobalCurrentProject } = useContext(ProjectContext);

  useEffect(() => {
    setProjects([...initProjects]);
  }, []);

  // 新增编辑弹窗
  const AddEditModal = () => {
    const onFormFinished = async (project: MyTypes.Project) => {
      setModalOpen(false);
      if (!!curProject) {
        // 编辑流程
        const newProjects = projects.map((p) => {
          if (p.id !== curProject.id) {
            return p;
          } else {
            return { ...project, id: curProject.id };
          }
        });
        setProjects(newProjects);
      } else {
        // 新增流程
        const ids = projects.map((p) => p.id);
        const id = Math.max(...ids) + 1;
        setProjects([
          ...projects,
          {
            ...project,
            id: id,
          },
        ]);
      }
    };

    return (
      <Modal
        className={styles.addEditModal}
        open={modalOpen}
        title={`${!!curProject ? "编辑工程" : "新增工程"}`}
        footer={null}
        onCancel={() => {
          setModalOpen(false);
          setCurProject(undefined);
        }}
      >
        <div className={styles.addEditForm}>
          <Divider />
          <Form onFinish={onFormFinished}>
            <Form.Item
              name="name"
              label="工程名称"
              rules={[{ required: true }]}
              initialValue={curProject?.name}
            >
              <Input placeholder="工程名称" />
            </Form.Item>
            <Form.Item
              name="floors"
              label="建筑层数"
              rules={[{ required: true }]}
              initialValue={curProject?.floors}
            >
              <InputNumber placeholder="建筑层数" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="buildingType"
              label="建筑功能"
              rules={[{ required: true }]}
              initialValue={curProject?.buildingType}
            >
              <Input placeholder="建筑功能" />
            </Form.Item>
            <Form.Item
              name="address"
              label="项目地址"
              rules={[{ required: true }]}
              initialValue={curProject?.address}
            >
              <Input placeholder="项目地址" />
            </Form.Item>
            <Form.Item
              name="description"
              label="项目说明"
              rules={[{ required: true }]}
              initialValue={curProject?.description}
            >
              <Input.TextArea placeholder="项目说明" showCount />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className={styles.addEditButton}
            >
              确认
            </Button>
          </Form>
        </div>
      </Modal>
    );
  };

  return (
    <div className={styles.root}>
      <Row gutter={[12, 12]} justify="start">
        {projects.map((p) => {
          return (
            <Col span={6} className={styles.col}>
              <Card
                className={styles.card}
                key={p.id}
                title={p.name}
                bordered={false}
                actions={[
                  <div
                    onClick={() => {
                      setGlobalCurrentProject(p);
                      history.push("/detail");
                    }}
                  >
                    <EyeOutlined key="detail" />
                    <span className={styles.cardActionText}>查看</span>
                  </div>,
                  <div
                    onClick={() => {
                      setCurProject({ ...p });
                      setModalOpen(true);
                    }}
                  >
                    <EditOutlined key="edit" />
                    <span className={styles.cardActionText}>编辑</span>
                  </div>,
                  <Popconfirm
                    title="是否删除本工程"
                    description="删除本工程数据及三维模型，将无法恢复"
                    onConfirm={() => {
                      const newProjects = projects.filter(
                        (proj) => proj.id !== p.id
                      );
                      setProjects(newProjects);
                    }}
                    okText="确认删除"
                    cancelText="取消删除"
                  >
                    <div>
                      <DeleteOutlined key="delete" />
                      <span className={styles.cardActionText}>删除</span>
                    </div>
                  </Popconfirm>,
                ]}
              >
                <div className={styles.cardContent}>
                  <div
                    className={styles.cardText}
                  >{`建筑层数  ${p.floors}层`}</div>
                  <div className={styles.cardText}>
                    {`建筑功能  ${p.buildingType}`}
                  </div>
                  <div
                    className={styles.cardText}
                  >{`项目地址  ${p.address}`}</div>
                  <div className={styles.cardText}>{`${p.description}`}</div>
                </div>
              </Card>
            </Col>
          );
        })}
        <Col span={6} className={styles.col}>
          <Card className={styles.addCard} bordered={false}>
            <div
              className={styles.addCardBody}
              onClick={() => {
                setCurProject(undefined);
                setModalOpen(true);
              }}
            >
              <PlusOutlined className={styles.addButton} />
              <div>新增项目</div>
            </div>
          </Card>
        </Col>
      </Row>
      <AddEditModal />
    </div>
  );
};

export default ProjectsPage;
