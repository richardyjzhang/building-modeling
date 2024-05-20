import { createContext, useState } from "react";
import { Outlet, history } from "umi";
import { ConfigProvider, Dropdown } from "antd";
import { initProjects } from "./data";
import styles from "./index.css";

// 项目信息
export const ProjectContext = createContext({
  curProject: initProjects[0],
  setCurProject: (_: MyTypes.Project) => {},
});

export default function Layout() {
  // 右上角用户名的下拉菜单选项
  const userMenuItems = [
    {
      key: "editPassword",
      label: "修改密码",
      onClick: () => {
        console.log("TODO: 修改密码");
      },
    },
    {
      key: "logout",
      label: "退出登录",
      onClick: () => {
        history.push("/login");
      },
    },
  ];

  // 当前项目
  const [curProject, setCurProject] = useState(initProjects[0]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#B3200A",
        },
      }}
    >
      <ProjectContext.Provider value={{ curProject, setCurProject }}>
        <div className={styles.root}>
          <nav className={styles.nav}>
            <img className={styles.icon} src="icon.png" />
            <div className={styles.title}>建筑参数化轻量级建模</div>
            <div className={styles.space} />
            <div>
              <Dropdown menu={{ items: userMenuItems }}>
                <div className={styles.userName}>管理员</div>
              </Dropdown>
            </div>
          </nav>
          <main className={styles.main}>
            <Outlet />
          </main>
        </div>
      </ProjectContext.Provider>
    </ConfigProvider>
  );
}
