# 72crm-11-WEB

#### 介绍
悟空软件长期为企业提供企业管理软件(CRM/HRM/OA/ERP等)的研发、实施、营销、咨询、培训、服务于一体的信息化服务。悟空软件以高科技为起点，以技术为核心、以完善的售后服务为后盾，秉承稳固与发展、求实与创新的精神，已为国内外上千家企业提供服务。

悟空的发展受益于开源，也会回馈于开源。2020年，悟空CRM会继续秉承“拥抱开放、合作共赢、创造价值”的理念，在开源的道路上继续砥砺前行，和更多的社区开发者一起为国内外开源做出积极贡献。 


#### 项目目录
``` lua
├── build -- webpack 配置文件
├── config -- 项目配置文件
├── src -- 源码目录
│   ├── api -- axios请求接口
│   ├── assets -- 静态图片资源文件
│   ├── components -- 通用组件
│   ├── directives -- 通用指令
│   ├── filters -- 通用过滤器
│   ├── mixins -- 通用混入
│   ├── router -- vue-router路由配置
│   ├── store -- vuex状态管理
│   ├── styles -- 全局css样式
│   ├── utils -- 工具类
│   └── views -- 前端页面
│       ├── addressBook -- 通讯录
│       ├── admin -- 系统管理
│       ├── bi -- 商业智能
│       ├── calendar -- 日历
│       ├── crm -- 客户管理
│       ├── email -- 邮箱
│       ├── hrm -- 人力资源
│       ├── jxc -- 进销存
│       ├── knowledge -- 知识库
│       ├── layout -- 模块框架
│       ├── login -- 登录
│       ├── oa -- 办公
│       ├── pm -- 项目管理
│       ├── taskExamine -- 任务审批
│       ├── user -- 个人中心
│       └── workLog -- 工作日志
└── static -- 静态资源
```

#### 项目运行

- 下载node并安装(LTS)：https://nodejs.org/;
- 该项目为前后端分离项目，本地访问需搭建后台环境，请参考[后端项目](https://gitee.com/wukongcrm/crm_pro);
- 访问线上接口无需搭建后台环境，只需将config/index.js文件中的dev下的proxyTable中的target改为线上地址即可;
- 克隆源代码到本地，使用VSCode打开，并搜索”百度key“，将其替换为自己申请的。申请地址：[百度key](http://lbsyun.baidu.com/index.php?title=jspopularGL/guide/getkey);
- 执行 npm install，下载相关依赖;
- 执行 npm run dev，运行项目;
- 执行成功，即可访问http://localhost:8090，查看悟空CRM;

#### 项目打包

- 需将config/prod.env.js文件中的BASE_API，调整为自己需要的
- 执行 npm run build
- 打包完成，将自动生成dist文件夹


#### 技术栈

| 技术 | 说明 | 版本 |
| --- | --- | --- |
| [Vue](https://vuejs.org) | 框架 | 2.5.17 |
| [Vue-router](https://router.vuejs.org) | 路由框架 | 3.0.1 |
| [Vuex](https://vuex.vuejs.org) | 全局状态管理框架 | 3.0.1 |
| [Element](https://element.eleme.io) | UI框架 | 2.12.0 |
| [Axios](https://github.com/axios/axios) | HTTP框架 | 0.18.0 |

