# 悟空CRM-11.0


## 悟空CRM介绍


悟空CRM在中国的开源管理软件行业有较高的知名度。目前软件已达到千万级的用户量，开源系统下载量达到200多万次，已覆盖设计制造业、服务业、金融业、政府机构等多种行业。与阿里巴巴、腾讯、OPPO、航天信息、CCTV等多家知名企业达成战略合作。

公司先后获得河南省高新技术企业、国家3A信用企业、IOS9001软件产品认证等20多项荣誉奖项。拥有50余项软件著作权。 获得20余家国内媒体报道。公司自成立以来，以高科技为起点，以技术为核心、 以完善的售后服务为后盾，秉承稳固与发展、求实与创新的精神，已为国内外上万家企业提供了服务。 在为实现企业价值最大化的过程中， 实现了自身的价值的提升，取得了最大程度的双赢合作，并获得了社会各界的广泛赞誉和认同。

官网地址：[http://www.5kcrm.com](http://www.5kcrm.com/)

演示地址：(https://demo10.72crm.com/#/crm)  
帐号：18688888888   密码：123456a


QQ群交流群⑩群：[1026560336](http:////shang.qq.com/wpa/qunwpa?idkey=13d5e5809eb9feb350336e55c8b7a00b9cb472078b09b4441222a52dd76b278e)


扫码添加小悟官方客服微信，邀您加入千人微信交流群：

<img src="https://images.gitee.com/uploads/images/2019/1231/115927_f9c580c8_345098.png" width="200">

关注悟空CRM公众号，了解更多悟空资讯

<img src="https://images.gitee.com/uploads/images/2019/1202/135713_d3566c6a_345098.jpeg" width="200">



```

注：悟空CRM采用全新的前后端分离模式，本仓库代码中已集成前端vue打包后文件，可免去打包操作。如需调整前端代码，请单独下载前端代码

```

(<a href="https://gitee.com/wukongcrm/crm_pro" target="_blank">查看JAVA后端仓库</a>) 


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

#### 更新日志

<a href="https://www.72crm.com/upgrade_log" target="_blank">点击查看更新日志</a>

### 悟空CRM功能模块预览


![输入图片说明](https://images.gitee.com/uploads/images/2020/0928/172541_efed65bd_345098.png "01.png")
![输入图片说明](https://images.gitee.com/uploads/images/2020/0928/172557_c001d047_345098.png "02.png")
![输入图片说明](https://images.gitee.com/uploads/images/2020/0928/172612_97363074_345098.png "03.png")
![输入图片说明](https://images.gitee.com/uploads/images/2020/0928/172625_47a2798b_345098.png "04.png")
![输入图片说明](https://images.gitee.com/uploads/images/2020/0928/172636_ae5cad59_345098.png "05.png")
![输入图片说明](https://images.gitee.com/uploads/images/2020/0928/172648_c7928c60_345098.png "06.png")
![输入图片说明](https://images.gitee.com/uploads/images/2020/0928/172704_ac4c3308_345098.png "07.png")
![输入图片说明](https://images.gitee.com/uploads/images/2020/0928/172714_84b7ee29_345098.png "08.png")
![输入图片说明](https://images.gitee.com/uploads/images/2020/0928/172726_4552bddb_345098.png "10.png")
![输入图片说明](https://images.gitee.com/uploads/images/2020/0928/172736_da77deec_345098.png "11.png")
![输入图片说明](https://images.gitee.com/uploads/images/2020/0928/172745_e22b7a4a_345098.png "12.png")